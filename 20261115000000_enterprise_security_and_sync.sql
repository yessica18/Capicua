-- =====================================================================
-- CAPICÚA 888 — Migración Enterprise: Seguridad RLS, Idempotencia y Sincronización
-- Versión: 3.5.0
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLA DE IDEMPOTENCIA PARA PAGOS (Previene doble procesamiento)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wompi_processed_events (
    event_id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    reference TEXT NOT NULL,
    status TEXT NOT NULL,
    amount_in_cents BIGINT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wompi_ref ON public.wompi_processed_events(reference);

-- ---------------------------------------------------------------------
-- 2. TABLA DE CONTROL DE CONCURRENCIA Y LOG DE SINCRONIZACIÓN MULTIDISPOSITIVO
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_type TEXT DEFAULT 'web',
    client_timestamp BIGINT NOT NULL,
    server_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    action_type TEXT NOT NULL,
    state_version INTEGER NOT NULL DEFAULT 1,
    checksum TEXT,
    resolved_conflict BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_sync_log_user ON public.sync_log(user_id, client_timestamp DESC);

ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios leen su propio registro de sincronizacion"
    ON public.sync_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuarios insertan eventos de sincronizacion propios"
    ON public.sync_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. TRIGGERS DE SEGURIDAD CONTRA MANIPULACIÓN DEL LADO DEL CLIENTE
-- ---------------------------------------------------------------------

-- A. Proteger la columna 'role' y 'is_active' en public.profiles
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger AS $$
BEGIN
    -- Si no es superadmin o service_role, no se permite cambiar de rol
    IF (auth.jwt()->>'role' IS DISTINCT FROM 'service_role') THEN
        IF (OLD.role IS DISTINCT FROM NEW.role) THEN
            RAISE EXCEPTION 'Acción denegada: No tienes permiso para alterar el rol del usuario.';
        END IF;
        IF (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
            RAISE EXCEPTION 'Acción denegada: No tienes permiso para alterar el estado del usuario.';
        END IF;
    END IF;
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_privileges();

-- B. Proteger XP, Monedas Pi y Nivel contra manipulación directa en student_progress
CREATE OR REPLACE FUNCTION public.protect_progress_tampering()
RETURNS trigger AS $$
BEGIN
    -- Si la consulta proviene del cliente normal con JWT (no service_role ni RPC interna)
    IF (auth.jwt()->>'role' IS DISTINCT FROM 'service_role' AND current_setting('capicua.trusted_rpc', true) IS NULL) THEN
        -- Permitir actualización de campos estéticos (avatar, preferencias, mentor)
        -- pero rechazar si intentan alterar xp, pi_coins o nivel directamente
        IF (NEW.xp > OLD.xp + 500) THEN
            RAISE EXCEPTION 'Acceso denegado: El incremento de XP excede el límite permitido por actividad.';
        END IF;
        IF (NEW.pi_coins > OLD.pi_coins + 300) THEN
            RAISE EXCEPTION 'Acceso denegado: El incremento de Pi Coins excede el límite permitido por actividad.';
        END IF;
        IF (NEW.level > OLD.level + 1) THEN
            RAISE EXCEPTION 'Acceso denegado: No se permite saltar niveles arbitrariamente.';
        END IF;
    END IF;
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_progress_tampering ON public.student_progress;
CREATE TRIGGER trg_protect_progress_tampering
    BEFORE UPDATE ON public.student_progress
    FOR EACH ROW EXECUTE PROCEDURE public.protect_progress_tampering();

-- ---------------------------------------------------------------------
-- 4. FUNCIÓN SEGURA PARA VALIDAR Y OTORGAR PROGRESO DE LECCIÓN
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_lesson_secure(
    p_lesson_id TEXT,
    p_region_id TEXT,
    p_score INTEGER,
    p_stars INTEGER,
    p_time_spent_seconds INTEGER
)
RETURNS jsonb AS $$
DECLARE
    v_user_id UUID;
    v_xp_gain INTEGER;
    v_pi_gain INTEGER;
    v_current_progress RECORD;
    v_new_level INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    -- Validaciones lógicas básicas
    IF p_score < 0 OR p_score > 100 THEN
        RAISE EXCEPTION 'Puntaje inválido.';
    END IF;
    IF p_stars < 1 OR p_stars > 3 THEN
        RAISE EXCEPTION 'Cantidad de estrellas inválida.';
    END IF;

    -- Cálculo seguro de recompensas según desempeño
    v_xp_gain := (p_score * 0.5)::INTEGER + (p_stars * 10);
    v_pi_gain := (p_stars * 5) + (CASE WHEN p_score = 100 THEN 10 ELSE 0 END);

    -- Registrar o actualizar lección completada
    INSERT INTO public.completed_lessons (user_id, lesson_id, region_id, stars, score, attempts, time_spent_seconds, completed_at)
    VALUES (v_user_id, p_lesson_id, p_region_id, p_stars, p_score, 1, p_time_spent_seconds, timezone('utc'::text, now()))
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        stars = GREATEST(completed_lessons.stars, EXCLUDED.stars),
        score = GREATEST(completed_lessons.score, EXCLUDED.score),
        attempts = completed_lessons.attempts + 1,
        time_spent_seconds = completed_lessons.time_spent_seconds + EXCLUDED.time_spent_seconds,
        completed_at = timezone('utc'::text, now());

    -- Actualizar progreso de forma segura usando la variable de contexto de confianza
    PERFORM set_config('capicua.trusted_rpc', 'true', true);

    SELECT * INTO v_current_progress FROM public.student_progress WHERE user_id = v_user_id FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.student_progress (user_id, level, xp, pi_coins, streak_days)
        VALUES (v_user_id, 1, v_xp_gain, 50 + v_pi_gain, 1)
        RETURNING * INTO v_current_progress;
    ELSE
        -- Nivel = 1 + floor(sqrt(xp / 100))
        v_new_level := 1 + FLOOR(SQRT((v_current_progress.xp + v_xp_gain) / 100.0))::INTEGER;

        UPDATE public.student_progress
        SET xp = xp + v_xp_gain,
            pi_coins = pi_coins + v_pi_gain,
            level = GREATEST(level, v_new_level),
            updated_at = timezone('utc'::text, now())
        WHERE user_id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'lesson_id', p_lesson_id,
        'xp_gained', v_xp_gain,
        'pi_gained', v_pi_gain,
        'total_xp', v_current_progress.xp + v_xp_gain,
        'new_level', v_new_level
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
