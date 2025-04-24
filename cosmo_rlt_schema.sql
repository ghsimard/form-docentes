--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Homebrew)
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: FormResponse; Type: TABLE; Schema: public; Owner: ghsimard
--

CREATE TABLE public."FormResponse" (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    school_name character varying(255) NOT NULL,
    years_of_experience character varying(50) NOT NULL,
    teaching_grades_early text[] NOT NULL,
    teaching_grades_late text[] NOT NULL,
    schedule character varying(50) NOT NULL,
    feedback_sources text[] NOT NULL,
    frequency_ratings_7 jsonb NOT NULL,
    frequency_ratings_8 jsonb NOT NULL,
    frequency_ratings_9 jsonb NOT NULL
);


ALTER TABLE public."FormResponse" OWNER TO ghsimard;

--
-- Name: FormResponse_id_seq; Type: SEQUENCE; Schema: public; Owner: ghsimard
--

CREATE SEQUENCE public."FormResponse_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FormResponse_id_seq" OWNER TO ghsimard;

--
-- Name: FormResponse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ghsimard
--

ALTER SEQUENCE public."FormResponse_id_seq" OWNED BY public."FormResponse".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ghsimard
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ghsimard;

--
-- Name: docentes_form_submissions; Type: TABLE; Schema: public; Owner: ghsimard
--

CREATE TABLE public.docentes_form_submissions (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    institucion_educativa character varying(255) NOT NULL,
    anos_como_docente character varying(50) NOT NULL,
    grados_asignados text[] NOT NULL,
    jornada character varying(50) NOT NULL,
    retroalimentacion_de text[] NOT NULL,
    frequency_ratings6 jsonb NOT NULL,
    frequency_ratings7 jsonb NOT NULL,
    frequency_ratings8 jsonb NOT NULL
);


ALTER TABLE public.docentes_form_submissions OWNER TO ghsimard;

--
-- Name: docentes_form_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: ghsimard
--

CREATE SEQUENCE public.docentes_form_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.docentes_form_submissions_id_seq OWNER TO ghsimard;

--
-- Name: docentes_form_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ghsimard
--

ALTER SEQUENCE public.docentes_form_submissions_id_seq OWNED BY public.docentes_form_submissions.id;


--
-- Name: rectores; Type: TABLE; Schema: public; Owner: ghsimard
--

CREATE TABLE public.rectores (
    id integer NOT NULL,
    excel_id text,
    entiendo_la_informacion_y_acepto_el_trato_de_mis_datos_personal boolean,
    nombre_s_y_apellido_s_completo_s text,
    numero_de_cedula integer,
    genero text,
    lugar_de_nacimiento text,
    fecha_de_nacimiento date,
    lengua_materna text,
    numero_de_celular_personal text,
    correo_electronico_personal text,
    correo_electronico_institucional_el_que_usted_usa_en_su_rol_com text,
    prefiere_recibir_comunicaciones_en_el_correo text,
    tiene_alguna_enfermedad_de_base_por_la_que_pueda_requerir_atenc boolean,
    si_requiere_atencion_medica_urgente_durante_algun_encuentro_pre text,
    cual_es_su_numero_de_contacto text,
    tiene_alguna_discapacidad boolean,
    tipo_de_formacion text,
    titulo_de_pregrado text,
    titulo_de_especializacion text,
    titulo_de_maestria text,
    titulo_de_doctorado text,
    nombre_de_la_institucion_educativa_en_la_actualmente_desempena_ text,
    cargo_actual text,
    tipo_de_vinculacion_actual text,
    fecha_de_vinculacion_al_servicio_educativo_estatal date,
    fecha_de_nombramiento_estatal_en_el_cargo_actual date,
    fecha_de_nombramiento_del_cargo_actual_en_la_ie date,
    estatuto_al_que_pertenece text,
    grado_en_el_escalafon text,
    codigo_dane_de_la_ie_12_digitos bigint,
    entidad_territorial text,
    comuna_corregimiento_o_localidad text,
    zona_de_la_sede_principal_de_la_ie text,
    zona_de_la_sede_principal_de_la_ie2 text,
    direccion_de_la_sede_principal text,
    telefono_de_contacto_de_la_ie text,
    sitio_web text,
    correo_electronico_institucional text,
    numero_total_de_sedes_de_la_ie_incluida_la_sede_principal integer,
    numero_de_sedes_en_zona_rural integer,
    numero_de_sedes_en_zona_urbana integer,
    jornadas_de_la_ie_seleccion_multiple text[],
    grupos_etnicos_en_la_ie_seleccion_multiple text[],
    proyectos_transversales_de_la_ie text,
    estudiantes_o_familias_de_la_ie_en_condicion_de_desplazamiento boolean,
    niveles_educativos_que_ofrece_la_ie_seleccion_multiple text[],
    tipo_de_bachillerato_que_ofrece_la_ie text,
    modelo_o_enfoque_pedagogico text,
    numero_de_docentes integer,
    numero_de_coordinadoras_es integer,
    numero_de_administrativos integer,
    numero_de_orientadoras_es integer,
    numero_de_estudiantes_en_preescolar integer,
    numero_de_estudiantes_en_basica_primaria integer,
    numero_de_estudiantes_en_basica_secundaria integer,
    numero_de_estudiantes_en_media integer,
    numero_de_estudiantes_en_ciclo_complementario integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rectores OWNER TO ghsimard;

--
-- Name: rectores_id_seq; Type: SEQUENCE; Schema: public; Owner: ghsimard
--

CREATE SEQUENCE public.rectores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rectores_id_seq OWNER TO ghsimard;

--
-- Name: rectores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ghsimard
--

ALTER SEQUENCE public.rectores_id_seq OWNED BY public.rectores.id;


--
-- Name: FormResponse id; Type: DEFAULT; Schema: public; Owner: ghsimard
--

ALTER TABLE ONLY public."FormResponse" ALTER COLUMN id SET DEFAULT nextval('public."FormResponse_id_seq"'::regclass);


--
-- Name: docentes_form_submissions id; Type: DEFAULT; Schema: public; Owner: ghsimard
--

ALTER TABLE ONLY public.docentes_form_submissions ALTER COLUMN id SET DEFAULT nextval('public.docentes_form_submissions_id_seq'::regclass);


--
-- Name: rectores id; Type: DEFAULT; Schema: public; Owner: ghsimard
--

ALTER TABLE ONLY public.rectores ALTER COLUMN id SET DEFAULT nextval('public.rectores_id_seq'::regclass);


--
-- Name: FormResponse FormResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: ghsimard
--

ALTER TABLE ONLY public."FormResponse"
    ADD CONSTRAINT "FormResponse_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ghsimard
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: docentes_form_submissions docentes_form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ghsimard
--

ALTER TABLE ONLY public.docentes_form_submissions
    ADD CONSTRAINT docentes_form_submissions_pkey PRIMARY KEY (id);


--
-- Name: rectores rectores_pkey; Type: CONSTRAINT; Schema: public; Owner: ghsimard
--

ALTER TABLE ONLY public.rectores
    ADD CONSTRAINT rectores_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

