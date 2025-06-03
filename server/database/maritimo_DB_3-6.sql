--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-03 01:34:27

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
-- TOC entry 4927 (class 1262 OID 16388)
-- Name: maritimo_voting; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE maritimo_voting WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Portuguese_Portugal.1252';


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
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 235 (class 1255 OID 16495)
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
-- TOC entry 228 (class 1259 OID 16469)
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
-- TOC entry 227 (class 1259 OID 16468)
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
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 227
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 229 (class 1259 OID 16498)
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
-- TOC entry 230 (class 1259 OID 16502)
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
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 230
-- Name: custom_poll_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_poll_votes_id_seq OWNED BY public.custom_poll_votes.id;


--
-- TOC entry 231 (class 1259 OID 16503)
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
-- TOC entry 232 (class 1259 OID 16510)
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
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 232
-- Name: custom_polls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_polls_id_seq OWNED BY public.custom_polls.id;


--
-- TOC entry 226 (class 1259 OID 16453)
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
-- TOC entry 225 (class 1259 OID 16452)
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
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 225
-- Name: discussions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discussions_id_seq OWNED BY public.discussions.id;


--
-- TOC entry 233 (class 1259 OID 16511)
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
-- TOC entry 234 (class 1259 OID 16519)
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
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 234
-- Name: maritodle_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maritodle_players_id_seq OWNED BY public.maritodle_players.id;


--
-- TOC entry 220 (class 1259 OID 16404)
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
-- TOC entry 219 (class 1259 OID 16403)
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
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 219
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- TOC entry 224 (class 1259 OID 16437)
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
-- TOC entry 223 (class 1259 OID 16436)
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
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 223
-- Name: poll_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.poll_votes_id_seq OWNED BY public.poll_votes.id;


--
-- TOC entry 218 (class 1259 OID 16390)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    google_id character varying(255),
    is_admin boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16389)
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
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 222 (class 1259 OID 16414)
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
-- TOC entry 221 (class 1259 OID 16413)
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
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 221
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- TOC entry 4694 (class 2604 OID 16520)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 4697 (class 2604 OID 16521)
-- Name: custom_poll_votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes ALTER COLUMN id SET DEFAULT nextval('public.custom_poll_votes_id_seq'::regclass);


--
-- TOC entry 4699 (class 2604 OID 16522)
-- Name: custom_polls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls ALTER COLUMN id SET DEFAULT nextval('public.custom_polls_id_seq'::regclass);


--
-- TOC entry 4691 (class 2604 OID 16523)
-- Name: discussions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions ALTER COLUMN id SET DEFAULT nextval('public.discussions_id_seq'::regclass);


--
-- TOC entry 4702 (class 2604 OID 16524)
-- Name: maritodle_players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players ALTER COLUMN id SET DEFAULT nextval('public.maritodle_players_id_seq'::regclass);


--
-- TOC entry 4685 (class 2604 OID 16525)
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- TOC entry 4689 (class 2604 OID 16526)
-- Name: poll_votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes ALTER COLUMN id SET DEFAULT nextval('public.poll_votes_id_seq'::regclass);


--
-- TOC entry 4682 (class 2604 OID 16527)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4687 (class 2604 OID 16528)
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- TOC entry 4915 (class 0 OID 16469)
-- Dependencies: 228
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, discussion_id, author_id, content, created_at, updated_at) FROM stdin;
20	6	1	Acho que trazer o Ronaldo era bom...	2025-05-30 02:59:58.21845+01	2025-05-30 02:59:58.21845+01
21	6	1	sadasdasd	2025-05-30 12:57:52.369231+01	2025-05-30 12:57:52.369231+01
23	6	4	Tambem acho que sim meu puto	2025-05-30 13:11:06.636188+01	2025-05-30 13:11:06.636188+01
24	6	4	deviamos tambem pedir ao pepe para voltar	2025-05-30 13:11:35.373808+01	2025-05-30 13:11:35.373808+01
25	6	4	cold	2025-05-30 13:12:26.58791+01	2025-05-30 13:12:26.58791+01
26	6	4	e tambem deviamos trazer o Gelson Martins	2025-05-30 13:13:47.648265+01	2025-05-30 13:13:47.648265+01
\.


--
-- TOC entry 4916 (class 0 OID 16498)
-- Dependencies: 229
-- Data for Name: custom_poll_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_poll_votes (id, poll_id, user_id, option_index, created_at) FROM stdin;
1	1	1	1	2025-05-31 15:39:56.922517+01
2	2	1	0	2025-05-31 15:42:13.456213+01
3	2	11	1	2025-05-31 16:17:26.595478+01
\.


--
-- TOC entry 4918 (class 0 OID 16503)
-- Dependencies: 231
-- Data for Name: custom_polls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_polls (id, title, options, created_by, created_at, is_active) FROM stdin;
1	Vamos subir esta temporada?	{Sim,Não}	1	2025-05-31 15:38:30.716042+01	f
2	Em que posição vamos ficar na liga?	{1º,"2º ou 3º","4º a 8º","9º a 14º","15º a 18º"}	1	2025-05-31 15:42:00.276304+01	t
\.


--
-- TOC entry 4913 (class 0 OID 16453)
-- Dependencies: 226
-- Data for Name: discussions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discussions (id, title, description, author_id, created_at, updated_at) FROM stdin;
6	Que jogadores deveriam ser contratados nesta janela de transferências?	Quero apenas opções realistas	1	2025-05-30 02:57:03.590773+01	2025-05-30 13:13:47.650604+01
\.


--
-- TOC entry 4920 (class 0 OID 16511)
-- Dependencies: 233
-- Data for Name: maritodle_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maritodle_players (id, nome, sexo, posicao_principal, altura_cm, papel, idade, nacionalidade, trofeus, ano_entrada, ano_saida, created_at, updated_at) FROM stdin;
72	Francis Cann	32 jogos	EE/ED/MD	162	Jogador	27	Gana	{"1 contribuição"}	2023	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
73	Lucas Silva	38 jogos	EE/ED/PL	182	Jogador	25	Brasil	{"17 contribuições"}	2023	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
74	Xiko Gomes	15 jogos	EE/ED	175	Jogador	21	Portugal	{"2 contribuições"}	2018	9999	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
75	Yves Baraye	6 jogos	EE/ED/PL	177	Jogador	32	Senegal	{}	2023	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
76	Edgar Costa	269 jogos	ED/MCO/MD	177	Jogador	38	Portugal	{"56 contribuições"}	2014	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
77	Joel Tagueu	147 jogos	PL	178	Jogador	31	Camarões	{"49 contribuições"}	2018	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
78	Bica	18 jogos	PL	180	Jogador	21	Portugal	{"5 contribuições"}	2023	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
79	Platiny	38 jogos	PL/AC	178	Jogador	34	Brasil	{"14 contribuições"}	2023	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
80	Miguel Silva	17 jogos	GK	190	Jogador	30	Portugal	{}	2021	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
81	Giorgi Makaridze	6 jogos	GK	194	Jogador	35	Geórgia	{}	2023	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
82	Marcelo Carné	16 jogos	GK	188	Jogador	35	Brasil	{}	2023	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
83	Léo Andrade	59 jogos	DC	191	Jogador	27	Brasil	{"5 contribuições"}	2019	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
84	Cláudio Winck	103 jogos	LD	184	Jogador	31	Brasil	{"22 contribuições"}	2020	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
85	Paulinho	15 jogos	LD/MD	176	Jogador	33	Portugal	{"1 contribuição"}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
86	João Afonso	29 jogos	MDC/MC	181	Jogador	30	Brasil	{}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
87	Lucho Vega	9 jogos	MC/MCO	186	Jogador	26	Argentina	{}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
88	Joel Soñora	6 jogos	MCO	173	Jogador	28	Argentina	{}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
89	Stefano Beltrame	45 jogos	MC/MCO/PL	183	Jogador	32	Itália	{"5 contribuições"}	2021	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
90	André Vidigal	73 jogos	ME/EE	176	Jogador	26	Angola	{"12 contribuições"}	2021	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
91	Félix Correia	15 jogos	EE/ED	178	Jogador	24	Portugal	{"5 contribuições"}	2023	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
92	Geny Catamo	11 jogos	ME/MD/ED	173	Jogador	24	Moçambique	{}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
2	Kimiss Zavala	0 jogos	GK	186	Jogador	21	Moçambique	{}	2022	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.178496
93	Antonio Zarzana	6 jogos	ED/MCO	177	Jogador	23	Espanha	{}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
94	Pablo Moreno	22 jogos	EE/ED	178	Jogador	23	Espanha	{"2 contribuições"}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
95	Brayan Riascos	18 jogos	PL	178	Jogador	30	Colômbia	{"6 contribuições"}	2023	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
37	Mitchell van der Gaag	X	Treinador	183	Treinador	54	Países Baixos	{}	2009	2010	2025-06-01 01:28:48.351087	2025-06-01 01:28:48.351087
38	Pedro Martins	X	Treinador	180	Treinador	47	Portugal	{}	2010	2014	2025-06-01 01:28:48.351485	2025-06-01 01:28:48.351485
45	Petit	X	MDC	180	Treinador	47	Portugal	{}	2018	2019	2025-06-01 01:28:48.585316	2025-06-01 01:28:48.585316
96	Jesús Ramírez	26 jogos	PL	187	Jogador	27	Venezuela	{"2 contribuições"}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
97	Percy Liza	15 jogos	PL	185	Jogador	25	Perú	{"2 contribuições"}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
48	Lito Vidigal	X	DC	178	Treinador	55	Portugal	{}	2020	2020	2025-06-01 01:28:48.791217	2025-06-01 01:28:48.791217
27	Manuel Ventura	X	Treinador	180	Treinador	73	Portugal	{}	2003	2004	2025-06-01 01:28:47.972414	2025-06-01 01:28:47.972414
36	Carlos Carvalhal	X	Treinador	178	Treinador	59	Portugal	{}	2009	2009	2025-06-01 01:28:48.349113	2025-06-01 01:28:48.349113
53	Tulipa	X	Treinador	172	Treinador	52	Portugal	{}	2023	2023	2025-06-01 01:28:48.93266	2025-06-01 01:28:48.93266
55	Silas	X	MDC	176	Treinador	48	Portugal	{}	2024	2024	2025-06-01 01:28:48.961655	2025-06-01 01:28:48.961655
56	Rui Duarte	X	Treinador	182	Treinador	46	Portugal	{}	2024	2025	2025-06-01 01:28:48.962767	2025-06-01 01:28:48.962767
1	Samu Silva	20 jogos	GK	193	Jogador	26	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.173086
15	Preslav Borukov	23 jogos	PL	180	Jogador	25	Bulgária	{"3 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.189676
16	Alexandre Guedes	15 jogos	PL	188	Jogador	29	Portugal	{"4 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.190287
17	Patrick Fernandes	31 jogos	PL/ED	182	Jogador	27	Cabo Verde	{"6 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.190803
3	Junior Almeida	35 jogos	DC	189	Jogador	25	Brasil	{"3 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.180039
4	Afonso Freitas	12 jogos	LB	181	Jogador	25	Portugal	{"1 contribuição"}	2025	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.181098
5	Rodrigo Borges	37 jogos	DC	183	Jogador	26	Portugal	{"6 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.182003
6	Romain Correia	29 jogos	DC	183	Jogador	23	França	{"2 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.182779
7	Noah Madsen	15 jogos	DC	190	Jogador	23	Dinamarca	{"2 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.183446
8	Pedro Silva	14 jogos	MC/EE	178	Jogador	28	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.184032
9	Ibrahima Guirassy	34 jogos	MDC/MC	185	Jogador	26	França	{"3 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.184817
18	Martim Tavares	31 jogos	PL	183	Jogador	21	Portugal	{"8 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.191453
19	Nachon Nsingi	4 jogos	ED	176	Jogador	24	Bélgica	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.192098
20	Daniel Benchimol	17 jogos	EE/ED	162	Jogador	22	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.19301
21	Enrique Peña Zauner	10 jogos	EE/ED	177	Jogador	25	Alemanha	{"3 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.19379
22	Fábio China	169 jogos	LB	179	Jogador	32	Portugal	{"10 contribuições"}	2016	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.194533
23	Igor Julião	48 jogos	RB	175	Jogador	30	Brasil	{"7 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.195187
24	Tomás Domingos	59 jogos	RB	175	Jogador	26	Portugal	{"6 contribuições"}	2023	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.195802
25	Francisco França	28 jogos	MDC/MC/MCO	186	Jogador	23	Portugal	{"3 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.196341
26	Gonçalo Tabuaço	31 jogos	GK	188	Jogador	24	Portugal	{}	2024	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.196862
10	Carlos Daniel	31 jogos	MCO/MC	178	Jogador	30	Portugal	{"10 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.186023
11	Vladan Danilović	31 jogos	MDC/MC	183	Jogador	26	Bósnia-Herzegovina	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.187193
12	Michel Costa	13 jogos	MC/MCO	165	Jogador	23	Brazil	{"2 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.18789
13	Rodrigo Andrade	9 jogos	MDC	180	Jogador	23	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.188455
14	Fábio Blanco	16 jogos	EE	173	Jogador	21	Espanha	{"4 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.188983
57	Amir Abedzadeh	104 jogos	GK	186	Jogador	32	Irão	{}	2017	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
58	Pedro Teixeira	0 jogos	GK	192	Jogador	23	Portugal	{}	2020	9999	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
59	Moisés Mosquera	35 jogos	DC	189	Jogador	24	Colômbia	{"1 contribuição"}	2019	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
60	Matheus Costa	66 jogos	DC	188	Jogador	30	Brasil	{"7 contribuições"}	2021	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
61	Dylan Collard	20 jogos	DC	200	Jogador	25	Maurícias	{"1 contribuição"}	2020	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
62	Zainadine	220 jogos	DC	180	Jogador	36	Moçambique	{"13 contribuições"}	2017	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
63	Vítor Costa	80 jogos	LE	182	Jogador	30	Brasil	{"7 contribuições"}	2021	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
64	Diogo Mendes	90 jogos	MDC/MC	182	Jogador	27	Portugal	{"4 contribuições"}	2021	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
65	Noah Françoise	17 jogos	MDC/MC	178	Jogador	21	França	{"1 contribuição"}	2023	9999	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
66	Val Soares	23 jogos	MDC	176	Jogador	28	Brasil	{"1 contribuição"}	2023	2025	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
67	Renê Santos	127 jogos	MDC/DC	187	Jogador	33	Brasil	{"8 contribuições"}	2019	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
68	Bernardo Gomes	19 jogos	MC/MCO	182	Jogador	21	Portugal	{"3 contribuições"}	2018	9999	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
69	Xadas	115 jogos	MC/MCO	179	Jogador	27	Portugal	{"31 contribuições"}	2020	2024	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
70	João Tavares	22 jogos	MC/MCO	175	Jogador	26	Portugal	{"1 contribuição"}	2023	2025	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
71	Euller	49 jogos	EE/ED	175	Jogador	30	Brasil	{"23 contribuições"}	2023	2025	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
\.


--
-- TOC entry 4907 (class 0 OID 16404)
-- Dependencies: 220
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
-- TOC entry 4911 (class 0 OID 16437)
-- Dependencies: 224
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
\.


--
-- TOC entry 4905 (class 0 OID 16390)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, google_id, is_admin) FROM stdin;
2	Jope1	asdasd@gmail.com	$2b$10$r5iqHmvm7D9BWcWwBwNGYexMzvTa4m/NPzgcVtnEYov1PmVi2j1IG	2025-05-20 20:54:52.622871+01	\N	f
3	salvador	sadsad@gmail.com	$2b$10$8T99dZuwvFTQ7e9X/T8L1.BnPepERg8.Lh8TQxgoa3WkRdLMjdscS	2025-05-20 22:48:41.300552+01	\N	f
1	Jope	jope.sousagomes8@gmail.com	$2b$10$327tnVdw9fx.v2jgOqrlVOgcj.fOUATFIiDVdi6iDTKYcCraggwDC	2025-05-19 23:30:09.016555+01	105806198648964062923	f
4	Jope THE BEAST	jopethebeast@gmail.com	$2b$10$l/nHhf.wRNdbvO3eXo33q.p9t/dRZV.0aj.CaIedG2eROv5oEpocy	2025-05-22 14:24:43.204154+01	114941445721236454444	f
5	jopegomes_15	asd@gmail.com	$2b$10$Eeyn8AxFDELvSZMmJBLrrekp.droPfYiyoeMdQrwPfNjmuESCz2r6	2025-05-24 01:45:43.635314+01	\N	f
6	qwe	qwe@gmail.com	$2b$10$tDDGuH4JdPKAuzz0NlUg9.7axm1VZrtldeyWcT/M/eEPYKvJCDON6	2025-05-24 20:22:03.836358+01	\N	f
8	emanuel	rty@gmail.com	$2b$10$MQhUxNJKnNfqrqnpGq7HzuZNDmWiEwZ7qN/ynqx7oLs9FiZ98HQFm	2025-05-25 13:09:38.780178+01	\N	f
9	IconicPrints	iconicprintsoficial@gmail.com	$2b$10$qLOYaN6wzR710g7HBBpLDuUv8HJoCefg4TsUnfSU7KuMT/.sY4ZYm	2025-05-25 15:14:33.643935+01	108809104178473985146	f
10	MostLikedWebProject	mostlikedwebproject@gmail.com	$2b$10$hz3/X/X26bK6qVn7VFsides/JFX322.1goZh.w5s3eP5p06yyUDTO	2025-05-25 21:34:38.871089+01	111659102641992005039	f
\.


--
-- TOC entry 4909 (class 0 OID 16414)
-- Dependencies: 222
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
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 227
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 26, true);


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 230
-- Name: custom_poll_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_poll_votes_id_seq', 3, true);


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 232
-- Name: custom_polls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_polls_id_seq', 2, true);


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 225
-- Name: discussions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discussions_id_seq', 6, true);


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 234
-- Name: maritodle_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maritodle_players_id_seq', 97, true);


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 219
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 26, true);


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 223
-- Name: poll_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.poll_votes_id_seq', 23, true);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 221
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votes_id_seq', 74, true);


--
-- TOC entry 4731 (class 2606 OID 16478)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4736 (class 2606 OID 16530)
-- Name: custom_poll_votes custom_poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes
    ADD CONSTRAINT custom_poll_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4742 (class 2606 OID 16532)
-- Name: custom_polls custom_polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls
    ADD CONSTRAINT custom_polls_pkey PRIMARY KEY (id);


--
-- TOC entry 4726 (class 2606 OID 16462)
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- TOC entry 4747 (class 2606 OID 16534)
-- Name: maritodle_players maritodle_players_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players
    ADD CONSTRAINT maritodle_players_nome_key UNIQUE (nome);


--
-- TOC entry 4749 (class 2606 OID 16536)
-- Name: maritodle_players maritodle_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players
    ADD CONSTRAINT maritodle_players_pkey PRIMARY KEY (id);


--
-- TOC entry 4715 (class 2606 OID 16412)
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- TOC entry 4721 (class 2606 OID 16443)
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4707 (class 2606 OID 16402)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4709 (class 2606 OID 16435)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 4711 (class 2606 OID 16398)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4713 (class 2606 OID 16400)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4717 (class 2606 OID 16420)
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4719 (class 2606 OID 16422)
-- Name: votes votes_user_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_player_id_key UNIQUE (user_id, player_id);


--
-- TOC entry 4737 (class 1259 OID 16537)
-- Name: custom_poll_votes_poll_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_poll_votes_poll_id_idx ON public.custom_poll_votes USING btree (poll_id);


--
-- TOC entry 4738 (class 1259 OID 16538)
-- Name: custom_poll_votes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_poll_votes_user_id_idx ON public.custom_poll_votes USING btree (user_id);


--
-- TOC entry 4739 (class 1259 OID 16539)
-- Name: custom_poll_votes_user_poll_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX custom_poll_votes_user_poll_unique ON public.custom_poll_votes USING btree (user_id, poll_id);


--
-- TOC entry 4740 (class 1259 OID 16540)
-- Name: custom_polls_created_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_polls_created_by_idx ON public.custom_polls USING btree (created_by);


--
-- TOC entry 4732 (class 1259 OID 16493)
-- Name: idx_comments_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_author_id ON public.comments USING btree (author_id);


--
-- TOC entry 4733 (class 1259 OID 16494)
-- Name: idx_comments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_created_at ON public.comments USING btree (created_at);


--
-- TOC entry 4734 (class 1259 OID 16492)
-- Name: idx_comments_discussion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_discussion_id ON public.comments USING btree (discussion_id);


--
-- TOC entry 4727 (class 1259 OID 16489)
-- Name: idx_discussions_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_author_id ON public.discussions USING btree (author_id);


--
-- TOC entry 4728 (class 1259 OID 16490)
-- Name: idx_discussions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_created_at ON public.discussions USING btree (created_at);


--
-- TOC entry 4729 (class 1259 OID 16491)
-- Name: idx_discussions_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_updated_at ON public.discussions USING btree (updated_at);


--
-- TOC entry 4743 (class 1259 OID 16541)
-- Name: idx_maritodle_players_nacionalidade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_nacionalidade ON public.maritodle_players USING btree (nacionalidade);


--
-- TOC entry 4744 (class 1259 OID 16542)
-- Name: idx_maritodle_players_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_nome ON public.maritodle_players USING btree (nome);


--
-- TOC entry 4745 (class 1259 OID 16543)
-- Name: idx_maritodle_players_posicao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_posicao ON public.maritodle_players USING btree (posicao_principal);


--
-- TOC entry 4722 (class 1259 OID 16451)
-- Name: poll_votes_position_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX poll_votes_position_id_idx ON public.poll_votes USING btree (position_id);


--
-- TOC entry 4723 (class 1259 OID 16450)
-- Name: poll_votes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX poll_votes_user_id_idx ON public.poll_votes USING btree (user_id);


--
-- TOC entry 4724 (class 1259 OID 16449)
-- Name: poll_votes_user_position_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX poll_votes_user_position_unique ON public.poll_votes USING btree (user_id, position_id);


--
-- TOC entry 4758 (class 2620 OID 16497)
-- Name: comments trigger_update_discussion_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_discussion_timestamp AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_discussion_timestamp();


--
-- TOC entry 4754 (class 2606 OID 16484)
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4755 (class 2606 OID 16479)
-- Name: comments comments_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- TOC entry 4756 (class 2606 OID 16544)
-- Name: custom_poll_votes custom_poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes
    ADD CONSTRAINT custom_poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.custom_polls(id) ON DELETE CASCADE;


--
-- TOC entry 4757 (class 2606 OID 16554)
-- Name: custom_polls custom_polls_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls
    ADD CONSTRAINT custom_polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4753 (class 2606 OID 16463)
-- Name: discussions discussions_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4752 (class 2606 OID 16444)
-- Name: poll_votes poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4750 (class 2606 OID 16428)
-- Name: votes votes_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4751 (class 2606 OID 16423)
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-06-03 01:34:27

--
-- PostgreSQL database dump complete
--

