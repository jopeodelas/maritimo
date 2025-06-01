--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-01 16:25:01

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5030 (class 1262 OID 16388)
-- Name: maritimo_voting; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE maritimo_voting WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE maritimo_voting OWNER TO postgres;

\connect maritimo_voting

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 235 (class 1255 OID 16389)
-- Name: update_discussion_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_discussion_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          UPDATE discussions 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = NEW.discussion_id;
          RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_discussion_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16390)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    discussion_id integer NOT NULL,
    author_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16397)
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 218
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 232 (class 1259 OID 16514)
-- Name: custom_poll_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_poll_votes (
    id integer NOT NULL,
    poll_id integer NOT NULL,
    user_id integer NOT NULL,
    option_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.custom_poll_votes OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16513)
-- Name: custom_poll_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_poll_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_poll_votes_id_seq OWNER TO postgres;

--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 231
-- Name: custom_poll_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_poll_votes_id_seq OWNED BY public.custom_poll_votes.id;


--
-- TOC entry 230 (class 1259 OID 16498)
-- Name: custom_polls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_polls (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    options text[] NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.custom_polls OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16497)
-- Name: custom_polls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_polls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_polls_id_seq OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 229
-- Name: custom_polls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_polls_id_seq OWNED BY public.custom_polls.id;


--
-- TOC entry 219 (class 1259 OID 16398)
-- Name: discussions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussions (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    author_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.discussions OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16405)
-- Name: discussions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discussions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discussions_id_seq OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 220
-- Name: discussions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discussions_id_seq OWNED BY public.discussions.id;


--
-- TOC entry 234 (class 1259 OID 16537)
-- Name: maritodle_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maritodle_players (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    sexo character varying(20) NOT NULL,
    posicao_principal character varying(10) NOT NULL,
    altura_cm integer NOT NULL,
    papel character varying(20) NOT NULL,
    idade integer NOT NULL,
    nacionalidade character varying(50) NOT NULL,
    trofeus text[] DEFAULT '{}'::text[],
    ano_entrada integer NOT NULL,
    ano_saida integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maritodle_players OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16536)
-- Name: maritodle_players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maritodle_players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maritodle_players_id_seq OWNER TO postgres;

--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 233
-- Name: maritodle_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maritodle_players_id_seq OWNED BY public.maritodle_players.id;


--
-- TOC entry 221 (class 1259 OID 16406)
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "position" character varying(100) NOT NULL,
    image_url character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.players OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16412)
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO postgres;

--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 222
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- TOC entry 223 (class 1259 OID 16413)
-- Name: poll_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poll_votes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    position_id character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.poll_votes OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16417)
-- Name: poll_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.poll_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.poll_votes_id_seq OWNER TO postgres;

--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 224
-- Name: poll_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.poll_votes_id_seq OWNED BY public.poll_votes.id;


--
-- TOC entry 225 (class 1259 OID 16418)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    google_id character varying(255),
    is_admin boolean DEFAULT false,
    is_banned boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16424)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 226
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 227 (class 1259 OID 16425)
-- Name: votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votes (
    id integer NOT NULL,
    user_id integer,
    player_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.votes OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16429)
-- Name: votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.votes_id_seq OWNER TO postgres;

--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 228
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- TOC entry 4783 (class 2604 OID 16430)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 16517)
-- Name: custom_poll_votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes ALTER COLUMN id SET DEFAULT nextval('public.custom_poll_votes_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 16501)
-- Name: custom_polls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls ALTER COLUMN id SET DEFAULT nextval('public.custom_polls_id_seq'::regclass);


--
-- TOC entry 4786 (class 2604 OID 16431)
-- Name: discussions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions ALTER COLUMN id SET DEFAULT nextval('public.discussions_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 16540)
-- Name: maritodle_players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players ALTER COLUMN id SET DEFAULT nextval('public.maritodle_players_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 16432)
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- TOC entry 4791 (class 2604 OID 16433)
-- Name: poll_votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes ALTER COLUMN id SET DEFAULT nextval('public.poll_votes_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16434)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 16435)
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- TOC entry 5007 (class 0 OID 16390)
-- Dependencies: 217
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, discussion_id, author_id, content, created_at, updated_at) FROM stdin;
20	6	1	Acho que trazer o Ronaldo era bom...	2025-05-30 02:59:58.21845+01	2025-05-30 02:59:58.21845+01
21	6	1	sadasdasd	2025-05-30 12:57:52.369231+01	2025-05-30 12:57:52.369231+01
23	6	4	Tambem acho que sim meu puto	2025-05-30 13:11:06.636188+01	2025-05-30 13:11:06.636188+01
24	6	4	deviamos tambem pedir ao pepe para voltar	2025-05-30 13:11:35.373808+01	2025-05-30 13:11:35.373808+01
25	6	4	cold	2025-05-30 13:12:26.58791+01	2025-05-30 13:12:26.58791+01
26	6	4	e tambem deviamos trazer o Gelson Martins	2025-05-30 13:13:47.648265+01	2025-05-30 13:13:47.648265+01
27	6	11	niggser	2025-05-31 16:17:53.962018+01	2025-05-31 16:17:53.962018+01
\.


--
-- TOC entry 5022 (class 0 OID 16514)
-- Dependencies: 232
-- Data for Name: custom_poll_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_poll_votes (id, poll_id, user_id, option_index, created_at) FROM stdin;
1	1	1	1	2025-05-31 15:39:56.922517+01
2	2	1	0	2025-05-31 15:42:13.456213+01
3	2	11	1	2025-05-31 16:17:26.595478+01
\.


--
-- TOC entry 5020 (class 0 OID 16498)
-- Dependencies: 230
-- Data for Name: custom_polls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_polls (id, title, options, created_by, created_at, is_active) FROM stdin;
1	Vamos subir esta temporada?	{Sim,Não}	1	2025-05-31 15:38:30.716042+01	f
2	Em que posição vamos ficar na liga?	{1º,"2º ou 3º","4º a 8º","9º a 14º","15º a 18º"}	1	2025-05-31 15:42:00.276304+01	t
\.


--
-- TOC entry 5009 (class 0 OID 16398)
-- Dependencies: 219
-- Data for Name: discussions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discussions (id, title, description, author_id, created_at, updated_at) FROM stdin;
6	Que jogadores deveriam ser contratados nesta janela de transferências?	Quero apenas opções realistas	1	2025-05-30 02:57:03.590773+01	2025-05-31 16:17:53.972624+01
\.


--
-- TOC entry 5024 (class 0 OID 16537)
-- Dependencies: 234
-- Data for Name: maritodle_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maritodle_players (id, nome, sexo, posicao_principal, altura_cm, papel, idade, nacionalidade, trofeus, ano_entrada, ano_saida, created_at, updated_at) FROM stdin;
1	Samu Silva	Masculino	GK	193	Jogador	25	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
2	Kimiss Zavala	Masculino	GK	186	Jogador	21	Moçambique	{}	2022	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
3	Junior Almeida	Masculino	DC	189	Jogador	25	Brasil	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
4	Afonso Freitas	Masculino	DC	184	Jogador	23	Portugal	{}	2025	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
5	Rodrigo Borges	Masculino	DC	185	Jogador	26	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
6	Romain Correia	Masculino	DC	187	Jogador	25	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
7	Noah Madsen	Masculino	DC	191	Jogador	23	Dinamarca	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
8	Pedro Silva	Masculino	MCO	177	Jogador	23	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
9	Ibrahima Guirassy	Masculino	MDC	190	Jogador	26	França	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
10	Carlos Daniel	Masculino	MC	175	Jogador	26	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
11	Vladan Danilović	Masculino	MDC	183	Jogador	25	Bósnia e Herzegovina	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
12	Michel Costa	Masculino	MC	165	Jogador	23	Brasil	{}	2025	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
13	Rodrigo Andrade	Masculino	ME	175	Jogador	26	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
14	Fábio Blanco	Masculino	ED	179	Jogador	21	Espanha	{}	2025	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
15	Preslav Borukov	Masculino	PL	189	Jogador	25	Bulgária	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
16	Alexandre Guedes	Masculino	PL	185	Jogador	31	Portugal	{}	2025	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
17	Patrick Fernandes	Masculino	PL	190	Jogador	31	Cabo Verde	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
18	Martim Tavares	Masculino	PL	183	Jogador	21	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
19	Nachon Nsingi	Masculino	PL	176	Jogador	24	Bélgica	{}	2025	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
20	Daniel Benchimol	Masculino	ED	162	Jogador	22	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
21	Enrique Peña Zauner	Masculino	ED	177	Jogador	25	Venezuela	{}	2025	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
22	Fábio China	Masculino	LB	179	Jogador	32	Portugal	{}	2016	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
23	Igor Julião	Masculino	RB	173	Jogador	30	Brasil	{}	2023	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
24	Tomás Domingos	Masculino	RB	175	Jogador	26	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
25	Francisco França	Masculino	MDC	186	Jogador	23	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
26	Gonçalo Tabuaço	Masculino	GK	189	Jogador	24	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-05-31 22:05:45.86938
27	Manuel Ventura	Masculino	Treinador	180	Treinador	73	Portugal	{}	2003	2004	2025-06-01 01:28:47.972414	2025-06-01 01:28:47.972414
36	Carlos Carvalhal	Masculino	Treinador	178	Treinador	59	Portugal	{}	2009	2009	2025-06-01 01:28:48.349113	2025-06-01 01:28:48.349113
37	Mitchell van der Gaag	Masculino	Treinador	183	Treinador	54	Países Baixos	{}	2009	2010	2025-06-01 01:28:48.351087	2025-06-01 01:28:48.351087
38	Pedro Martins	Masculino	Treinador	180	Treinador	47	Portugal	{}	2010	2014	2025-06-01 01:28:48.351485	2025-06-01 01:28:48.351485
45	Petit	Masculino	MDC	180	Treinador	47	Portugal	{}	2018	2019	2025-06-01 01:28:48.585316	2025-06-01 01:28:48.585316
48	Lito Vidigal	Masculino	DC	178	Treinador	55	Portugal	{}	2020	2020	2025-06-01 01:28:48.791217	2025-06-01 01:28:48.791217
53	Tulipa	Masculino	Treinador	172	Treinador	52	Portugal	{}	2023	2023	2025-06-01 01:28:48.93266	2025-06-01 01:28:48.93266
55	Silas	Masculino	MDC	176	Treinador	48	Portugal	{}	2024	2024	2025-06-01 01:28:48.961655	2025-06-01 01:28:48.961655
56	Rui Duarte	Masculino	Treinador	182	Treinador	46	Portugal	{}	2024	2025	2025-06-01 01:28:48.962767	2025-06-01 01:28:48.962767
\.


--
-- TOC entry 5011 (class 0 OID 16406)
-- Dependencies: 221
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.players (id, name, "position", image_url, created_at) FROM stdin;
1	Samu Silva	Guarda-redes	/images/samu-silva.png	2025-05-19 22:27:57.227969+01
3	Kimiss Zavala	Guarda-redes	/images/kimiss-zavala.png	2025-05-19 22:27:57.227969+01
5	Junior Almeida	Defesa	/images/junior-almeida.png	2025-05-19 22:27:57.227969+01
6	Afonso Freitas	Defesa	/images/afonso-freitas.png	2025-05-19 22:27:57.227969+01
8	Rodrigo Borges	Defesa	/images/rodrigo-borges.png	2025-05-19 22:27:57.227969+01
9	Romain Correia	Defesa	/images/romain-correia.png	2025-05-19 22:27:57.227969+01
11	Noah Madsen	Defesa	/images/noah-madsen.png	2025-05-19 22:27:57.227969+01
12	Pedro Silva	Médio	/images/pedro-silva.png	2025-05-19 22:27:57.227969+01
13	Ibrahima Guirassy	Médio	/images/ibrahima-guirassy.png	2025-05-19 22:27:57.227969+01
14	Carlos Daniel	Médio	/images/carlos-daniel.png	2025-05-19 22:27:57.227969+01
15	Vladan Danilovic	Médio	/images/vladan-danilovic.png	2025-05-19 22:27:57.227969+01
16	Michel Costa	Médio	/images/michel-costa.png	2025-05-19 22:27:57.227969+01
17	Rodrigo Andrade	Médio	/images/rodrigo-andrade.png	2025-05-19 22:27:57.227969+01
19	Fabio Blanco	Avançado	/images/fabio-blanco.png	2025-05-19 22:27:57.227969+01
20	Preslav Borukov	Avançado	/images/preslav-borukov.png	2025-05-19 22:27:57.227969+01
21	Alexandre Guedes	Avançado	/images/alexandre-guedes.png	2025-05-19 22:27:57.227969+01
22	Patrick Fernandes	Avançado	/images/patrick-fernandes.png	2025-05-19 22:27:57.227969+01
23	Martim Tavares	Avançado	/images/martim-tavares.png	2025-05-19 22:27:57.227969+01
24	Nachon Nsingi	Avançado	/images/nachon-nsingi.png	2025-05-19 22:27:57.227969+01
26	Daniel Benchimol	Avançado	/images/daniel-benchimol.png	2025-05-19 22:27:57.227969+01
25	Peña Zauner	Avançado	/images/pena-zauner.png	2025-05-19 22:27:57.227969+01
10	Fábio China	Defesa	/images/fabio-china.png	2025-05-19 22:27:57.227969+01
4	Igor Julião	Defesa	/images/igor-juliao.png	2025-05-19 22:27:57.227969+01
7	Tomás Domingos	Defesa	/images/tomas-domingos.png	2025-05-19 22:27:57.227969+01
18	Francisco França	Médio	/images/francisco-franca.png	2025-05-19 22:27:57.227969+01
2	Gonçalo Tabuaço	Guarda-redes	/images/goncalo-tabuaco.png	2025-05-19 22:27:57.227969+01
\.


--
-- TOC entry 5013 (class 0 OID 16413)
-- Dependencies: 223
-- Data for Name: poll_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poll_votes (id, user_id, position_id, created_at) FROM stdin;
1	9	guarda-redes	2025-05-25 19:44:52.554191+01
2	9	defesa-central	2025-05-25 19:44:52.558501+01
3	1	ponta-de-lanca	2025-05-25 19:46:46.596669+01
4	1	defesa-central	2025-05-25 19:46:46.599566+01
5	1	laterais	2025-05-25 19:46:46.600296+01
6	1	medio-centro	2025-05-25 19:46:46.600963+01
7	1	extremos	2025-05-25 19:46:46.601499+01
8	4	defesa-central	2025-05-25 21:35:16.392915+01
9	4	ponta-de-lanca	2025-05-25 21:35:16.395846+01
10	5	defesa-central	2025-05-26 12:35:01.336426+01
11	5	laterais	2025-05-26 12:35:01.341834+01
12	5	medio-centro	2025-05-26 12:35:01.342438+01
13	10	guarda-redes	2025-05-26 14:05:10.529018+01
14	10	defesa-central	2025-05-26 14:05:10.53256+01
15	10	laterais	2025-05-26 14:05:10.533523+01
16	10	medio-centro	2025-05-26 14:05:10.534228+01
17	10	ponta-de-lanca	2025-05-26 14:05:10.535127+01
18	10	extremos	2025-05-26 14:05:10.536212+01
19	11	defesa-central	2025-05-31 16:17:36.508149+01
20	11	laterais	2025-05-31 16:17:36.511311+01
21	11	extremos	2025-05-31 16:17:36.512125+01
22	11	ponta-de-lanca	2025-05-31 16:17:36.513299+01
23	11	medio-centro	2025-05-31 16:17:36.514391+01
\.


--
-- TOC entry 5015 (class 0 OID 16418)
-- Dependencies: 225
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, google_id, is_admin, is_banned) FROM stdin;
2	Jope1	asdasd@gmail.com	$2b$10$r5iqHmvm7D9BWcWwBwNGYexMzvTa4m/NPzgcVtnEYov1PmVi2j1IG	2025-05-20 20:54:52.622871+01	\N	f	f
3	salvador	sadsad@gmail.com	$2b$10$8T99dZuwvFTQ7e9X/T8L1.BnPepERg8.Lh8TQxgoa3WkRdLMjdscS	2025-05-20 22:48:41.300552+01	\N	f	f
4	Jope THE BEAST	jopethebeast@gmail.com	$2b$10$l/nHhf.wRNdbvO3eXo33q.p9t/dRZV.0aj.CaIedG2eROv5oEpocy	2025-05-22 14:24:43.204154+01	114941445721236454444	f	f
5	jopegomes_15	asd@gmail.com	$2b$10$Eeyn8AxFDELvSZMmJBLrrekp.droPfYiyoeMdQrwPfNjmuESCz2r6	2025-05-24 01:45:43.635314+01	\N	f	f
8	emanuel	rty@gmail.com	$2b$10$MQhUxNJKnNfqrqnpGq7HzuZNDmWiEwZ7qN/ynqx7oLs9FiZ98HQFm	2025-05-25 13:09:38.780178+01	\N	f	f
9	IconicPrints	iconicprintsoficial@gmail.com	$2b$10$qLOYaN6wzR710g7HBBpLDuUv8HJoCefg4TsUnfSU7KuMT/.sY4ZYm	2025-05-25 15:14:33.643935+01	108809104178473985146	f	f
10	MostLikedWebProject	mostlikedwebproject@gmail.com	$2b$10$hz3/X/X26bK6qVn7qVn7VFsides/JFX322.1goZh.w5s3eP5p06yyUDTO	2025-05-25 21:34:38.871089+01	111659102641992005039	f	f
1	Jope	jope.sousagomes8@gmail.com	$2b$10$327tnVdw9fx.v2jgOqrlVOgcj.fOUATFIiDVdi6iDTKYcCraggwDC	2025-05-19 23:30:09.016555+01	105806198648964062923	t	f
6	qwe	qwe@gmail.com	$2b$10$tDDGuH4JdPKAuzz0NlUg9.7axm1ZrtldeyWcT/M/eEPYKvJCDON6	2025-05-24 20:22:03.836358+01	\N	f	t
11	ghj	ghj@gmail.com	$2b$10$llFLPPEX1bo5oHBiKH8kOOadjtpXdcA5LL/Swm97Fq6n6eL.Wgjr.	2025-05-31 16:17:12.276586+01	\N	f	t
\.


--
-- TOC entry 5017 (class 0 OID 16425)
-- Dependencies: 227
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.votes (id, user_id, player_id, created_at) FROM stdin;
1	1	4	2025-05-19 23:35:32.311614+01
2	1	10	2025-05-19 23:36:50.392049+01
3	1	14	2025-05-19 23:36:57.956737+01
4	1	6	2025-05-19 23:36:59.681968+01
5	1	22	2025-05-19 23:37:01.791345+01
6	1	9	2025-05-19 23:37:08.084331+01
7	1	12	2025-05-19 23:37:11.317591+01
8	1	21	2025-05-19 23:37:18.75011+01
9	1	5	2025-05-19 23:37:27.764977+01
10	1	20	2025-05-19 23:37:29.317332+01
11	2	7	2025-05-20 20:56:01.224625+01
12	2	9	2025-05-20 20:56:20.458613+01
13	2	12	2025-05-20 20:56:27.05764+01
14	2	8	2025-05-20 20:56:29.402539+01
15	2	6	2025-05-20 20:57:15.849207+01
16	2	14	2025-05-20 20:57:16.659641+01
17	3	12	2025-05-20 22:49:27.185671+01
18	3	10	2025-05-20 22:49:39.771078+01
19	3	22	2025-05-20 22:49:44.862784+01
20	3	21	2025-05-20 22:49:53.330075+01
21	3	20	2025-05-20 22:49:55.286943+01
22	3	4	2025-05-20 22:49:58.135261+01
23	3	24	2025-05-20 22:50:16.02631+01
24	3	17	2025-05-20 22:50:38.912283+01
25	3	16	2025-05-20 22:50:52.570002+01
26	4	10	2025-05-22 14:25:01.850352+01
27	4	14	2025-05-23 00:27:43.814943+01
28	1	24	2025-05-24 01:35:29.243064+01
29	1	17	2025-05-24 01:40:08.278326+01
30	1	8	2025-05-24 01:40:08.278642+01
31	1	16	2025-05-24 01:40:08.279434+01
32	1	7	2025-05-24 01:40:12.961632+01
33	1	3	2025-05-24 11:40:16.301502+01
34	1	1	2025-05-24 11:40:16.303032+01
35	6	15	2025-05-24 20:27:17.559809+01
36	6	25	2025-05-24 20:27:17.569453+01
37	6	18	2025-05-24 20:27:17.569631+01
38	6	19	2025-05-24 20:27:17.569747+01
39	6	26	2025-05-24 20:27:17.569887+01
40	6	23	2025-05-24 20:27:17.570287+01
41	6	13	2025-05-24 20:27:17.643862+01
42	6	16	2025-05-24 20:27:56.671816+01
43	6	3	2025-05-24 20:35:31.215783+01
44	8	8	2025-05-25 13:11:21.291406+01
45	8	6	2025-05-25 13:11:21.291684+01
46	8	10	2025-05-25 13:11:21.306289+01
47	8	5	2025-05-25 13:11:21.306689+01
48	8	1	2025-05-25 13:11:21.307154+01
49	8	7	2025-05-25 13:11:21.316441+01
50	8	4	2025-05-25 13:11:21.321453+01
51	8	9	2025-05-25 13:11:21.321547+01
52	8	3	2025-05-25 13:11:21.322455+01
53	8	12	2025-05-25 13:11:21.322775+01
54	8	16	2025-05-25 13:11:21.322959+01
55	8	14	2025-05-25 13:11:21.343537+01
56	8	17	2025-05-25 13:11:21.344121+01
57	8	18	2025-05-25 13:11:21.344202+01
58	8	22	2025-05-25 13:11:21.34463+01
59	8	24	2025-05-25 13:11:21.344806+01
60	8	21	2025-05-25 13:11:21.344946+01
61	8	20	2025-05-25 13:11:21.360893+01
62	8	26	2025-05-25 13:11:21.360975+01
63	8	25	2025-05-25 13:11:21.36107+01
64	8	23	2025-05-25 13:11:21.361187+01
65	4	7	2025-05-25 21:46:07.96884+01
67	5	1	2025-05-26 12:35:46.660643+01
66	5	24	2025-05-26 12:35:46.659814+01
68	5	3	2025-05-26 12:35:46.662489+01
69	5	16	2025-05-26 12:35:46.663096+01
70	5	21	2025-05-26 12:35:46.665198+01
71	5	14	2025-05-26 12:35:46.667408+01
73	1	13	2025-05-27 22:01:09.163209+01
72	1	15	2025-05-27 22:01:09.163126+01
74	1	18	2025-05-27 22:01:09.195201+01
\.


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 218
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 27, true);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 231
-- Name: custom_poll_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_poll_votes_id_seq', 3, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 229
-- Name: custom_polls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_polls_id_seq', 2, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 220
-- Name: discussions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discussions_id_seq', 6, true);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 233
-- Name: maritodle_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maritodle_players_id_seq', 56, true);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 222
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 26, true);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 224
-- Name: poll_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.poll_votes_id_seq', 23, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 226
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 228
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votes_id_seq', 74, true);


--
-- TOC entry 4809 (class 2606 OID 16437)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 16520)
-- Name: custom_poll_votes custom_poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes
    ADD CONSTRAINT custom_poll_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 16507)
-- Name: custom_polls custom_polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls
    ADD CONSTRAINT custom_polls_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 16439)
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 16549)
-- Name: maritodle_players maritodle_players_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players
    ADD CONSTRAINT maritodle_players_nome_key UNIQUE (nome);


--
-- TOC entry 4851 (class 2606 OID 16547)
-- Name: maritodle_players maritodle_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players
    ADD CONSTRAINT maritodle_players_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 16441)
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 16443)
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 16445)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4828 (class 2606 OID 16447)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 4830 (class 2606 OID 16449)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 16451)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4834 (class 2606 OID 16453)
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 16455)
-- Name: votes votes_user_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_player_id_key UNIQUE (user_id, player_id);


--
-- TOC entry 4842 (class 1259 OID 16533)
-- Name: custom_poll_votes_poll_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_poll_votes_poll_id_idx ON public.custom_poll_votes USING btree (poll_id);


--
-- TOC entry 4843 (class 1259 OID 16534)
-- Name: custom_poll_votes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_poll_votes_user_id_idx ON public.custom_poll_votes USING btree (user_id);


--
-- TOC entry 4844 (class 1259 OID 16531)
-- Name: custom_poll_votes_user_poll_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX custom_poll_votes_user_poll_unique ON public.custom_poll_votes USING btree (user_id, poll_id);


--
-- TOC entry 4837 (class 1259 OID 16532)
-- Name: custom_polls_created_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_polls_created_by_idx ON public.custom_polls USING btree (created_by);


--
-- TOC entry 4810 (class 1259 OID 16456)
-- Name: idx_comments_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_author_id ON public.comments USING btree (author_id);


--
-- TOC entry 4811 (class 1259 OID 16457)
-- Name: idx_comments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_created_at ON public.comments USING btree (created_at);


--
-- TOC entry 4812 (class 1259 OID 16458)
-- Name: idx_comments_discussion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_discussion_id ON public.comments USING btree (discussion_id);


--
-- TOC entry 4815 (class 1259 OID 16459)
-- Name: idx_discussions_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_author_id ON public.discussions USING btree (author_id);


--
-- TOC entry 4816 (class 1259 OID 16460)
-- Name: idx_discussions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_created_at ON public.discussions USING btree (created_at);


--
-- TOC entry 4817 (class 1259 OID 16461)
-- Name: idx_discussions_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_updated_at ON public.discussions USING btree (updated_at);


--
-- TOC entry 4845 (class 1259 OID 16552)
-- Name: idx_maritodle_players_nacionalidade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_nacionalidade ON public.maritodle_players USING btree (nacionalidade);


--
-- TOC entry 4846 (class 1259 OID 16550)
-- Name: idx_maritodle_players_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_nome ON public.maritodle_players USING btree (nome);


--
-- TOC entry 4847 (class 1259 OID 16551)
-- Name: idx_maritodle_players_posicao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_posicao ON public.maritodle_players USING btree (posicao_principal);


--
-- TOC entry 4822 (class 1259 OID 16462)
-- Name: poll_votes_position_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX poll_votes_position_id_idx ON public.poll_votes USING btree (position_id);


--
-- TOC entry 4823 (class 1259 OID 16463)
-- Name: poll_votes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX poll_votes_user_id_idx ON public.poll_votes USING btree (user_id);


--
-- TOC entry 4824 (class 1259 OID 16464)
-- Name: poll_votes_user_position_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX poll_votes_user_position_unique ON public.poll_votes USING btree (user_id, position_id);


--
-- TOC entry 4861 (class 2620 OID 16465)
-- Name: comments trigger_update_discussion_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_discussion_timestamp AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_discussion_timestamp();


--
-- TOC entry 4852 (class 2606 OID 16466)
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4853 (class 2606 OID 16471)
-- Name: comments comments_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- TOC entry 4859 (class 2606 OID 16521)
-- Name: custom_poll_votes custom_poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes
    ADD CONSTRAINT custom_poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.custom_polls(id) ON DELETE CASCADE;


--
-- TOC entry 4860 (class 2606 OID 16526)
-- Name: custom_poll_votes custom_poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes
    ADD CONSTRAINT custom_poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4858 (class 2606 OID 16508)
-- Name: custom_polls custom_polls_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls
    ADD CONSTRAINT custom_polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4854 (class 2606 OID 16476)
-- Name: discussions discussions_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4855 (class 2606 OID 16481)
-- Name: poll_votes poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4856 (class 2606 OID 16486)
-- Name: votes votes_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4857 (class 2606 OID 16491)
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-06-01 16:25:01

--
-- PostgreSQL database dump complete
--

