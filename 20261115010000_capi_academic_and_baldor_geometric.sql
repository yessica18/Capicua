-- =====================================================================
-- CAPICÚA 888 — Migración: Capi IA Académica y Asignatura Unificada
-- «Álgebra de Baldor y Geométrica» + Sistema Relacional de Conversaciones
-- =====================================================================

-- 1. EXTENDER TABLAS DE CURSOS Y CONTENIDOS EDUCATIVOS SI NO EXISTEN
CREATE TABLE IF NOT EXISTS public.academic_courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'secundaria_universidad',
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.academic_units (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.academic_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.academic_lessons (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES public.academic_units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    algebraic_explanation TEXT NOT NULL,
    geometric_proof TEXT NOT NULL,
    solved_example TEXT NOT NULL,
    practice_exercise TEXT NOT NULL,
    practice_options JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER DEFAULT 0
);

-- RLS para lectura pública de cursos, unidades y lecciones
ALTER TABLE public.academic_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_lessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura publica de academic_courses') THEN
        CREATE POLICY "Lectura publica de academic_courses" ON public.academic_courses FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura publica de academic_units') THEN
        CREATE POLICY "Lectura publica de academic_units" ON public.academic_units FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura publica de academic_lessons') THEN
        CREATE POLICY "Lectura publica de academic_lessons" ON public.academic_lessons FOR SELECT USING (true);
    END IF;
END $$;

-- 2. INSERTAR ASIGNATURA UNIFICADA: «Álgebra de Baldor y Geométrica»
INSERT INTO public.academic_courses (id, name, description, level, icon, order_index)
VALUES (
    'algebra-baldor-geom',
    'Álgebra de Baldor y Geométrica',
    'Unificación integral del Álgebra clásica de Aurelio Baldor con razonamiento, interpretación y demostraciones geométricas paso a paso, desde nivel básico hasta matemáticas universitarias.',
    'secundaria_universidad',
    'x²',
    1
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Insertar Unidades de Álgebra de Baldor y Geométrica
INSERT INTO public.academic_units (id, course_id, title, description, order_index)
VALUES 
(
    'unit-baldor-u1',
    'algebra-baldor-geom',
    'Unidad 1: Notación de Baldor, Monomios y Segmentos Unidimensionales',
    'Cantidades positivas y negativas en la recta numérica real, términos semejantes y operaciones fundamentales.',
    1
),
(
    'unit-baldor-u2',
    'algebra-baldor-geom',
    'Unidad 2: Productos Notables y Demostraciones por Áreas Planas',
    'El cuadrado del binomio (a+b)², el producto (a+b)(a-b) y su equivalencia geométrica con rectángulos y cuadrados.',
    2
),
(
    'unit-baldor-u3',
    'algebra-baldor-geom',
    'Unidad 3: Factorización y Disección de Figuras Geométricas',
    'Descomposición factorial de Baldor mediante el ensamblado de mosaicos algebraicos y rectángulos congruentes.',
    3
),
(
    'unit-baldor-u4',
    'algebra-baldor-geom',
    'Unidad 4: Ecuaciones Lineales y Rectas en el Plano Cartesiano',
    'Resolución de ecuaciones de primer grado con la balanza de Baldor y la interpretación de la pendiente e intercepto.',
    4
),
(
    'unit-baldor-u5',
    'algebra-baldor-geom',
    'Unidad 5: Ecuaciones Cuadráticas y Completación Geométrica de Al-Jwarizmi',
    'Resolución de la ecuación x² + bx = c construyendo un cuadrado perfecto con gnomones geométricos.',
    5
),
(
    'unit-baldor-u6',
    'algebra-baldor-geom',
    'Unidad 6: Cubos de Binomios y Volúmenes Tridimensionales',
    'Demostración visual de (a+b)³ = a³ + 3a²b + 3ab² + b³ a través de la partición de un cubo en 8 prismas 3D.',
    6
),
(
    'unit-baldor-u7',
    'algebra-baldor-geom',
    'Unidad 7: Sistemas de Ecuaciones Lineales e Intersección Geométrica',
    'Sistemas 2x2 y 3x3 resueltos algebraicamente y visualizados como la intersección de rectas en el plano o planos en el espacio.',
    7
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- Insertar Lecciones representativas con demostración visual
INSERT INTO public.academic_lessons (id, unit_id, title, algebraic_explanation, geometric_proof, solved_example, practice_exercise, practice_options, correct_option_index, order_index)
VALUES
(
    'les-baldor-prod-notable',
    'unit-baldor-u2',
    'Cuadrado de la Suma: (a + b)²',
    'Algebraicamente, el cuadrado de un binomio es igual al cuadrado del primer término más el doble producto del primero por el segundo más el cuadrado del segundo: (a+b)(a+b) = a² + ab + ba + b² = a² + 2ab + b².',
    'Geométricamente, dibuja un cuadrado de lado (a + b). Su área total es (a + b)². Al dividir los lados en segmentos a y b, el cuadrado se divide en cuatro regiones: un cuadrado grande de área a², dos rectángulos idénticos de área ab cada uno, y un cuadrado pequeño de área b². La suma de las 4 partes es a² + 2ab + b².',
    'Desarrollar (2x + 3)². Primer término al cuadrado: (2x)² = 4x². Doble producto: 2(2x)(3) = 12x. Segundo término al cuadrado: 3² = 9. Resultado: 4x² + 12x + 9.',
    'Si un terreno cuadrado de lado x se amplía 5 metros en ambos sentidos, ¿cuál es la expresión de su nueva área total?',
    '["x² + 10x + 25", "x² + 25", "x² + 5x + 25", "2x + 10"]'::jsonb,
    0,
    1
),
(
    'les-baldor-dif-cuadrados',
    'unit-baldor-u2',
    'Diferencia de Cuadrados: a² - b²',
    'La suma de dos cantidades multiplicada por su diferencia es igual a la diferencia de sus cuadrados: (a + b)(a - b) = a² - b².',
    'Geométricamente, toma un cuadrado de lado a (área a²) y retírale una esquina cuadrada de lado b (área b²). La figura en forma de L resultante tiene área a² - b². Si cortas la L verticalmente y reacomodas el rectángulo inferior al lado del superior, obtienes un rectángulo perfecto de base (a + b) y altura (a - b).',
    'Factorizar 9x² - 16. Raíz cuadrada de 9x² es 3x. Raíz de 16 es 4. Por lo tanto: (3x + 4)(3x - 4).',
    '¿Cuál es la factorización geométrica de la expresión 25y² - 49?',
    '["(5y + 7)(5y - 7)", "(5y - 7)²", "(25y + 1)(y - 49)", "(5y + 49)(5y - 1)"]'::jsonb,
    0,
    2
),
(
    'les-baldor-completar-cuadrado',
    'unit-baldor-u5',
    'Completación del Cuadrado de Al-Jwarizmi',
    'Para resolver x² + bx = c, convertimos el lado izquierdo en un trinomio cuadrado perfecto sumando (b/2)² a ambos miembros: (x + b/2)² = c + (b/2)², lo que permite despejar x aplicando raíz cuadrada.',
    'Geométricamente, Al-Jwarizmi representaba x² como un cuadrado de lado x. El término bx se dividía en dos rectángulos de dimensiones x por (b/2), adosados a la derecha y arriba del cuadrado x². Para completar la esquina faltante y formar un cuadrado gigante de lado (x + b/2), se requiere añadir exactamente un cuadrado de lado (b/2), cuya área es (b/2)²',
    'Resolver x² + 6x = 16. Coeficiente b = 6, entonces b/2 = 3. Sumamos 3² = 9 a ambos lados: x² + 6x + 9 = 25. Factorizamos el cuadrado: (x + 3)² = 25. Sacamos raíz: x + 3 = ±5. x₁ = 2, x₂ = -8.',
    '¿Qué valor debe sumarse a la expresión x² + 8x para completar un cuadrado geométrico perfecto?',
    '["16", "8", "64", "4"]'::jsonb,
    0,
    1
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    algebraic_explanation = EXCLUDED.algebraic_explanation,
    geometric_proof = EXCLUDED.geometric_proof,
    solved_example = EXCLUDED.solved_example,
    practice_exercise = EXCLUDED.practice_exercise,
    practice_options = EXCLUDED.practice_options,
    correct_option_index = EXCLUDED.correct_option_index;

-- 3. TABLA DE CONVERSACIONES CON CAPI IA (Persistencia e Historial por Usuario)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Consulta con Capi',
    mode TEXT NOT NULL DEFAULT 'aprender' CHECK (mode IN ('aprender', 'resolver', 'practicar', 'evaluar', 'corregir', 'repasar', 'preparar_examen')),
    course_context TEXT DEFAULT 'algebra-baldor-geom',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id, updated_at DESC);

-- TABLA DE MENSAJES DE CONVERSACIÓN
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'capi')),
    text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id, created_at ASC);

-- RLS: Seguridad estricta en conversaciones y mensajes (Un estudiante jamás ve mensajes de otro)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Estudiantes leen sus propias conversaciones') THEN
        CREATE POLICY "Estudiantes leen sus propias conversaciones"
            ON public.conversations FOR SELECT TO authenticated
            USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Estudiantes crean sus propias conversaciones') THEN
        CREATE POLICY "Estudiantes crean sus propias conversaciones"
            ON public.conversations FOR INSERT TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Estudiantes actualizan sus propias conversaciones') THEN
        CREATE POLICY "Estudiantes actualizan sus propias conversaciones"
            ON public.conversations FOR UPDATE TO authenticated
            USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Estudiantes eliminan sus propias conversaciones') THEN
        CREATE POLICY "Estudiantes eliminan sus propias conversaciones"
            ON public.conversations FOR DELETE TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Estudiantes leen sus propios mensajes') THEN
        CREATE POLICY "Estudiantes leen sus propios mensajes"
            ON public.messages FOR SELECT TO authenticated
            USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Estudiantes insertan sus propios mensajes') THEN
        CREATE POLICY "Estudiantes insertan sus propios mensajes"
            ON public.messages FOR INSERT TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 4. RPCs SEGURAS PARA CONVERSACIONES
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
    p_title text DEFAULT 'Consulta con Capi',
    p_mode text DEFAULT 'aprender',
    p_course text DEFAULT 'algebra-baldor-geom'
)
RETURNS jsonb AS $$
DECLARE
    v_user_id UUID;
    v_conv_id UUID;
    v_result jsonb;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Autenticación requerida para gestionar conversaciones';
    END IF;

    -- Validar modo
    IF p_mode NOT IN ('aprender', 'resolver', 'practicar', 'evaluar', 'corregir', 'repasar', 'preparar_examen') THEN
        p_mode := 'aprender';
    END IF;

    INSERT INTO public.conversations (user_id, title, mode, course_context)
    VALUES (v_user_id, p_title, p_mode, p_course)
    RETURNING id INTO v_conv_id;

    SELECT jsonb_build_object(
        'id', id,
        'title', title,
        'mode', mode,
        'course_context', course_context,
        'created_at', created_at
    ) INTO v_result
    FROM public.conversations
    WHERE id = v_conv_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.save_conversation_message(
    p_conversation_id UUID,
    p_sender TEXT,
    p_text TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_msg_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Autenticación requerida para registrar mensajes';
    END IF;

    -- Verificar que la conversación pertenezca al usuario
    IF NOT EXISTS (SELECT 1 FROM public.conversations WHERE id = p_conversation_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Conversación no encontrada o no autorizada';
    END IF;

    INSERT INTO public.messages (conversation_id, user_id, sender, text, metadata)
    VALUES (p_conversation_id, v_user_id, p_sender, p_text, p_metadata)
    RETURNING id INTO v_msg_id;

    UPDATE public.conversations
    SET updated_at = timezone('utc'::text, now())
    WHERE id = p_conversation_id;

    RETURN v_msg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
