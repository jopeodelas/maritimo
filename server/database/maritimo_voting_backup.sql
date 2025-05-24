--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-05-23 14:28:07

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
-- TOC entry 4829 (class 1262 OID 16388)
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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 219
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


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
    google_id character varying(255)
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
-- TOC entry 4831 (class 0 OID 0)
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
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 221
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- TOC entry 4653 (class 2604 OID 16407)
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- TOC entry 4651 (class 2604 OID 16393)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4655 (class 2604 OID 16417)
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- TOC entry 4821 (class 0 OID 16404)
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
-- TOC entry 4819 (class 0 OID 16390)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, google_id) FROM stdin;
2	Jope1	asdasd@gmail.com	$2b$10$r5iqHmvm7D9BWcWwBwNGYexMzvTa4m/NPzgcVtnEYov1PmVi2j1IG	2025-05-20 20:54:52.622871+01	\N
3	salvador	sadsad@gmail.com	$2b$10$8T99dZuwvFTQ7e9X/T8L1.BnPepERg8.Lh8TQxgoa3WkRdLMjdscS	2025-05-20 22:48:41.300552+01	\N
1	Jope	jope.sousagomes8@gmail.com	$2b$10$327tnVdw9fx.v2jgOqrlVOgcj.fOUATFIiDVdi6iDTKYcCraggwDC	2025-05-19 23:30:09.016555+01	105806198648964062923
4	Jope THE BEAST	jopethebeast@gmail.com	$2b$10$l/nHhf.wRNdbvO3eXo33q.p9t/dRZV.0aj.CaIedG2eROv5oEpocy	2025-05-22 14:24:43.204154+01	114941445721236454444
\.


--
-- TOC entry 4823 (class 0 OID 16414)
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
\.


--
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 219
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 26, true);


--
-- TOC entry 4834 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 4835 (class 0 OID 0)
-- Dependencies: 221
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votes_id_seq', 27, true);


--
-- TOC entry 4666 (class 2606 OID 16412)
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- TOC entry 4658 (class 2606 OID 16402)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4660 (class 2606 OID 16435)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 4662 (class 2606 OID 16398)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4664 (class 2606 OID 16400)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4668 (class 2606 OID 16420)
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4670 (class 2606 OID 16422)
-- Name: votes votes_user_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_player_id_key UNIQUE (user_id, player_id);


--
-- TOC entry 4671 (class 2606 OID 16428)
-- Name: votes votes_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4672 (class 2606 OID 16423)
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-05-23 14:28:07

--
-- PostgreSQL database dump complete
--

