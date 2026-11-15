-- =====================================================================
-- CAPICÚA — Schema Maestro PostgreSQL / Supabase
-- Versión: 3.0.0
-- Módulos: Usuarios, Perfiles, Contenido, Evaluaciones, Progreso,
--          Gamificación, Membresías, Pagos, IA Capi y Social.
-- =====================================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. USUARIOS Y PERFILES (Extiende Supabase auth.users)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
    preferred_grade TEXT,
    preferences JSONB DEFAULT '{"sound": true, "music": true, "motion": false, "theme": "dark"}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ---------------------------------------------------------------------
-- 2. PROGRESO DEL ESTUDIANTE Y GAMIFICACIÓN
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    pi_coins INTEGER NOT NULL DEFAULT 0 CHECK (pi_coins >= 0),
    streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    last_streak_at TIMESTAMPTZ,
    shields_remaining INTEGER NOT NULL DEFAULT 0,
    current_mentor TEXT DEFAULT 'arquimedes',
    avatar_config JSONB DEFAULT '{"pelo":"p0","ropa":"r0","acc":"a0","color":"#6342ff"}'::jsonb,
    pet_config JSONB DEFAULT '{"type":"buho","name":"Arquímedes","level":1}'::jsonb,
    inventory JSONB DEFAULT '{"curitas": 2, "vendas": 0, "shields": 0, "items": []}'::jsonb,
    bosses_defeated JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    state_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_student_progress_user ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_xp ON public.student_progress(xp DESC);

-- ---------------------------------------------------------------------
-- 3. CONTENIDO EDUCATIVO Y LECCIONES COMPLETADAS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon TEXT,
    difficulty_level TEXT DEFAULT 'intermedio',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.completed_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    region_id TEXT NOT NULL,
    stars INTEGER NOT NULL DEFAULT 1 CHECK (stars BETWEEN 1 AND 3),
    score INTEGER NOT NULL DEFAULT 100,
    attempts INTEGER NOT NULL DEFAULT 1,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_completed_lessons_user ON public.completed_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_region ON public.completed_lessons(region_id);

-- ---------------------------------------------------------------------
-- 4. EVALUACIONES, DIAGNÓSTICOS Y SIMULACROS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evaluations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('diagnostico', 'simulacro', 'parcial', 'quiz')),
    subject TEXT NOT NULL,
    time_limit_minutes INTEGER NOT NULL DEFAULT 30,
    question_count INTEGER NOT NULL DEFAULT 10,
    passing_score INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.evaluation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    evaluation_id TEXT NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    incorrect_count INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    answers_detail JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_eval_attempts_user ON public.evaluation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_eval_attempts_eval ON public.evaluation_attempts(evaluation_id);

-- ---------------------------------------------------------------------
-- 5. MEMBRESÍAS Y PLANES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    icon TEXT NOT NULL,
    border_color TEXT NOT NULL,
    price_cop_monthly INTEGER NOT NULL DEFAULT 0,
    price_cop_semestral INTEGER NOT NULL DEFAULT 0,
    price_cop_annual INTEGER NOT NULL DEFAULT 0,
    price_usd_monthly NUMERIC(6,2) NOT NULL DEFAULT 0,
    perks JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Seed de planes oficiales de CAPICÚA
INSERT INTO public.plans (id, name, tag, icon, border_color, price_cop_monthly, price_cop_semestral, price_cop_annual, price_usd_monthly, perks, is_active, display_order)
VALUES
('orbita', 'Órbita', 'PARA SIEMPRE', '🌍', '#6342ff', 0, 0, 0, 0.00, '[
  "Los 12 mundos, lecciones y jefes",
  "Capi tutora, mentores y diagnóstico",
  "Combate, cofres e insignias de juego",
  "Laboratorios, tarjetas y aula",
  "1 simulacro de parcial por semana",
  "12 tarjetas de repaso por sesión"
]'::jsonb, true, 1),

('chispa', 'Chispa', 'PARA EMPEZAR', '✨', '#00bfff', 1900, 9690, 16000, 0.50, '[
  "Simulacros de parcial ilimitados (10 preguntas)",
  "20 tarjetas de repaso por sesión",
  "Multiplicador de victoria x1.25",
  "1 escudo de racha cada semana",
  "Línea de vida +10 PV y botiquín semanal (2 curitas)",
  "Insignia Chispa y aro celeste en perfil",
  "100 monedas π cada mes"
]'::jsonb, true, 2),

('cometa', 'Cometa', 'LA MÁS ELEGIDA', '☄️', '#ff6b9d', 3900, 19890, 32800, 1.00, '[
  "Todo lo del plan Chispa",
  "Simulacros de hasta 20 preguntas",
  "Informe de falencias con solución paso a paso",
  "30 tarjetas de repaso por sesión",
  "Multiplicador de victoria x1.5",
  "Segunda oportunidad: 1 recuperación diaria de vida al límite",
  "2 escudos de racha semanales",
  "Botiquín semanal: 3 curitas y 1 venda",
  "Tu mentor bloquea 1 ataque extra por lección",
  "Línea de vida +25 PV e insignia Cometa con aro rosa"
]'::jsonb, true, 3),

('nova', 'Nova', 'TODO CAPICÚA', '🌟', '#ffd700', 6900, 35190, 58000, 1.80, '[
  "Todo lo del plan Cometa",
  "Simulacros de hasta 30 preguntas",
  "Plan de repaso inteligente automático basado en debilidades",
  "Multiplicador de victoria x2",
  "Segunda oportunidad hasta 3 veces al día",
  "3 escudos de racha semanales",
  "Botiquín completo: 4 curitas y 2 vendas",
  "Tu mentor bloquea 2 ataques extra por lección",
  "Cofre de lección con mejora de rareza garantizada",
  "Línea de vida +40 PV e insignia Nova con aro dorado"
]'::jsonb, true, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  icon = EXCLUDED.icon,
  border_color = EXCLUDED.border_color,
  price_cop_monthly = EXCLUDED.price_cop_monthly,
  price_cop_semestral = EXCLUDED.price_cop_semestral,
  price_cop_annual = EXCLUDED.price_cop_annual,
  perks = EXCLUDED.perks;

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id),
    billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'semestral', 'annual')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_active_sub UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON public.subscriptions(status);

-- ---------------------------------------------------------------------
-- 6. PAGOS Y AUDITORÍA DE TRANSACCIONES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id),
    billing_period TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    amount_cop NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'COP',
    gateway TEXT NOT NULL CHECK (gateway IN ('wompi', 'stripe', 'mercadopago', 'paypal', 'simulado')),
    payment_method TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'CO',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'voided', 'error')),
    gateway_transaction_id TEXT,
    gateway_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL,
    event_id TEXT,
    event_type TEXT,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway_event ON public.webhook_events(gateway, event_id);

-- ---------------------------------------------------------------------
-- 7. CAPI IA: HISTORIAL DE CONVERSACIONES Y CONTEXTO
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.capi_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL DEFAULT 'Consulta matemática',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.capi_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.capi_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'capi')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_capi_messages_conv ON public.capi_messages(conversation_id, created_at ASC);

-- ---------------------------------------------------------------------
-- 8. FORO Y COMUNIDAD
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'duda' CHECK (kind IN ('duda', 'aporte', 'reto')),
    helpful_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_solution BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_subject ON public.forum_threads(subject);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id);

-- ---------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) - PROTECCIÓN OBLIGATORIA
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capi_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capi_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles:
CREATE POLICY "Profiles son legibles por cualquier usuario autenticado"
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Los usuarios solo pueden editar su propio perfil"
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Políticas de Progreso:
CREATE POLICY "El estudiante solo lee su propio progreso"
    ON public.student_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "El estudiante actualiza su propio progreso"
    ON public.student_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "El estudiante inserta su registro inicial de progreso"
    ON public.student_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Políticas de Lecciones Completadas:
CREATE POLICY "El estudiante lee sus lecciones completadas"
    ON public.completed_lessons FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "El estudiante registra lecciones completadas"
    ON public.completed_lessons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Políticas de Evaluaciones:
CREATE POLICY "Todos los estudiantes leen evaluaciones activas"
    ON public.evaluations FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "El estudiante lee sus propios intentos de examen"
    ON public.evaluation_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "El estudiante registra intentos de examen"
    ON public.evaluation_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Políticas de Planes:
CREATE POLICY "Los planes activos son públicos para lectura"
    ON public.plans FOR SELECT TO authenticated, anon USING (is_active = true);

-- Políticas de Suscripciones y Pagos (Seguridad Alta):
CREATE POLICY "El usuario solo lee sus suscripciones"
    ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "El usuario solo lee sus pagos"
    ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Solo el rol de servicio (backend) puede insertar/actualizar pagos y suscripciones
-- (service_role omite RLS automáticamente en Supabase)

-- Políticas de Capi IA:
CREATE POLICY "El usuario solo lee sus conversaciones con Capi"
    ON public.capi_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "El usuario crea sus conversaciones con Capi"
    ON public.capi_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "El usuario lee mensajes de sus conversaciones"
    ON public.capi_messages FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.capi_conversations WHERE id = conversation_id AND user_id = auth.uid()));

CREATE POLICY "El usuario agrega mensajes a sus conversaciones"
    ON public.capi_messages FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.capi_conversations WHERE id = conversation_id AND user_id = auth.uid()));

-- Políticas de Foro:
CREATE POLICY "Todos los autenticados leen hilos de foro"
    ON public.forum_threads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados crean hilos en foro"
    ON public.forum_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Todos los autenticados leen respuestas de foro"
    ON public.forum_replies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados responden en foro"
    ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- ---------------------------------------------------------------------
-- 10. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ---------------------------------------------------------------------
-- Crea automáticamente el perfil y el registro de progreso cuando un usuario se registra en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    clean_username text;
BEGIN
    clean_username := COALESCE(
        new.raw_user_meta_data->>'username',
        split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)
    );

    INSERT INTO public.profiles (id, username, email, full_name, avatar_url)
    VALUES (
        new.id,
        clean_username,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', clean_username),
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.student_progress (user_id, level, xp, pi_coins, streak_days)
    VALUES (new.id, 1, 0, 50, 1)
    ON CONFLICT (user_id) DO NOTHING;

    -- Asigna automáticamente plan gratuito Órbita
    INSERT INTO public.subscriptions (user_id, plan_id, billing_period, status, current_period_end)
    VALUES (new.id, 'orbita', 'monthly', 'active', timezone('utc'::text, now()) + interval '100 years')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función RPC para otorgar XP y Monedas Pi de forma atómica y segura
CREATE OR REPLACE FUNCTION public.award_student_rewards(
    p_xp integer,
    p_pi integer,
    p_reason text DEFAULT 'activity'
)
RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_current_xp integer;
    v_current_pi integer;
    v_current_lvl integer;
    v_new_lvl integer;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No autenticado';
    END IF;

    UPDATE public.student_progress
    SET 
        xp = xp + GREATEST(p_xp, 0),
        pi_coins = pi_coins + GREATEST(p_pi, 0),
        level = GREATEST(1, FLOOR(1 + SQRT((xp + GREATEST(p_xp, 0)) / 100.0))::integer),
        updated_at = timezone('utc'::text, now())
    WHERE user_id = v_user_id
    RETURNING xp, pi_coins, level INTO v_current_xp, v_current_pi, v_new_lvl;

    RETURN jsonb_build_object(
        'ok', true,
        'xp', v_current_xp,
        'pi_coins', v_current_pi,
        'level', v_new_lvl
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
