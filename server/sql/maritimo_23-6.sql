--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-23 13:55:36

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
-- TOC entry 5132 (class 1262 OID 16560)
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
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 257 (class 1255 OID 16561)
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

--
-- TOC entry 258 (class 1255 OID 16917)
-- Name: update_transfer_rumors_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_transfer_rumors_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_transfer_rumors_updated_at() OWNER TO postgres;

--
-- TOC entry 259 (class 1255 OID 16765)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16562)
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
-- TOC entry 218 (class 1259 OID 16569)
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
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 218
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 219 (class 1259 OID 16570)
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
-- TOC entry 220 (class 1259 OID 16574)
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
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 220
-- Name: custom_poll_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_poll_votes_id_seq OWNED BY public.custom_poll_votes.id;


--
-- TOC entry 221 (class 1259 OID 16575)
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
-- TOC entry 222 (class 1259 OID 16582)
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
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 222
-- Name: custom_polls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_polls_id_seq OWNED BY public.custom_polls.id;


--
-- TOC entry 223 (class 1259 OID 16583)
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
-- TOC entry 224 (class 1259 OID 16590)
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
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 224
-- Name: discussions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discussions_id_seq OWNED BY public.discussions.id;


--
-- TOC entry 238 (class 1259 OID 16735)
-- Name: football_lineups_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.football_lineups_cache (
    id integer NOT NULL,
    fixture_id integer NOT NULL,
    team_id integer NOT NULL,
    team_name character varying(100) NOT NULL,
    player_api_id integer NOT NULL,
    player_name character varying(100) NOT NULL,
    player_position character varying(10),
    is_starter boolean DEFAULT true NOT NULL,
    shirt_number integer,
    substitution_in integer,
    substitution_out integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.football_lineups_cache OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16734)
-- Name: football_lineups_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.football_lineups_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.football_lineups_cache_id_seq OWNER TO postgres;

--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 237
-- Name: football_lineups_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.football_lineups_cache_id_seq OWNED BY public.football_lineups_cache.id;


--
-- TOC entry 236 (class 1259 OID 16720)
-- Name: football_matches_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.football_matches_cache (
    id integer NOT NULL,
    fixture_id integer NOT NULL,
    home_team character varying(100) NOT NULL,
    away_team character varying(100) NOT NULL,
    match_date timestamp without time zone NOT NULL,
    status character varying(20) NOT NULL,
    season integer,
    league_name character varying(100),
    venue character varying(100),
    referee character varying(100),
    home_score integer,
    away_score integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    api_source character varying(50) DEFAULT 'API-Football'::character varying,
    processed boolean DEFAULT false
);


ALTER TABLE public.football_matches_cache OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16719)
-- Name: football_matches_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.football_matches_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.football_matches_cache_id_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 235
-- Name: football_matches_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.football_matches_cache_id_seq OWNED BY public.football_matches_cache.id;


--
-- TOC entry 240 (class 1259 OID 16749)
-- Name: football_sync_control; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.football_sync_control (
    id integer NOT NULL,
    last_full_sync timestamp without time zone,
    last_check_sync timestamp without time zone,
    total_matches_cached integer DEFAULT 0,
    api_requests_today integer DEFAULT 0,
    api_requests_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.football_sync_control OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16748)
-- Name: football_sync_control_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.football_sync_control_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.football_sync_control_id_seq OWNER TO postgres;

--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 239
-- Name: football_sync_control_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.football_sync_control_id_seq OWNED BY public.football_sync_control.id;


--
-- TOC entry 248 (class 1259 OID 16823)
-- Name: man_of_match_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.man_of_match_votes (
    id integer NOT NULL,
    player_id integer,
    user_id integer,
    match_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    player_type character varying(20) DEFAULT 'regular'::character varying,
    match_player_id integer,
    CONSTRAINT man_of_match_votes_player_type_check CHECK (((player_type)::text = ANY ((ARRAY['regular'::character varying, 'match'::character varying])::text[])))
);


ALTER TABLE public.man_of_match_votes OWNER TO postgres;

--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN man_of_match_votes.player_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.man_of_match_votes.player_type IS 'Tipo de jogador: regular (da tabela players) ou match (da tabela match_players)';


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN man_of_match_votes.match_player_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.man_of_match_votes.match_player_id IS 'ID do jogador na tabela match_players (usado quando player_type = match)';


--
-- TOC entry 247 (class 1259 OID 16822)
-- Name: man_of_match_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.man_of_match_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.man_of_match_votes_id_seq OWNER TO postgres;

--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 247
-- Name: man_of_match_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.man_of_match_votes_id_seq OWNED BY public.man_of_match_votes.id;


--
-- TOC entry 256 (class 1259 OID 16932)
-- Name: maritodle_daily_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maritodle_daily_attempts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    game_date date NOT NULL,
    attempts integer DEFAULT 0,
    won boolean DEFAULT false,
    completed boolean DEFAULT false,
    attempts_data jsonb DEFAULT '[]'::jsonb,
    won_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maritodle_daily_attempts OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16931)
-- Name: maritodle_daily_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maritodle_daily_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maritodle_daily_attempts_id_seq OWNER TO postgres;

--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 255
-- Name: maritodle_daily_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maritodle_daily_attempts_id_seq OWNED BY public.maritodle_daily_attempts.id;


--
-- TOC entry 254 (class 1259 OID 16920)
-- Name: maritodle_daily_games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maritodle_daily_games (
    id integer NOT NULL,
    date date NOT NULL,
    secret_player_id integer NOT NULL,
    secret_player_name character varying(100) NOT NULL,
    total_winners integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maritodle_daily_games OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16919)
-- Name: maritodle_daily_games_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maritodle_daily_games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maritodle_daily_games_id_seq OWNER TO postgres;

--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 253
-- Name: maritodle_daily_games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maritodle_daily_games_id_seq OWNED BY public.maritodle_daily_games.id;


--
-- TOC entry 225 (class 1259 OID 16591)
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
-- TOC entry 226 (class 1259 OID 16599)
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
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 226
-- Name: maritodle_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maritodle_players_id_seq OWNED BY public.maritodle_players.id;


--
-- TOC entry 250 (class 1259 OID 16848)
-- Name: match_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_players (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "position" character varying(100),
    image_url text,
    api_player_id integer,
    api_player_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.match_players OWNER TO postgres;

--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE match_players; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.match_players IS 'Tabela para jogadores temporários criados a partir da API para votações de jogos específicos';


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN match_players.api_player_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.match_players.api_player_id IS 'ID do jogador na API Football para referência';


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN match_players.api_player_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.match_players.api_player_name IS 'Nome original do jogador como vem da API';


--
-- TOC entry 249 (class 1259 OID 16847)
-- Name: match_players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_players_id_seq OWNER TO postgres;

--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 249
-- Name: match_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_players_id_seq OWNED BY public.match_players.id;


--
-- TOC entry 242 (class 1259 OID 16769)
-- Name: match_voting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_voting (
    id integer NOT NULL,
    home_team character varying(100) NOT NULL,
    away_team character varying(100) NOT NULL,
    match_date date NOT NULL,
    is_active boolean DEFAULT false,
    match_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.match_voting OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16768)
-- Name: match_voting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_voting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_voting_id_seq OWNER TO postgres;

--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 241
-- Name: match_voting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_voting_id_seq OWNED BY public.match_voting.id;


--
-- TOC entry 244 (class 1259 OID 16778)
-- Name: match_voting_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_voting_players (
    id integer NOT NULL,
    match_voting_id integer,
    player_id integer,
    player_type character varying(20) DEFAULT 'regular'::character varying,
    match_player_id integer,
    CONSTRAINT match_voting_players_player_type_check CHECK (((player_type)::text = ANY ((ARRAY['regular'::character varying, 'match'::character varying])::text[])))
);


ALTER TABLE public.match_voting_players OWNER TO postgres;

--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN match_voting_players.player_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.match_voting_players.player_type IS 'Tipo de jogador: regular (da tabela players) ou match (da tabela match_players)';


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN match_voting_players.match_player_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.match_voting_players.match_player_id IS 'ID do jogador na tabela match_players (usado quando player_type = match)';


--
-- TOC entry 243 (class 1259 OID 16777)
-- Name: match_voting_players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_voting_players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_voting_players_id_seq OWNER TO postgres;

--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 243
-- Name: match_voting_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_voting_players_id_seq OWNED BY public.match_voting_players.id;


--
-- TOC entry 246 (class 1259 OID 16797)
-- Name: player_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_ratings (
    id integer NOT NULL,
    player_id integer,
    user_id integer,
    match_id integer,
    rating integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    player_type character varying(20) DEFAULT 'regular'::character varying,
    match_player_id integer,
    CONSTRAINT player_ratings_player_type_check CHECK (((player_type)::text = ANY ((ARRAY['regular'::character varying, 'match'::character varying])::text[]))),
    CONSTRAINT player_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 10)))
);


ALTER TABLE public.player_ratings OWNER TO postgres;

--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN player_ratings.player_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.player_ratings.player_type IS 'Tipo de jogador: regular (da tabela players) ou match (da tabela match_players)';


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN player_ratings.match_player_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.player_ratings.match_player_id IS 'ID do jogador na tabela match_players (usado quando player_type = match)';


--
-- TOC entry 245 (class 1259 OID 16796)
-- Name: player_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.player_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_ratings_id_seq OWNER TO postgres;

--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 245
-- Name: player_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.player_ratings_id_seq OWNED BY public.player_ratings.id;


--
-- TOC entry 227 (class 1259 OID 16600)
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
-- TOC entry 228 (class 1259 OID 16606)
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
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 228
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- TOC entry 229 (class 1259 OID 16607)
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
-- TOC entry 230 (class 1259 OID 16611)
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
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 230
-- Name: poll_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.poll_votes_id_seq OWNED BY public.poll_votes.id;


--
-- TOC entry 252 (class 1259 OID 16883)
-- Name: transfer_rumors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transfer_rumors (
    id integer NOT NULL,
    unique_id character varying(255) NOT NULL,
    player_name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    club character varying(255) NOT NULL,
    value character varying(255) DEFAULT 'Valor não revelado'::character varying,
    status character varying(50) DEFAULT 'rumor'::character varying NOT NULL,
    date date NOT NULL,
    source character varying(255) NOT NULL,
    reliability integer DEFAULT 3 NOT NULL,
    description text,
    is_main_team boolean DEFAULT true,
    category character varying(50) DEFAULT 'senior'::character varying,
    "position" character varying(100),
    is_approved boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    CONSTRAINT transfer_rumors_category_check CHECK (((category)::text = ANY ((ARRAY['senior'::character varying, 'youth'::character varying, 'staff'::character varying, 'coach'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT transfer_rumors_reliability_check CHECK (((reliability >= 1) AND (reliability <= 5))),
    CONSTRAINT transfer_rumors_status_check CHECK (((status)::text = ANY ((ARRAY['rumor'::character varying, 'negociação'::character varying, 'confirmado'::character varying])::text[]))),
    CONSTRAINT transfer_rumors_type_check CHECK (((type)::text = ANY ((ARRAY['compra'::character varying, 'venda'::character varying, 'renovação'::character varying])::text[])))
);


ALTER TABLE public.transfer_rumors OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16882)
-- Name: transfer_rumors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transfer_rumors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transfer_rumors_id_seq OWNER TO postgres;

--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 251
-- Name: transfer_rumors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transfer_rumors_id_seq OWNED BY public.transfer_rumors.id;


--
-- TOC entry 231 (class 1259 OID 16612)
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
-- TOC entry 232 (class 1259 OID 16619)
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
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 232
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 233 (class 1259 OID 16620)
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
-- TOC entry 234 (class 1259 OID 16624)
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
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 234
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- TOC entry 4739 (class 2604 OID 16625)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 4742 (class 2604 OID 16626)
-- Name: custom_poll_votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes ALTER COLUMN id SET DEFAULT nextval('public.custom_poll_votes_id_seq'::regclass);


--
-- TOC entry 4744 (class 2604 OID 16627)
-- Name: custom_polls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls ALTER COLUMN id SET DEFAULT nextval('public.custom_polls_id_seq'::regclass);


--
-- TOC entry 4747 (class 2604 OID 16628)
-- Name: discussions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions ALTER COLUMN id SET DEFAULT nextval('public.discussions_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 16738)
-- Name: football_lineups_cache id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_lineups_cache ALTER COLUMN id SET DEFAULT nextval('public.football_lineups_cache_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 16723)
-- Name: football_matches_cache id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_matches_cache ALTER COLUMN id SET DEFAULT nextval('public.football_matches_cache_id_seq'::regclass);


--
-- TOC entry 4771 (class 2604 OID 16752)
-- Name: football_sync_control id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_sync_control ALTER COLUMN id SET DEFAULT nextval('public.football_sync_control_id_seq'::regclass);


--
-- TOC entry 4785 (class 2604 OID 16826)
-- Name: man_of_match_votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.man_of_match_votes ALTER COLUMN id SET DEFAULT nextval('public.man_of_match_votes_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 16935)
-- Name: maritodle_daily_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_daily_attempts ALTER COLUMN id SET DEFAULT nextval('public.maritodle_daily_attempts_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16923)
-- Name: maritodle_daily_games id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_daily_games ALTER COLUMN id SET DEFAULT nextval('public.maritodle_daily_games_id_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 16629)
-- Name: maritodle_players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players ALTER COLUMN id SET DEFAULT nextval('public.maritodle_players_id_seq'::regclass);


--
-- TOC entry 4788 (class 2604 OID 16851)
-- Name: match_players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_players ALTER COLUMN id SET DEFAULT nextval('public.match_players_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 16772)
-- Name: match_voting id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting ALTER COLUMN id SET DEFAULT nextval('public.match_voting_id_seq'::regclass);


--
-- TOC entry 4780 (class 2604 OID 16781)
-- Name: match_voting_players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting_players ALTER COLUMN id SET DEFAULT nextval('public.match_voting_players_id_seq'::regclass);


--
-- TOC entry 4782 (class 2604 OID 16800)
-- Name: player_ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_ratings ALTER COLUMN id SET DEFAULT nextval('public.player_ratings_id_seq'::regclass);


--
-- TOC entry 4754 (class 2604 OID 16630)
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- TOC entry 4756 (class 2604 OID 16631)
-- Name: poll_votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes ALTER COLUMN id SET DEFAULT nextval('public.poll_votes_id_seq'::regclass);


--
-- TOC entry 4791 (class 2604 OID 16886)
-- Name: transfer_rumors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_rumors ALTER COLUMN id SET DEFAULT nextval('public.transfer_rumors_id_seq'::regclass);


--
-- TOC entry 4758 (class 2604 OID 16632)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 16633)
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- TOC entry 5087 (class 0 OID 16562)
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
27	6	1	cold	2025-06-03 23:15:00.683317+01	2025-06-03 23:15:00.683317+01
28	6	1	hghghgh	2025-06-14 10:34:40.68462+01	2025-06-14 10:34:40.68462+01
\.


--
-- TOC entry 5089 (class 0 OID 16570)
-- Dependencies: 219
-- Data for Name: custom_poll_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_poll_votes (id, poll_id, user_id, option_index, created_at) FROM stdin;
1	1	1	1	2025-05-31 15:39:56.922517+01
2	2	1	0	2025-05-31 15:42:13.456213+01
3	2	11	1	2025-05-31 16:17:26.595478+01
\.


--
-- TOC entry 5091 (class 0 OID 16575)
-- Dependencies: 221
-- Data for Name: custom_polls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_polls (id, title, options, created_by, created_at, is_active) FROM stdin;
1	Vamos subir esta temporada?	{Sim,Não}	1	2025-05-31 15:38:30.716042+01	f
2	Em que posição vamos ficar na liga?	{1º,"2º ou 3º","4º a 8º","9º a 14º","15º a 18º"}	1	2025-05-31 15:42:00.276304+01	t
\.


--
-- TOC entry 5093 (class 0 OID 16583)
-- Dependencies: 223
-- Data for Name: discussions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discussions (id, title, description, author_id, created_at, updated_at) FROM stdin;
6	Que jogadores deveriam ser contratados nesta janela de transferências?	Quero apenas opções realistas	1	2025-05-30 02:57:03.590773+01	2025-06-14 10:34:40.704252+01
\.


--
-- TOC entry 5108 (class 0 OID 16735)
-- Dependencies: 238
-- Data for Name: football_lineups_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.football_lineups_cache (id, fixture_id, team_id, team_name, player_api_id, player_name, player_position, is_starter, shirt_number, substitution_in, substitution_out, created_at) FROM stdin;
33	1231722	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
34	1231722	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
35	1231722	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
36	1231722	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
37	1231722	214	Maritimo	279584	Afonso Freitas	D	t	25	\N	\N	2025-06-16 15:24:16.664415
38	1231722	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
39	1231722	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
40	1231722	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
41	1231722	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
42	1231722	214	Maritimo	113585	E. Peña Zauner	F	t	71	\N	\N	2025-06-16 15:24:16.664415
43	1231722	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
44	1231722	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
45	1231722	214	Maritimo	104444	Carlos Daniel	M	f	16	\N	\N	2025-06-16 15:24:16.664415
46	1231722	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
47	1231722	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
48	1231722	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
49	1231722	214	Maritimo	323915	Pedro Teixeira	G	f	22	\N	\N	2025-06-16 15:24:16.664415
50	1231722	214	Maritimo	41962	Rodrigo Borges	D	f	24	\N	\N	2025-06-16 15:24:16.664415
51	1231722	214	Maritimo	41262	Fábio China	D	f	45	\N	\N	2025-06-16 15:24:16.664415
52	1231722	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
53	1231722	810	Vizela	47529	Miguel Ángel Morro	G	t	13	\N	\N	2025-06-16 15:24:16.664415
54	1231722	810	Vizela	351246	Rodrigo Ramos	F	t	21	\N	\N	2025-06-16 15:24:16.664415
55	1231722	810	Vizela	41744	A. Correia	D	t	41	\N	\N	2025-06-16 15:24:16.664415
56	1231722	810	Vizela	48573	J. Rhyner	D	t	4	\N	\N	2025-06-16 15:24:16.664415
57	1231722	810	Vizela	41443	João Reis	D	t	17	\N	\N	2025-06-16 15:24:16.664415
58	1231722	810	Vizela	24966	H. Mörschel	M	t	24	\N	\N	2025-06-16 15:24:16.664415
59	1231722	810	Vizela	128007	Yannick Semedo	M	t	20	\N	\N	2025-06-16 15:24:16.664415
60	1231722	810	Vizela	162481	Diogo Nascimento	M	t	90	\N	\N	2025-06-16 15:24:16.664415
61	1231722	810	Vizela	24115	D. Loppy	F	t	97	\N	\N	2025-06-16 15:24:16.664415
62	1231722	810	Vizela	371914	Vivaldo Semedo	F	t	18	\N	\N	2025-06-16 15:24:16.664415
63	1231722	810	Vizela	128345	T. Ntolla	F	t	99	\N	\N	2025-06-16 15:24:16.664415
64	1231722	810	Vizela	129785	Jota Gonçalves	D	f	6	\N	\N	2025-06-16 15:24:16.664415
65	1231722	810	Vizela	46087	A. Busnić	M	f	22	\N	\N	2025-06-16 15:24:16.664415
66	1231722	810	Vizela	10926	A. Bastunov	M	f	8	\N	\N	2025-06-16 15:24:16.664415
67	1231722	810	Vizela	428137	P. Obah	M	f	68	\N	\N	2025-06-16 15:24:16.664415
68	1231722	810	Vizela	8996	S. Petrov	F	f	9	\N	\N	2025-06-16 15:24:16.664415
69	1231722	810	Vizela	201691	U. Milovanović	F	f	23	\N	\N	2025-06-16 15:24:16.664415
70	1231722	810	Vizela	502645	Pedro Ramos	F	f	47	\N	\N	2025-06-16 15:24:16.664415
71	1231722	810	Vizela	279447	Jójó	D	f	77	\N	\N	2025-06-16 15:24:16.664415
72	1231722	810	Vizela	68436	K. Bieszczad	G	f	89	\N	\N	2025-06-16 15:24:16.664415
73	1231711	233	Oliveirense	41512	Ricardo Ribeiro	G	t	31	\N	\N	2025-06-16 15:24:16.664415
74	1231711	233	Oliveirense	426798	Mário Junior	D	t	13	\N	\N	2025-06-16 15:24:16.664415
75	1231711	233	Oliveirense	187918	Simão Martins	D	t	54	\N	\N	2025-06-16 15:24:16.664415
76	1231711	233	Oliveirense	281143	Frederico Namora	D	t	75	\N	\N	2025-06-16 15:24:16.664415
77	1231711	233	Oliveirense	41963	Diogo Casimiro	M	t	25	\N	\N	2025-06-16 15:24:16.664415
78	1231711	233	Oliveirense	370138	K. Nagata	M	t	17	\N	\N	2025-06-16 15:24:16.664415
79	1231711	233	Oliveirense	335043	Ž. Jevšenak	M	t	74	\N	\N	2025-06-16 15:24:16.664415
80	1231711	233	Oliveirense	279577	Luís Bastos	M	t	26	\N	\N	2025-06-16 15:24:16.664415
81	1231711	233	Oliveirense	190492	João Silva	F	t	79	\N	\N	2025-06-16 15:24:16.664415
82	1231711	233	Oliveirense	41224	Zé Manuel	F	t	70	\N	\N	2025-06-16 15:24:16.664415
83	1231711	233	Oliveirense	141738	Bruno Silva	F	t	14	\N	\N	2025-06-16 15:24:16.664415
84	1231711	233	Oliveirense	96380	Mesaque Dju	F	f	7	\N	\N	2025-06-16 15:24:16.664415
85	1231711	233	Oliveirense	41240	André Santos	M	f	8	\N	\N	2025-06-16 15:24:16.664415
86	1231711	233	Oliveirense	11459	M. Caballero	F	f	18	\N	\N	2025-06-16 15:24:16.664415
87	1231711	233	Oliveirense	80672	Joanderson	F	f	96	\N	\N	2025-06-16 15:24:16.664415
88	1231711	233	Oliveirense	33246	H. Mita	M	f	20	\N	\N	2025-06-16 15:24:16.664415
89	1231711	233	Oliveirense	195102	Gabriel Noga	D	f	3	\N	\N	2025-06-16 15:24:16.664415
90	1231711	233	Oliveirense	413952	Miguel Monteiro	F	f	9	\N	\N	2025-06-16 15:24:16.664415
91	1231711	233	Oliveirense	41116	Nuno Macedo	G	f	12	\N	\N	2025-06-16 15:24:16.664415
92	1231711	233	Oliveirense	10155	Klebinho	D	f	68	\N	\N	2025-06-16 15:24:16.664415
93	1231711	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
94	1231711	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
95	1231711	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
96	1231711	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
97	1231711	214	Maritimo	279584	Afonso Freitas	D	t	25	\N	\N	2025-06-16 15:24:16.664415
98	1231711	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
99	1231711	214	Maritimo	41452	Patrick Fernandes	M	t	29	\N	\N	2025-06-16 15:24:16.664415
100	1231711	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
101	1231711	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
102	1231711	214	Maritimo	319841	Fabio Blanco	M	t	7	\N	\N	2025-06-16 15:24:16.664415
103	1231711	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
104	1231711	214	Maritimo	41262	Fábio China	D	f	45	\N	\N	2025-06-16 15:24:16.664415
105	1231711	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
106	1231711	214	Maritimo	113585	E. Peña Zauner	F	f	71	\N	\N	2025-06-16 15:24:16.664415
107	1231711	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
108	1231711	214	Maritimo	197321	Michel	M	f	48	\N	\N	2025-06-16 15:24:16.664415
109	1231711	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
110	1231711	214	Maritimo	323915	Pedro Teixeira	G	f	22	\N	\N	2025-06-16 15:24:16.664415
111	1231711	214	Maritimo	41962	Rodrigo Borges	D	f	24	\N	\N	2025-06-16 15:24:16.664415
112	1231711	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
113	1231709	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
114	1231709	214	Maritimo	281416	Rodrigo Andrade	M	t	88	\N	\N	2025-06-16 15:24:16.664415
115	1231709	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
116	1231709	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
117	1231709	214	Maritimo	279584	Afonso Freitas	D	t	25	\N	\N	2025-06-16 15:24:16.664415
118	1231709	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
119	1231709	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
120	1231709	214	Maritimo	367849	Daniel Silva	F	t	46	\N	\N	2025-06-16 15:24:16.664415
121	1231709	214	Maritimo	330422	Pedro Silva	M	t	8	\N	\N	2025-06-16 15:24:16.664415
122	1231709	214	Maritimo	319841	Fabio Blanco	M	t	7	\N	\N	2025-06-16 15:24:16.664415
123	1231709	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
124	1231709	214	Maritimo	113585	E. Peña Zauner	F	f	71	\N	\N	2025-06-16 15:24:16.664415
125	1231709	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
126	1231709	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
127	1231709	214	Maritimo	41452	Patrick Fernandes	F	f	29	\N	\N	2025-06-16 15:24:16.664415
128	1231709	214	Maritimo	41962	Rodrigo Borges	D	f	24	\N	\N	2025-06-16 15:24:16.664415
129	1231709	214	Maritimo	195731	P. Borukov	F	f	9	\N	\N	2025-06-16 15:24:16.664415
130	1231709	214	Maritimo	104444	Carlos Daniel	M	f	16	\N	\N	2025-06-16 15:24:16.664415
131	1231709	214	Maritimo	303686	Kimiss	G	f	66	\N	\N	2025-06-16 15:24:16.664415
132	1231709	214	Maritimo	482991	David Freitas	D	f	43	\N	\N	2025-06-16 15:24:16.664415
133	1231709	213	Feirense	206260	Lucas Cañizares	G	t	97	\N	\N	2025-06-16 15:24:16.664415
134	1231709	213	Feirense	36833	C. Tassano	D	t	3	\N	\N	2025-06-16 15:24:16.664415
135	1231709	213	Feirense	279077	Filipe Almeida	D	t	76	\N	\N	2025-06-16 15:24:16.664415
136	1231709	213	Feirense	336677	Emanuel Fernandes	D	t	21	\N	\N	2025-06-16 15:24:16.664415
137	1231709	213	Feirense	41492	Diga	D	t	2	\N	\N	2025-06-16 15:24:16.664415
138	1231709	213	Feirense	13369	Neneco	M	t	17	\N	\N	2025-06-16 15:24:16.664415
139	1231709	213	Feirense	41863	Jorge Pereira	M	t	20	\N	\N	2025-06-16 15:24:16.664415
140	1231709	213	Feirense	126897	Zé Ricardo	D	t	12	\N	\N	2025-06-16 15:24:16.664415
141	1231709	213	Feirense	96348	Rúben Alves	F	t	10	\N	\N	2025-06-16 15:24:16.664415
142	1231709	213	Feirense	41508	S. Petkov	F	t	9	\N	\N	2025-06-16 15:24:16.664415
143	1231709	213	Feirense	41982	Leandro Antunes	F	t	7	\N	\N	2025-06-16 15:24:16.664415
144	1231709	213	Feirense	336597	José Macedo	D	f	23	\N	\N	2025-06-16 15:24:16.664415
145	1231709	213	Feirense	429026	A. Rehmi	F	f	77	\N	\N	2025-06-16 15:24:16.664415
146	1231709	213	Feirense	9322	Washington	M	f	6	\N	\N	2025-06-16 15:24:16.664415
147	1231709	213	Feirense	369043	I. Ali	D	f	13	\N	\N	2025-06-16 15:24:16.664415
148	1231709	213	Feirense	19594	O. Shodipo	F	f	25	\N	\N	2025-06-16 15:24:16.664415
149	1231709	213	Feirense	41260	Pedro Mateus	G	f	1	\N	\N	2025-06-16 15:24:16.664415
150	1231709	213	Feirense	480851	Gabi Miranda	M	f	18	\N	\N	2025-06-16 15:24:16.664415
151	1231709	213	Feirense	480852	S. Popoola	M	f	22	\N	\N	2025-06-16 15:24:16.664415
152	1231709	213	Feirense	274298	Tiago Ribeiro	M	f	88	\N	\N	2025-06-16 15:24:16.664415
153	1231701	4799	Torreense	9943	Lucas Paes	G	t	1	\N	\N	2025-06-16 15:24:16.664415
154	1231701	4799	Torreense	129779	Né Lopes	D	t	4	\N	\N	2025-06-16 15:24:16.664415
155	1231701	4799	Torreense	419915	N. Ahouonon	D	t	28	\N	\N	2025-06-16 15:24:16.664415
156	1231701	4799	Torreense	2331	Stopira	D	t	2	\N	\N	2025-06-16 15:24:16.664415
157	1231701	4799	Torreense	277159	Dani Bolt	M	t	22	\N	\N	2025-06-16 15:24:16.664415
158	1231701	4799	Torreense	57818	J. Balanta	M	t	30	\N	\N	2025-06-16 15:24:16.664415
159	1231701	4799	Torreense	11002	Rúben Pinto	M	t	6	\N	\N	2025-06-16 15:24:16.664415
160	1231701	4799	Torreense	2046	Javi Vázquez	M	t	23	\N	\N	2025-06-16 15:24:16.664415
161	1231701	4799	Torreense	286961	Manu Pozo	F	t	11	\N	\N	2025-06-16 15:24:16.664415
162	1231701	4799	Torreense	304476	Ethyan González	F	t	66	\N	\N	2025-06-16 15:24:16.664415
163	1231701	4799	Torreense	237292	D. Jean	F	t	27	\N	\N	2025-06-16 15:24:16.664415
164	1231701	4799	Torreense	279825	B. Agbor	D	f	46	\N	\N	2025-06-16 15:24:16.664415
165	1231701	4799	Torreense	41435	Pité	M	f	20	\N	\N	2025-06-16 15:24:16.664415
166	1231701	4799	Torreense	277055	Mathys Jean-Marie	F	f	75	\N	\N	2025-06-16 15:24:16.664415
167	1231701	4799	Torreense	275725	J. Lomboto	D	f	5	\N	\N	2025-06-16 15:24:16.664415
168	1231701	4799	Torreense	10154	Thiago Rodrigues	G	f	12	\N	\N	2025-06-16 15:24:16.664415
169	1231701	4799	Torreense	439817	A. Ali Abdallah	F	f	16	\N	\N	2025-06-16 15:24:16.664415
170	1231701	4799	Torreense	396231	A. Dacourt	M	f	24	\N	\N	2025-06-16 15:24:16.664415
171	1231701	4799	Torreense	91401	Vasco Oliveira	D	f	72	\N	\N	2025-06-16 15:24:16.664415
172	1231701	4799	Torreense	427076	David Costa	M	f	90	\N	\N	2025-06-16 15:24:16.664415
173	1231701	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
174	1231701	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
175	1231701	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
176	1231701	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
177	1231701	214	Maritimo	279584	Afonso Freitas	D	t	25	\N	\N	2025-06-16 15:24:16.664415
178	1231701	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
179	1231701	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
180	1231701	214	Maritimo	41452	Patrick Fernandes	M	t	29	\N	\N	2025-06-16 15:24:16.664415
181	1231701	214	Maritimo	323947	Francisco França	M	t	77	\N	\N	2025-06-16 15:24:16.664415
182	1231701	214	Maritimo	319841	Fabio Blanco	M	t	7	\N	\N	2025-06-16 15:24:16.664415
183	1231701	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
184	1231701	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
185	1231701	214	Maritimo	41262	Fábio China	D	f	45	\N	\N	2025-06-16 15:24:16.664415
186	1231701	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
187	1231701	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
188	1231701	214	Maritimo	113585	E. Peña Zauner	F	f	71	\N	\N	2025-06-16 15:24:16.664415
189	1231701	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
190	1231701	214	Maritimo	104444	Carlos Daniel	F	f	16	\N	\N	2025-06-16 15:24:16.664415
191	1231701	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
192	1231701	214	Maritimo	303686	Kimiss	G	f	66	\N	\N	2025-06-16 15:24:16.664415
193	1231690	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
194	1231690	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
195	1231690	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
196	1231690	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
197	1231690	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
198	1231690	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
199	1231690	214	Maritimo	323947	Francisco França	M	t	77	\N	\N	2025-06-16 15:24:16.664415
200	1231690	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
201	1231690	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
202	1231690	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
203	1231690	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
204	1231690	214	Maritimo	76933	V. Danilović	M	f	18	\N	\N	2025-06-16 15:24:16.664415
205	1231690	214	Maritimo	279584	Afonso Freitas	D	f	25	\N	\N	2025-06-16 15:24:16.664415
206	1231690	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
207	1231690	214	Maritimo	104444	Carlos Daniel	M	f	16	\N	\N	2025-06-16 15:24:16.664415
208	1231690	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
209	1231690	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
210	1231690	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
211	1231690	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
212	1231690	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
213	1231690	245	Mafra	43202	M. Fraisl	G	t	1	\N	\N	2025-06-16 15:24:16.664415
214	1231690	245	Mafra	21573	B. Passi	D	t	4	\N	\N	2025-06-16 15:24:16.664415
215	1231690	245	Mafra	9950	Rodrigo Freitas	D	t	32	\N	\N	2025-06-16 15:24:16.664415
216	1231690	245	Mafra	41581	Diogo Capitão	\N	t	66	\N	\N	2025-06-16 15:24:16.664415
217	1231690	245	Mafra	508800	Kauê Alves	D	t	14	\N	\N	2025-06-16 15:24:16.664415
218	1231690	245	Mafra	41473	Vítor Gonçalves	M	t	80	\N	\N	2025-06-16 15:24:16.664415
219	1231690	245	Mafra	279487	Lucas Gabriel	F	t	8	\N	\N	2025-06-16 15:24:16.664415
220	1231690	245	Mafra	435266	B. Djé Bi Djé	D	t	5	\N	\N	2025-06-16 15:24:16.664415
221	1231690	245	Mafra	340611	A. Nibe	M	t	9	\N	\N	2025-06-16 15:24:16.664415
222	1231690	245	Mafra	351146	F. Etim	F	t	90	\N	\N	2025-06-16 15:24:16.664415
223	1231690	245	Mafra	41482	B. Róchez	F	t	95	\N	\N	2025-06-16 15:24:16.664415
224	1231690	245	Mafra	49453	C. Kouakou	M	f	3	\N	\N	2025-06-16 15:24:16.664415
225	1231690	245	Mafra	438628	S. Iheanacho	M	f	19	\N	\N	2025-06-16 15:24:16.664415
226	1231690	245	Mafra	335055	Rodrigo Matos	F	f	7	\N	\N	2025-06-16 15:24:16.664415
227	1231690	245	Mafra	279102	Miguel Falé	F	f	10	\N	\N	2025-06-16 15:24:16.664415
228	1231690	245	Mafra	438717	Alamara Djabi	M	f	16	\N	\N	2025-06-16 15:24:16.664415
229	1231690	245	Mafra	401543	J. Kolawole	M	f	17	\N	\N	2025-06-16 15:24:16.664415
230	1231690	245	Mafra	374525	M. Ugboh	G	f	30	\N	\N	2025-06-16 15:24:16.664415
231	1231690	245	Mafra	450488	Gonçalo Barros	D	f	60	\N	\N	2025-06-16 15:24:16.664415
232	1231676	229	Benfica B	350337	André Gomes	G	t	75	\N	\N	2025-06-16 15:24:16.664415
233	1231676	229	Benfica B	474842	Leandro Santos	D	t	71	\N	\N	2025-06-16 15:24:16.664415
234	1231676	229	Benfica B	304827	Gustavo Marques	D	t	76	\N	\N	2025-06-16 15:24:16.664415
235	1231676	229	Benfica B	312164	J. Wynder	D	t	66	\N	\N	2025-06-16 15:24:16.664415
236	1231676	229	Benfica B	412743	Tiago Parente	D	t	91	\N	\N	2025-06-16 15:24:16.664415
237	1231676	229	Benfica B	335050	Nuno Félix	M	t	60	\N	\N	2025-06-16 15:24:16.664415
238	1231676	229	Benfica B	364811	Diogo Prioste	M	t	86	\N	\N	2025-06-16 15:24:16.664415
239	1231676	229	Benfica B	469662	Francisco Neto	F	t	54	\N	\N	2025-06-16 15:24:16.664415
240	1231676	229	Benfica B	345390	João Veloso	M	t	68	\N	\N	2025-06-16 15:24:16.664415
241	1231676	229	Benfica B	328781	Luan Farias	M	t	99	\N	\N	2025-06-16 15:24:16.664415
242	1231676	229	Benfica B	279444	José Melro	F	t	97	\N	\N	2025-06-16 15:24:16.664415
243	1231676	229	Benfica B	400525	Gonçalo Oliveira	D	f	64	\N	\N	2025-06-16 15:24:16.664415
244	1231676	229	Benfica B	349193	Hugo Félix	M	f	79	\N	\N	2025-06-16 15:24:16.664415
245	1231676	229	Benfica B	340547	Gustavo Varela	F	f	89	\N	\N	2025-06-16 15:24:16.664415
246	1231676	229	Benfica B	397737	Tiago Freitas	M	f	88	\N	\N	2025-06-16 15:24:16.664415
247	1231676	229	Benfica B	342967	Diogo Spencer	D	f	82	\N	\N	2025-06-16 15:24:16.664415
248	1231676	229	Benfica B	441269	P. Okon	M	f	72	\N	\N	2025-06-16 15:24:16.664415
249	1231676	229	Benfica B	379124	Kiko	D	f	78	\N	\N	2025-06-16 15:24:16.664415
250	1231676	229	Benfica B	378849	Pedro Souza	G	f	92	\N	\N	2025-06-16 15:24:16.664415
251	1231676	229	Benfica B	349486	T. Moreira	M	f	95	\N	\N	2025-06-16 15:24:16.664415
252	1231676	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
253	1231676	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
254	1231676	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
255	1231676	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
256	1231676	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
257	1231676	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
258	1231676	214	Maritimo	323947	Francisco França	M	t	77	\N	\N	2025-06-16 15:24:16.664415
259	1231676	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
260	1231676	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
261	1231676	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
262	1231676	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
263	1231676	214	Maritimo	279584	Afonso Freitas	D	f	25	\N	\N	2025-06-16 15:24:16.664415
264	1231676	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
265	1231676	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
266	1231676	214	Maritimo	104444	Carlos Daniel	M	f	16	\N	\N	2025-06-16 15:24:16.664415
267	1231676	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
268	1231676	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
269	1231676	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
270	1231676	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
271	1231676	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
272	1231672	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
273	1231672	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
274	1231672	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
275	1231672	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
276	1231672	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
277	1231672	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
278	1231672	214	Maritimo	323947	Francisco França	M	t	77	\N	\N	2025-06-16 15:24:16.664415
279	1231672	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
280	1231672	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
281	1231672	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
282	1231672	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
283	1231672	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
284	1231672	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
285	1231672	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
286	1231672	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
287	1231672	214	Maritimo	41962	Rodrigo Borges	D	f	24	\N	\N	2025-06-16 15:24:16.664415
288	1231672	214	Maritimo	373827	N. Nsingi	F	f	27	\N	\N	2025-06-16 15:24:16.664415
289	1231672	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
290	1231672	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
291	1231672	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
292	1231672	244	Leixoes	41992	Daniel Figueira	G	t	24	\N	\N	2025-06-16 15:24:16.664415
293	1231672	244	Leixoes	41905	João Amorim	M	t	61	\N	\N	2025-06-16 15:24:16.664415
294	1231672	244	Leixoes	10164	Rafael Santos	D	t	3	\N	\N	2025-06-16 15:24:16.664415
295	1231672	244	Leixoes	41414	Hugo Basto	D	t	14	\N	\N	2025-06-16 15:24:16.664415
296	1231672	244	Leixoes	41352	Henrique	D	t	23	\N	\N	2025-06-16 15:24:16.664415
297	1231672	244	Leixoes	41555	Fabinho	M	t	27	\N	\N	2025-06-16 15:24:16.664415
298	1231672	244	Leixoes	119443	H. Zagbayou	M	t	13	\N	\N	2025-06-16 15:24:16.664415
299	1231672	244	Leixoes	324842	André Seruca	M	t	30	\N	\N	2025-06-16 15:24:16.664415
300	1231672	244	Leixoes	311158	Werton	F	t	7	\N	\N	2025-06-16 15:24:16.664415
301	1231672	244	Leixoes	306862	Bica	F	t	29	\N	\N	2025-06-16 15:24:16.664415
302	1231672	244	Leixoes	41288	Ricardo Valente	F	t	91	\N	\N	2025-06-16 15:24:16.664415
303	1231672	244	Leixoes	41776	Rodrigo Martins	F	f	70	\N	\N	2025-06-16 15:24:16.664415
304	1231672	244	Leixoes	41153	André André	M	f	11	\N	\N	2025-06-16 15:24:16.664415
305	1231672	244	Leixoes	41467	I. Alhassan	D	f	18	\N	\N	2025-06-16 15:24:16.664415
306	1231672	244	Leixoes	188416	R. N'Do	F	f	77	\N	\N	2025-06-16 15:24:16.664415
307	1231672	244	Leixoes	12494	Rafael Martins	F	f	9	\N	\N	2025-06-16 15:24:16.664415
308	1231672	244	Leixoes	335648	Thiago Balieiro	D	f	2	\N	\N	2025-06-16 15:24:16.664415
309	1231672	244	Leixoes	190491	Paulité	F	f	10	\N	\N	2025-06-16 15:24:16.664415
310	1231672	244	Leixoes	41639	Jean Felipe	D	f	12	\N	\N	2025-06-16 15:24:16.664415
311	1231672	244	Leixoes	41904	I. Stefanović	G	f	51	\N	\N	2025-06-16 15:24:16.664415
312	1231660	235	Penafiel	41142	Miguel Oliveira	G	t	1	\N	\N	2025-06-16 15:24:16.664415
313	1231660	235	Penafiel	41995	Miguel Maga	D	t	68	\N	\N	2025-06-16 15:24:16.664415
314	1231660	235	Penafiel	125352	João Miguel	D	t	4	\N	\N	2025-06-16 15:24:16.664415
315	1231660	235	Penafiel	351042	Gustavo Fernandes	D	t	3	\N	\N	2025-06-16 15:24:16.664415
316	1231660	235	Penafiel	142507	João Silva	D	t	15	\N	\N	2025-06-16 15:24:16.664415
317	1231660	235	Penafiel	41646	Reko	M	t	8	\N	\N	2025-06-16 15:24:16.664415
318	1231660	235	Penafiel	11006	Tiago Rodrigues	M	t	20	\N	\N	2025-06-16 15:24:16.664415
319	1231660	235	Penafiel	277194	Diogo Batista	M	t	21	\N	\N	2025-06-16 15:24:16.664415
320	1231660	235	Penafiel	41534	S. Fatai	F	t	77	\N	\N	2025-06-16 15:24:16.664415
321	1231660	235	Penafiel	331960	André Silva	F	t	30	\N	\N	2025-06-16 15:24:16.664415
322	1231660	235	Penafiel	41257	Robinho	F	t	75	\N	\N	2025-06-16 15:24:16.664415
323	1231660	235	Penafiel	322936	Pedro Vieira	F	f	7	\N	\N	2025-06-16 15:24:16.664415
324	1231660	235	Penafiel	384082	Hélder Suker	F	f	9	\N	\N	2025-06-16 15:24:16.664415
325	1231660	235	Penafiel	33107	Ewerton	M	f	88	\N	\N	2025-06-16 15:24:16.664415
326	1231660	235	Penafiel	481214	João Leal	F	f	11	\N	\N	2025-06-16 15:24:16.664415
327	1231660	235	Penafiel	332048	Jota Silva	F	f	10	\N	\N	2025-06-16 15:24:16.664415
328	1231660	235	Penafiel	119525	Bruno Pereira	D	f	14	\N	\N	2025-06-16 15:24:16.664415
329	1231660	235	Penafiel	279107	Diogo Brito	D	f	26	\N	\N	2025-06-16 15:24:16.664415
330	1231660	235	Penafiel	427077	Gonçalo Negrão	D	f	27	\N	\N	2025-06-16 15:24:16.664415
331	1231660	235	Penafiel	41959	Filipe Ferreira	G	f	73	\N	\N	2025-06-16 15:24:16.664415
332	1231660	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
333	1231660	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
334	1231660	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
335	1231660	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
336	1231660	214	Maritimo	10300	Igor Julião	D	t	2	\N	\N	2025-06-16 15:24:16.664415
337	1231660	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
338	1231660	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
339	1231660	214	Maritimo	41452	Patrick Fernandes	M	t	29	\N	\N	2025-06-16 15:24:16.664415
340	1231660	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
341	1231660	214	Maritimo	319841	Fabio Blanco	M	t	7	\N	\N	2025-06-16 15:24:16.664415
342	1231660	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
343	1231660	214	Maritimo	41262	Fábio China	D	f	45	\N	\N	2025-06-16 15:24:16.664415
344	1231660	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
345	1231660	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
346	1231660	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
347	1231660	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
348	1231660	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
349	1231660	214	Maritimo	104444	Carlos Daniel	F	f	16	\N	\N	2025-06-16 15:24:16.664415
350	1231660	214	Maritimo	113585	E. Peña Zauner	F	f	71	\N	\N	2025-06-16 15:24:16.664415
351	1231660	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
352	1231654	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
353	1231654	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
354	1231654	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
355	1231654	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
356	1231654	214	Maritimo	279584	Afonso Freitas	D	t	25	\N	\N	2025-06-16 15:24:16.664415
357	1231654	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
358	1231654	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
359	1231654	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
360	1231654	214	Maritimo	41452	Patrick Fernandes	M	t	29	\N	\N	2025-06-16 15:24:16.664415
361	1231654	214	Maritimo	319841	Fabio Blanco	M	t	7	\N	\N	2025-06-16 15:24:16.664415
362	1231654	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
363	1231654	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
364	1231654	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
365	1231654	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
366	1231654	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
367	1231654	214	Maritimo	113585	E. Peña Zauner	F	f	71	\N	\N	2025-06-16 15:24:16.664415
368	1231654	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
369	1231654	214	Maritimo	104444	Carlos Daniel	F	f	16	\N	\N	2025-06-16 15:24:16.664415
370	1231654	214	Maritimo	373827	N. Nsingi	F	f	27	\N	\N	2025-06-16 15:24:16.664415
371	1231654	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
372	1231654	4744	Felgueiras 1932	141826	Bruno Pinto	G	t	24	\N	\N	2025-06-16 15:24:16.664415
373	1231654	4744	Felgueiras 1932	279250	Eirô	D	t	61	\N	\N	2025-06-16 15:24:16.664415
374	1231654	4744	Felgueiras 1932	429607	Afonso Silva	D	t	34	\N	\N	2025-06-16 15:24:16.664415
375	1231654	4744	Felgueiras 1932	180365	Guilherme Ferreira	D	t	72	\N	\N	2025-06-16 15:24:16.664415
376	1231654	4744	Felgueiras 1932	129032	E. Banguera	D	t	29	\N	\N	2025-06-16 15:24:16.664415
377	1231654	4744	Felgueiras 1932	96602	Landinho	M	t	8	\N	\N	2025-06-16 15:24:16.664415
378	1231654	4744	Felgueiras 1932	142289	Aílson Tavares	M	t	42	\N	\N	2025-06-16 15:24:16.664415
379	1231654	4744	Felgueiras 1932	194853	João Santos	F	t	90	\N	\N	2025-06-16 15:24:16.664415
380	1231654	4744	Felgueiras 1932	279101	Vasco Moreira	M	t	6	\N	\N	2025-06-16 15:24:16.664415
381	1231654	4744	Felgueiras 1932	142069	Léo Teixeira	F	t	19	\N	\N	2025-06-16 15:24:16.664415
382	1231654	4744	Felgueiras 1932	41507	João Silva	F	t	99	\N	\N	2025-06-16 15:24:16.664415
383	1231654	4744	Felgueiras 1932	401475	Brandão	F	f	9	\N	\N	2025-06-16 15:24:16.664415
384	1231654	4744	Felgueiras 1932	41559	Feliz Vaz	F	f	30	\N	\N	2025-06-16 15:24:16.664415
385	1231654	4744	Felgueiras 1932	279096	Gabi Pereira	M	f	18	\N	\N	2025-06-16 15:24:16.664415
386	1231654	4744	Felgueiras 1932	279100	David Veiga	M	f	21	\N	\N	2025-06-16 15:24:16.664415
387	1231654	4744	Felgueiras 1932	325994	Berna	M	f	26	\N	\N	2025-06-16 15:24:16.664415
388	1231654	4744	Felgueiras 1932	41380	Cristiano Figueiredo	G	f	13	\N	\N	2025-06-16 15:24:16.664415
389	1231654	4744	Felgueiras 1932	41640	Mike	D	f	20	\N	\N	2025-06-16 15:24:16.664415
390	1231654	4744	Felgueiras 1932	141680	Rui Rampa	D	f	23	\N	\N	2025-06-16 15:24:16.664415
391	1231654	4744	Felgueiras 1932	163045	E. Ayiah	F	f	84	\N	\N	2025-06-16 15:24:16.664415
392	1231646	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
393	1231646	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
394	1231646	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
395	1231646	214	Maritimo	41962	Rodrigo Borges	D	t	24	\N	\N	2025-06-16 15:24:16.664415
396	1231646	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
397	1231646	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
398	1231646	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
399	1231646	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
400	1231646	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
401	1231646	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
402	1231646	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
403	1231646	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
404	1231646	214	Maritimo	141764	Ibrahima	M	f	98	\N	\N	2025-06-16 15:24:16.664415
405	1231646	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
406	1231646	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
407	1231646	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
408	1231646	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
409	1231646	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
410	1231646	214	Maritimo	373827	N. Nsingi	F	f	27	\N	\N	2025-06-16 15:24:16.664415
411	1231646	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
412	1231646	238	Academico Viseu	41484	Bruno Brígido	G	t	1	\N	\N	2025-06-16 15:24:16.664415
413	1231646	238	Academico Viseu	41413	Paulinho	D	t	77	\N	\N	2025-06-16 15:24:16.664415
414	1231646	238	Academico Viseu	69975	André Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
415	1231646	238	Academico Viseu	195382	Igor Milioransa	D	t	66	\N	\N	2025-06-16 15:24:16.664415
416	1231646	238	Academico Viseu	41693	Henrique Gomes	D	t	55	\N	\N	2025-06-16 15:24:16.664415
417	1231646	238	Academico Viseu	3438	Sori Mané	M	t	16	\N	\N	2025-06-16 15:24:16.664415
418	1231646	238	Academico Viseu	41753	Luís Silva	M	t	27	\N	\N	2025-06-16 15:24:16.664415
419	1231646	238	Academico Viseu	6524	A. Marinelli	F	t	34	\N	\N	2025-06-16 15:24:16.664415
420	1231646	238	Academico Viseu	90693	C. Kahraman	M	t	18	\N	\N	2025-06-16 15:24:16.664415
421	1231646	238	Academico Viseu	201264	G. Ott	M	t	11	\N	\N	2025-06-16 15:24:16.664415
422	1231646	238	Academico Viseu	41761	André Clóvis	F	t	33	\N	\N	2025-06-16 15:24:16.664415
423	1231646	238	Academico Viseu	41686	Yuri Araújo	M	f	7	\N	\N	2025-06-16 15:24:16.664415
424	1231646	238	Academico Viseu	313847	S. Koné	M	f	8	\N	\N	2025-06-16 15:24:16.664415
425	1231646	238	Academico Viseu	129795	Diogo Almeida	F	f	9	\N	\N	2025-06-16 15:24:16.664415
426	1231646	238	Academico Viseu	161927	Nils Mortimer	F	f	17	\N	\N	2025-06-16 15:24:16.664415
427	1231646	238	Academico Viseu	38730	N. Thomas	F	f	24	\N	\N	2025-06-16 15:24:16.664415
428	1231646	238	Academico Viseu	215976	N. Michelis	D	f	2	\N	\N	2025-06-16 15:24:16.664415
429	1231646	238	Academico Viseu	288219	João Pinto	D	f	3	\N	\N	2025-06-16 15:24:16.664415
430	1231646	238	Academico Viseu	119352	Miguel Bandarra	D	f	28	\N	\N	2025-06-16 15:24:16.664415
431	1231646	238	Academico Viseu	110105	D. Gril	G	f	75	\N	\N	2025-06-16 15:24:16.664415
432	1231638	243	FC Porto B	80667	Samuel Portugal	G	t	94	\N	\N	2025-06-16 15:24:16.664415
433	1231638	243	FC Porto B	352994	João Moreira	D	t	45	\N	\N	2025-06-16 15:24:16.664415
434	1231638	243	FC Porto B	336683	Gabriel Brás	D	t	73	\N	\N	2025-06-16 15:24:16.664415
435	1231638	243	FC Porto B	321845	Felipe Silva	D	t	44	\N	\N	2025-06-16 15:24:16.664415
436	1231638	243	FC Porto B	449630	Martim Cunha	D	t	84	\N	\N	2025-06-16 15:24:16.664415
437	1231638	243	FC Porto B	392252	André Oliveira	M	t	68	\N	\N	2025-06-16 15:24:16.664415
438	1231638	243	FC Porto B	237165	Domingos Andrade	M	t	88	\N	\N	2025-06-16 15:24:16.664415
439	1231638	243	FC Porto B	400511	Gil Martins	M	t	90	\N	\N	2025-06-16 15:24:16.664415
440	1231638	243	FC Porto B	400550	Gonçalo Sousa	M	t	49	\N	\N	2025-06-16 15:24:16.664415
441	1231638	243	FC Porto B	394925	T. Melnichenko	F	t	43	\N	\N	2025-06-16 15:24:16.664415
442	1231638	243	FC Porto B	281933	L. Vonić	F	t	79	\N	\N	2025-06-16 15:24:16.664415
443	1231638	243	FC Porto B	278941	A. Marcus	M	f	98	\N	\N	2025-06-16 15:24:16.664415
444	1231638	243	FC Porto B	361372	Tiago Andrade	M	f	59	\N	\N	2025-06-16 15:24:16.664415
445	1231638	243	FC Porto B	158107	Rodrigo Fernandes	M	f	62	\N	\N	2025-06-16 15:24:16.664415
446	1231638	243	FC Porto B	441250	Anhá Candé	F	f	95	\N	\N	2025-06-16 15:24:16.664415
447	1231638	243	FC Porto B	345428	Luís Gomes	D	f	64	\N	\N	2025-06-16 15:24:16.664415
448	1231638	243	FC Porto B	386871	Dinis Rodrigues	D	f	76	\N	\N	2025-06-16 15:24:16.664415
449	1231638	243	FC Porto B	414430	B. Caicedo	F	f	87	\N	\N	2025-06-16 15:24:16.664415
450	1231638	243	FC Porto B	354585	Gonçalo Ribeiro	G	f	91	\N	\N	2025-06-16 15:24:16.664415
451	1231638	243	FC Porto B	400544	João Teixeira	M	f	92	\N	\N	2025-06-16 15:24:16.664415
452	1231638	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
453	1231638	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
454	1231638	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
455	1231638	214	Maritimo	279450	N. Madsen	D	t	5	\N	\N	2025-06-16 15:24:16.664415
456	1231638	214	Maritimo	279584	Afonso Freitas	M	t	25	\N	\N	2025-06-16 15:24:16.664415
457	1231638	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
458	1231638	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
459	1231638	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
460	1231638	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
461	1231638	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
462	1231638	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
463	1231638	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
464	1231638	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
465	1231638	214	Maritimo	373827	N. Nsingi	F	f	27	\N	\N	2025-06-16 15:24:16.664415
466	1231638	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
467	1231638	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
468	1231638	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
469	1231638	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
470	1231638	214	Maritimo	42002	Romain Correia	D	f	44	\N	\N	2025-06-16 15:24:16.664415
471	1231638	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
472	1231629	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
473	1231629	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
474	1231629	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
475	1231629	214	Maritimo	41962	Rodrigo Borges	D	t	24	\N	\N	2025-06-16 15:24:16.664415
476	1231629	214	Maritimo	279584	Afonso Freitas	M	t	25	\N	\N	2025-06-16 15:24:16.664415
477	1231629	214	Maritimo	373827	N. Nsingi	F	t	27	\N	\N	2025-06-16 15:24:16.664415
478	1231629	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
479	1231629	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
480	1231629	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
481	1231629	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
482	1231629	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
483	1231629	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
484	1231629	214	Maritimo	197321	Michel	M	f	48	\N	\N	2025-06-16 15:24:16.664415
485	1231629	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
486	1231629	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
487	1231629	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
488	1231629	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
489	1231629	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
490	1231629	214	Maritimo	279450	N. Madsen	D	f	5	\N	\N	2025-06-16 15:24:16.664415
491	1231629	214	Maritimo	41262	Fábio China	D	f	45	\N	\N	2025-06-16 15:24:16.664415
492	1231629	4662	União de Leiria	46811	P. Kieszek	G	t	1	\N	\N	2025-06-16 15:24:16.664415
493	1231629	4662	União de Leiria	279280	H. Sylla	D	t	52	\N	\N	2025-06-16 15:24:16.664415
494	1231629	4662	União de Leiria	336955	Víctor Rofino	D	t	5	\N	\N	2025-06-16 15:24:16.664415
495	1231629	4662	União de Leiria	43044	Tiago Ferreira	D	t	23	\N	\N	2025-06-16 15:24:16.664415
496	1231629	4662	União de Leiria	116559	Káká	D	t	15	\N	\N	2025-06-16 15:24:16.664415
497	1231629	4662	União de Leiria	306063	Ryan Guilherme	M	t	7	\N	\N	2025-06-16 15:24:16.664415
498	1231629	4662	União de Leiria	355405	T. D'Avilla	M	t	42	\N	\N	2025-06-16 15:24:16.664415
499	1231629	4662	União de Leiria	37587	J. van der Gaag	M	t	10	\N	\N	2025-06-16 15:24:16.664415
500	1231629	4662	União de Leiria	46957	Juan Muñoz	F	t	9	\N	\N	2025-06-16 15:24:16.664415
501	1231629	4662	União de Leiria	191322	O. Mbina	F	t	81	\N	\N	2025-06-16 15:24:16.664415
502	1231629	4662	União de Leiria	313569	João Resende	F	t	26	\N	\N	2025-06-16 15:24:16.664415
503	1231629	4662	União de Leiria	179070	Marc Baró	D	f	3	\N	\N	2025-06-16 15:24:16.664415
504	1231629	4662	União de Leiria	279326	Jair da Silva	F	f	11	\N	\N	2025-06-16 15:24:16.664415
505	1231629	4662	União de Leiria	6935	S. Singh	M	f	28	\N	\N	2025-06-16 15:24:16.664415
506	1231629	4662	União de Leiria	41591	Daniel dos Anjos	F	f	99	\N	\N	2025-06-16 15:24:16.664415
507	1231629	4662	União de Leiria	352387	Zé Vitor	D	f	14	\N	\N	2025-06-16 15:24:16.664415
508	1231629	4662	União de Leiria	42303	Diogo Amado	M	f	25	\N	\N	2025-06-16 15:24:16.664415
509	1231629	4662	União de Leiria	142194	Fábio Ferreira	G	f	29	\N	\N	2025-06-16 15:24:16.664415
510	1231629	4662	União de Leiria	1126	E. Kouassi	M	f	38	\N	\N	2025-06-16 15:24:16.664415
511	1231629	4662	União de Leiria	336670	David Monteiro	D	f	58	\N	\N	2025-06-16 15:24:16.664415
512	1231612	4724	Alverca	141575	João Bravim	G	t	98	\N	\N	2025-06-16 15:24:16.664415
513	1231612	4724	Alverca	41436	David Bruno	D	t	22	\N	\N	2025-06-16 15:24:16.664415
514	1231612	4724	Alverca	443576	Alysson	D	t	3	\N	\N	2025-06-16 15:24:16.664415
515	1231612	4724	Alverca	2363	Fernando Varela	D	t	5	\N	\N	2025-06-16 15:24:16.664415
516	1231612	4724	Alverca	287578	K. Shinga	D	t	74	\N	\N	2025-06-16 15:24:16.664415
517	1231612	4724	Alverca	157148	Pedro Bicalho	M	t	35	\N	\N	2025-06-16 15:24:16.664415
518	1231612	4724	Alverca	381606	Miguel Pires	M	t	16	\N	\N	2025-06-16 15:24:16.664415
519	1231612	4724	Alverca	307334	Brenner	F	t	7	\N	\N	2025-06-16 15:24:16.664415
520	1231612	4724	Alverca	119397	Diogo Martins	M	t	88	\N	\N	2025-06-16 15:24:16.664415
521	1231612	4724	Alverca	119291	Andrézinho	M	t	10	\N	\N	2025-06-16 15:24:16.664415
522	1231612	4724	Alverca	3327	Wilson Eduardo	F	t	18	\N	\N	2025-06-16 15:24:16.664415
523	1231612	4724	Alverca	10342	Iago Mendonça	D	f	4	\N	\N	2025-06-16 15:24:16.664415
524	1231612	4724	Alverca	41930	A. Bukia	M	f	20	\N	\N	2025-06-16 15:24:16.664415
525	1231612	4724	Alverca	41645	Ricardo Dias	M	f	25	\N	\N	2025-06-16 15:24:16.664415
526	1231612	4724	Alverca	9650	Reinaldo	F	f	12	\N	\N	2025-06-16 15:24:16.664415
527	1231612	4724	Alverca	311446	Thauan Lara	D	f	36	\N	\N	2025-06-16 15:24:16.664415
528	1231612	4724	Alverca	237259	Cristian	G	f	1	\N	\N	2025-06-16 15:24:16.664415
529	1231612	4724	Alverca	95252	S. Velázquez	D	f	6	\N	\N	2025-06-16 15:24:16.664415
530	1231612	4724	Alverca	432479	Rafael Conceição	M	f	77	\N	\N	2025-06-16 15:24:16.664415
531	1231612	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
532	1231612	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
533	1231612	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
534	1231612	214	Maritimo	41962	Rodrigo Borges	D	t	24	\N	\N	2025-06-16 15:24:16.664415
535	1231612	214	Maritimo	279584	Afonso Freitas	M	t	25	\N	\N	2025-06-16 15:24:16.664415
536	1231612	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
537	1231612	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
538	1231612	214	Maritimo	373827	N. Nsingi	F	t	27	\N	\N	2025-06-16 15:24:16.664415
539	1231612	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
540	1231612	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
541	1231612	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
542	1231612	214	Maritimo	41452	Patrick Fernandes	F	f	29	\N	\N	2025-06-16 15:24:16.664415
543	1231612	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
544	1231612	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
545	1231612	214	Maritimo	197321	Michel	M	f	48	\N	\N	2025-06-16 15:24:16.664415
546	1231612	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
547	1231612	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
548	1231612	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
549	1231612	214	Maritimo	266387	Erivaldo Almeida	D	f	4	\N	\N	2025-06-16 15:24:16.664415
550	1231612	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
551	1231603	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
552	1231603	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
553	1231603	214	Maritimo	41962	Rodrigo Borges	D	t	24	\N	\N	2025-06-16 15:24:16.664415
554	1231603	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
555	1231603	214	Maritimo	279584	Afonso Freitas	M	t	25	\N	\N	2025-06-16 15:24:16.664415
556	1231603	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
557	1231603	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
558	1231603	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
559	1231603	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
560	1231603	214	Maritimo	373827	N. Nsingi	F	t	27	\N	\N	2025-06-16 15:24:16.664415
561	1231603	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
562	1231603	214	Maritimo	41452	Patrick Fernandes	F	f	29	\N	\N	2025-06-16 15:24:16.664415
563	1231603	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
564	1231603	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
565	1231603	214	Maritimo	197321	Michel	M	f	48	\N	\N	2025-06-16 15:24:16.664415
566	1231603	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
567	1231603	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
568	1231603	214	Maritimo	279450	N. Madsen	D	f	5	\N	\N	2025-06-16 15:24:16.664415
569	1231603	214	Maritimo	113585	E. Peña Zauner	M	f	71	\N	\N	2025-06-16 15:24:16.664415
570	1231603	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
571	1231603	216	Portimonense	9764	Vinicius	G	t	1	\N	\N	2025-06-16 15:24:16.664415
572	1231603	216	Portimonense	10384	Heitor	D	t	21	\N	\N	2025-06-16 15:24:16.664415
573	1231603	216	Portimonense	193213	K. John	D	t	19	\N	\N	2025-06-16 15:24:16.664415
574	1231603	216	Portimonense	33236	Y. Kobayashi	D	t	13	\N	\N	2025-06-16 15:24:16.664415
575	1231603	216	Portimonense	238305	Keffel	D	t	80	\N	\N	2025-06-16 15:24:16.664415
576	1231603	216	Portimonense	321505	B. Acquah	F	t	27	\N	\N	2025-06-16 15:24:16.664415
577	1231603	216	Portimonense	196320	Francisco Varela	M	t	50	\N	\N	2025-06-16 15:24:16.664415
578	1231603	216	Portimonense	160440	Geovane	M	t	8	\N	\N	2025-06-16 15:24:16.664415
579	1231603	216	Portimonense	454968	C. Durán	F	t	28	\N	\N	2025-06-16 15:24:16.664415
580	1231603	216	Portimonense	279674	Tamble Monteiro	F	t	9	\N	\N	2025-06-16 15:24:16.664415
581	1231603	216	Portimonense	80275	Paulo Vitor	M	t	11	\N	\N	2025-06-16 15:24:16.664415
582	1231603	216	Portimonense	479327	Caio Santana	F	f	78	\N	\N	2025-06-16 15:24:16.664415
583	1231603	216	Portimonense	1038	H. Hevel	M	f	31	\N	\N	2025-06-16 15:24:16.664415
584	1231603	216	Portimonense	280963	J. Alegría	F	f	92	\N	\N	2025-06-16 15:24:16.664415
585	1231603	216	Portimonense	382973	E. Benedict	F	f	99	\N	\N	2025-06-16 15:24:16.664415
586	1231603	216	Portimonense	384398	Ruan	M	f	29	\N	\N	2025-06-16 15:24:16.664415
587	1231603	216	Portimonense	482038	S. Omrani	F	f	22	\N	\N	2025-06-16 15:24:16.664415
588	1231603	216	Portimonense	41268	Douglas Grolli	D	f	33	\N	\N	2025-06-16 15:24:16.664415
589	1231603	216	Portimonense	41525	M. Diaby	M	f	42	\N	\N	2025-06-16 15:24:16.664415
590	1231603	216	Portimonense	200282	Maycon Cleiton	G	f	26	\N	\N	2025-06-16 15:24:16.664415
591	1231595	223	Chaves	15304	Vozinha	G	t	1	\N	\N	2025-06-16 15:24:16.664415
592	1231595	223	Chaves	41304	Carraça	D	t	15	\N	\N	2025-06-16 15:24:16.664415
593	1231595	223	Chaves	187921	Bruno Rodrigues	D	t	4	\N	\N	2025-06-16 15:24:16.664415
594	1231595	223	Chaves	41521	J. Pius	D	t	40	\N	\N	2025-06-16 15:24:16.664415
595	1231595	223	Chaves	295904	Aarón Romero	D	t	5	\N	\N	2025-06-16 15:24:16.664415
596	1231595	223	Chaves	41275	Pedro Pelágio	M	t	11	\N	\N	2025-06-16 15:24:16.664415
597	1231595	223	Chaves	323569	Pedro Pinho	M	t	8	\N	\N	2025-06-16 15:24:16.664415
598	1231595	223	Chaves	47063	Alberto Soro	M	t	26	\N	\N	2025-06-16 15:24:16.664415
599	1231595	223	Chaves	296006	André Ricardo	M	t	20	\N	\N	2025-06-16 15:24:16.664415
600	1231595	223	Chaves	381611	Rúben Pina	M	t	88	\N	\N	2025-06-16 15:24:16.664415
601	1231595	223	Chaves	41428	Higor Platiny	F	t	29	\N	\N	2025-06-16 15:24:16.664415
602	1231595	223	Chaves	96415	Rui Gomes	F	f	23	\N	\N	2025-06-16 15:24:16.664415
603	1231595	223	Chaves	311084	Ktatau	M	f	12	\N	\N	2025-06-16 15:24:16.664415
604	1231595	223	Chaves	14174	R. Wilson	M	f	14	\N	\N	2025-06-16 15:24:16.664415
605	1231595	223	Chaves	41530	P. Ayongo	F	f	95	\N	\N	2025-06-16 15:24:16.664415
606	1231595	223	Chaves	41374	Wellington Carvalho	F	f	21	\N	\N	2025-06-16 15:24:16.664415
607	1231595	223	Chaves	41387	Vasco Fernandes	D	f	13	\N	\N	2025-06-16 15:24:16.664415
608	1231595	223	Chaves	262844	Tiago Almeida	D	f	19	\N	\N	2025-06-16 15:24:16.664415
609	1231595	223	Chaves	40555	Pedro Tiba	M	f	25	\N	\N	2025-06-16 15:24:16.664415
610	1231595	223	Chaves	119477	Rodrigo Moura	G	f	31	\N	\N	2025-06-16 15:24:16.664415
611	1231595	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
612	1231595	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
613	1231595	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
614	1231595	214	Maritimo	41962	Rodrigo Borges	D	t	24	\N	\N	2025-06-16 15:24:16.664415
615	1231595	214	Maritimo	279584	Afonso Freitas	M	t	25	\N	\N	2025-06-16 15:24:16.664415
616	1231595	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
617	1231595	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
618	1231595	214	Maritimo	113585	E. Peña Zauner	M	t	71	\N	\N	2025-06-16 15:24:16.664415
619	1231595	214	Maritimo	323947	Francisco França	M	t	77	\N	\N	2025-06-16 15:24:16.664415
620	1231595	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
621	1231595	214	Maritimo	41165	Alexandre Guedes	F	t	15	\N	\N	2025-06-16 15:24:16.664415
622	1231595	214	Maritimo	104444	Carlos Daniel	M	f	16	\N	\N	2025-06-16 15:24:16.664415
623	1231595	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
624	1231595	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
625	1231595	214	Maritimo	41262	Fábio China	D	f	45	\N	\N	2025-06-16 15:24:16.664415
626	1231595	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
627	1231595	214	Maritimo	266387	Erivaldo Almeida	D	f	4	\N	\N	2025-06-16 15:24:16.664415
628	1231595	214	Maritimo	279450	N. Madsen	D	f	5	\N	\N	2025-06-16 15:24:16.664415
629	1231595	214	Maritimo	197321	Michel	M	f	48	\N	\N	2025-06-16 15:24:16.664415
630	1231595	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
631	1231586	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
632	1231586	214	Maritimo	10300	Igor Julião	D	t	2	\N	\N	2025-06-16 15:24:16.664415
633	1231586	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
634	1231586	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
635	1231586	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
636	1231586	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
637	1231586	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
638	1231586	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
639	1231586	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
640	1231586	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
641	1231586	214	Maritimo	329553	Martim Tavares	F	t	79	\N	\N	2025-06-16 15:24:16.664415
642	1231586	214	Maritimo	195731	P. Borukov	F	f	9	\N	\N	2025-06-16 15:24:16.664415
643	1231586	214	Maritimo	197321	Michel	M	f	48	\N	\N	2025-06-16 15:24:16.664415
644	1231586	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
645	1231586	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
646	1231586	214	Maritimo	279450	N. Madsen	D	f	5	\N	\N	2025-06-16 15:24:16.664415
647	1231586	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
648	1231586	214	Maritimo	362914	Bernardo Gomes	M	f	10	\N	\N	2025-06-16 15:24:16.664415
649	1231586	214	Maritimo	41962	Rodrigo Borges	D	f	24	\N	\N	2025-06-16 15:24:16.664415
650	1231586	214	Maritimo	279584	Afonso Freitas	M	f	25	\N	\N	2025-06-16 15:24:16.664415
651	1231586	234	Pacos Ferreira	41088	Marafona	G	t	28	\N	\N	2025-06-16 15:24:16.664415
652	1231586	234	Pacos Ferreira	278342	Anilson	D	t	21	\N	\N	2025-06-16 15:24:16.664415
653	1231586	234	Pacos Ferreira	266019	Diegão	D	t	3	\N	\N	2025-06-16 15:24:16.664415
654	1231586	234	Pacos Ferreira	30500	E. Ferigra	D	t	23	\N	\N	2025-06-16 15:24:16.664415
655	1231586	234	Pacos Ferreira	47255	Antunes	D	t	5	\N	\N	2025-06-16 15:24:16.664415
656	1231586	234	Pacos Ferreira	26778	Marcos Paulo	M	t	17	\N	\N	2025-06-16 15:24:16.664415
657	1231586	234	Pacos Ferreira	281433	Ronaldo Lumungo	M	t	90	\N	\N	2025-06-16 15:24:16.664415
658	1231586	234	Pacos Ferreira	330423	Gonçalo Nogueira	M	t	7	\N	\N	2025-06-16 15:24:16.664415
659	1231586	234	Pacos Ferreira	303680	I. Pavlić	M	t	11	\N	\N	2025-06-16 15:24:16.664415
660	1231586	234	Pacos Ferreira	323571	Costinha	M	t	30	\N	\N	2025-06-16 15:24:16.664415
661	1231586	234	Pacos Ferreira	76315	V. Morozov	F	t	10	\N	\N	2025-06-16 15:24:16.664415
662	1231586	234	Pacos Ferreira	129773	João Caiado	M	f	6	\N	\N	2025-06-16 15:24:16.664415
663	1231586	234	Pacos Ferreira	420402	Afonso Rodrigues	M	f	79	\N	\N	2025-06-16 15:24:16.664415
664	1231586	234	Pacos Ferreira	331965	Rui Pedro	D	f	18	\N	\N	2025-06-16 15:24:16.664415
665	1231586	234	Pacos Ferreira	337604	Miguel Mota	D	f	22	\N	\N	2025-06-16 15:24:16.664415
666	1231586	234	Pacos Ferreira	293457	J. Bazié	F	f	27	\N	\N	2025-06-16 15:24:16.664415
667	1231586	234	Pacos Ferreira	41437	Ícaro Silva	D	f	2	\N	\N	2025-06-16 15:24:16.664415
668	1231586	234	Pacos Ferreira	41301	Gonçalo Cardoso	D	f	4	\N	\N	2025-06-16 15:24:16.664415
669	1231586	234	Pacos Ferreira	278260	Jeimes	G	f	12	\N	\N	2025-06-16 15:24:16.664415
670	1231586	234	Pacos Ferreira	502644	Tomás Teixeira	F	f	34	\N	\N	2025-06-16 15:24:16.664415
671	1231584	218	Tondela	359001	Bernardo Fontes	G	t	31	\N	\N	2025-06-16 15:24:16.664415
672	1231584	218	Tondela	41269	Bebeto	D	t	2	\N	\N	2025-06-16 15:24:16.664415
673	1231584	218	Tondela	41148	João Afonso	D	t	5	\N	\N	2025-06-16 15:24:16.664415
674	1231584	218	Tondela	41438	Ricardo Alves	D	t	34	\N	\N	2025-06-16 15:24:16.664415
675	1231584	218	Tondela	142323	Tiago Manso	D	t	48	\N	\N	2025-06-16 15:24:16.664415
676	1231584	218	Tondela	62085	Hélder Tavares	M	t	8	\N	\N	2025-06-16 15:24:16.664415
677	1231584	218	Tondela	41613	Cícero	M	t	97	\N	\N	2025-06-16 15:24:16.664415
678	1231584	218	Tondela	41296	Talocha	D	t	18	\N	\N	2025-06-16 15:24:16.664415
679	1231584	218	Tondela	296851	Rodrigo Ramos	F	t	30	\N	\N	2025-06-16 15:24:16.664415
680	1231584	218	Tondela	41629	Roberto	F	t	17	\N	\N	2025-06-16 15:24:16.664415
681	1231584	218	Tondela	41423	Costinha	M	t	11	\N	\N	2025-06-16 15:24:16.664415
682	1231584	218	Tondela	41743	André Ceitil	M	f	6	\N	\N	2025-06-16 15:24:16.664415
683	1231584	218	Tondela	41454	António Xavier	F	f	7	\N	\N	2025-06-16 15:24:16.664415
684	1231584	218	Tondela	427380	Miro	F	f	9	\N	\N	2025-06-16 15:24:16.664415
685	1231584	218	Tondela	9576	Pedro Maranhão	F	f	21	\N	\N	2025-06-16 15:24:16.664415
686	1231584	218	Tondela	170520	Jordi Pola	D	f	4	\N	\N	2025-06-16 15:24:16.664415
687	1231584	218	Tondela	41539	Gabriel Souza	G	f	1	\N	\N	2025-06-16 15:24:16.664415
688	1231584	218	Tondela	377033	Cascavel	M	f	23	\N	\N	2025-06-16 15:24:16.664415
689	1231584	218	Tondela	330408	Nuno Cunha	M	f	26	\N	\N	2025-06-16 15:24:16.664415
690	1231584	218	Tondela	279095	E. Maviram	D	f	60	\N	\N	2025-06-16 15:24:16.664415
691	1231584	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
692	1231584	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
693	1231584	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
694	1231584	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
695	1231584	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
696	1231584	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
697	1231584	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
698	1231584	214	Maritimo	197321	Michel	M	t	48	\N	\N	2025-06-16 15:24:16.664415
699	1231584	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
700	1231584	214	Maritimo	329553	Martim Tavares	F	t	79	\N	\N	2025-06-16 15:24:16.664415
701	1231584	214	Maritimo	319841	Fabio Blanco	F	t	7	\N	\N	2025-06-16 15:24:16.664415
702	1231584	214	Maritimo	195731	P. Borukov	F	f	9	\N	\N	2025-06-16 15:24:16.664415
703	1231584	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
704	1231584	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
705	1231584	214	Maritimo	362914	Bernardo Gomes	M	f	10	\N	\N	2025-06-16 15:24:16.664415
706	1231584	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
707	1231584	214	Maritimo	279450	N. Madsen	D	f	5	\N	\N	2025-06-16 15:24:16.664415
708	1231584	214	Maritimo	367017	Francisco Gomes	F	f	17	\N	\N	2025-06-16 15:24:16.664415
709	1231584	214	Maritimo	41962	Rodrigo Borges	D	f	24	\N	\N	2025-06-16 15:24:16.664415
710	1231584	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
711	1231569	810	Vizela	185075	Ruly García	G	t	25	\N	\N	2025-06-16 15:24:16.664415
712	1231569	810	Vizela	279447	Jójó	D	t	77	\N	\N	2025-06-16 15:24:16.664415
713	1231569	810	Vizela	41744	A. Correia	D	t	41	\N	\N	2025-06-16 15:24:16.664415
714	1231569	810	Vizela	48573	J. Rhyner	D	t	4	\N	\N	2025-06-16 15:24:16.664415
715	1231569	810	Vizela	47156	O. Lebedenko	D	t	19	\N	\N	2025-06-16 15:24:16.664415
716	1231569	810	Vizela	24966	H. Mörschel	M	t	24	\N	\N	2025-06-16 15:24:16.664415
717	1231569	810	Vizela	128007	Yannick Semedo	M	t	20	\N	\N	2025-06-16 15:24:16.664415
718	1231569	810	Vizela	162481	Diogo Nascimento	M	t	90	\N	\N	2025-06-16 15:24:16.664415
719	1231569	810	Vizela	428137	P. Obah	F	t	68	\N	\N	2025-06-16 15:24:16.664415
720	1231569	810	Vizela	24115	D. Loppy	F	t	97	\N	\N	2025-06-16 15:24:16.664415
721	1231569	810	Vizela	351246	Rodrigo Ramos	M	t	21	\N	\N	2025-06-16 15:24:16.664415
722	1231569	810	Vizela	128345	N. Thio	F	f	99	\N	\N	2025-06-16 15:24:16.664415
723	1231569	810	Vizela	201691	U. Milovanović	F	f	23	\N	\N	2025-06-16 15:24:16.664415
724	1231569	810	Vizela	46087	A. Busnić	M	f	22	\N	\N	2025-06-16 15:24:16.664415
725	1231569	810	Vizela	10926	A. Bastunov	M	f	8	\N	\N	2025-06-16 15:24:16.664415
726	1231569	810	Vizela	41340	Miguel Tavares	M	f	38	\N	\N	2025-06-16 15:24:16.664415
727	1231569	810	Vizela	48420	F. Ruberto	G	f	1	\N	\N	2025-06-16 15:24:16.664415
728	1231569	810	Vizela	129785	Jota Gonçalves	D	f	6	\N	\N	2025-06-16 15:24:16.664415
729	1231569	810	Vizela	41443	João Reis	D	f	17	\N	\N	2025-06-16 15:24:16.664415
730	1231569	810	Vizela	371914	Vivaldo Semedo	F	f	18	\N	\N	2025-06-16 15:24:16.664415
731	1231569	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
732	1231569	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
733	1231569	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
734	1231569	214	Maritimo	41962	Rodrigo Borges	D	t	24	\N	\N	2025-06-16 15:24:16.664415
735	1231569	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
736	1231569	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
737	1231569	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
738	1231569	214	Maritimo	10300	Igor Julião	D	t	2	\N	\N	2025-06-16 15:24:16.664415
739	1231569	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
740	1231569	214	Maritimo	362914	Bernardo Gomes	M	t	10	\N	\N	2025-06-16 15:24:16.664415
741	1231569	214	Maritimo	329553	Martim Tavares	F	t	79	\N	\N	2025-06-16 15:24:16.664415
742	1231569	214	Maritimo	323947	Francisco França	M	f	77	\N	\N	2025-06-16 15:24:16.664415
743	1231569	214	Maritimo	279450	N. Madsen	D	f	5	\N	\N	2025-06-16 15:24:16.664415
744	1231569	214	Maritimo	195731	P. Borukov	F	f	9	\N	\N	2025-06-16 15:24:16.664415
745	1231569	214	Maritimo	367849	Daniel Silva	F	f	46	\N	\N	2025-06-16 15:24:16.664415
746	1231569	214	Maritimo	367017	Francisco Gomes	F	f	17	\N	\N	2025-06-16 15:24:16.664415
747	1231569	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
748	1231569	214	Maritimo	41262	Fábio China	D	f	45	\N	\N	2025-06-16 15:24:16.664415
749	1231569	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
750	1231569	214	Maritimo	333984	Carlos Almeida	F	f	72	\N	\N	2025-06-16 15:24:16.664415
751	1231558	214	Maritimo	323798	Gonçalo Tabuaço	G	t	99	\N	\N	2025-06-16 15:24:16.664415
752	1231558	214	Maritimo	277196	Tomás Domingos	D	t	21	\N	\N	2025-06-16 15:24:16.664415
753	1231558	214	Maritimo	41962	Rodrigo Borges	D	t	24	\N	\N	2025-06-16 15:24:16.664415
754	1231558	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
755	1231558	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
756	1231558	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
757	1231558	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
758	1231558	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
759	1231558	214	Maritimo	80381	Euller	M	t	7	\N	\N	2025-06-16 15:24:16.664415
760	1231558	214	Maritimo	329553	Martim Tavares	F	t	79	\N	\N	2025-06-16 15:24:16.664415
761	1231558	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
762	1231558	214	Maritimo	266387	Erivaldo Almeida	D	f	4	\N	\N	2025-06-16 15:24:16.664415
763	1231558	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
764	1231558	214	Maritimo	362914	Bernardo Gomes	M	f	10	\N	\N	2025-06-16 15:24:16.664415
765	1231558	214	Maritimo	10300	Igor Julião	D	f	2	\N	\N	2025-06-16 15:24:16.664415
766	1231558	214	Maritimo	367017	Francisco Gomes	F	f	17	\N	\N	2025-06-16 15:24:16.664415
767	1231558	214	Maritimo	130245	Samu	G	f	1	\N	\N	2025-06-16 15:24:16.664415
768	1231558	214	Maritimo	195731	P. Borukov	F	f	9	\N	\N	2025-06-16 15:24:16.664415
769	1231558	214	Maritimo	63556	Cristian Ponde	F	f	11	\N	\N	2025-06-16 15:24:16.664415
770	1231558	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
771	1231558	233	Oliveirense	278144	Arthur	G	t	87	\N	\N	2025-06-16 15:24:16.664415
772	1231558	233	Oliveirense	41963	Diogo Casimiro	D	t	25	\N	\N	2025-06-16 15:24:16.664415
773	1231558	233	Oliveirense	195102	Gabriel Noga	D	t	3	\N	\N	2025-06-16 15:24:16.664415
774	1231558	233	Oliveirense	279577	Luís Bastos	D	t	26	\N	\N	2025-06-16 15:24:16.664415
775	1231558	233	Oliveirense	281143	Frederico Namora	D	t	75	\N	\N	2025-06-16 15:24:16.664415
776	1231558	233	Oliveirense	41240	André Santos	M	t	8	\N	\N	2025-06-16 15:24:16.664415
777	1231558	233	Oliveirense	77827	Filipe Alves	M	t	5	\N	\N	2025-06-16 15:24:16.664415
778	1231558	233	Oliveirense	370138	K. Nagata	M	t	17	\N	\N	2025-06-16 15:24:16.664415
779	1231558	233	Oliveirense	1763	Candeias	M	t	7	\N	\N	2025-06-16 15:24:16.664415
780	1231558	233	Oliveirense	41224	Zé Manuel	F	t	70	\N	\N	2025-06-16 15:24:16.664415
781	1231558	233	Oliveirense	190492	João Silva	F	t	79	\N	\N	2025-06-16 15:24:16.664415
782	1231558	233	Oliveirense	279277	Tiago Veiga	F	f	11	\N	\N	2025-06-16 15:24:16.664415
783	1231558	233	Oliveirense	480411	T. Keating	D	f	22	\N	\N	2025-06-16 15:24:16.664415
784	1231558	233	Oliveirense	413952	Miguel Monteiro	F	f	9	\N	\N	2025-06-16 15:24:16.664415
785	1231558	233	Oliveirense	10155	Klebinho	D	f	68	\N	\N	2025-06-16 15:24:16.664415
786	1231558	233	Oliveirense	9839	Sabino	M	f	99	\N	\N	2025-06-16 15:24:16.664415
787	1231558	233	Oliveirense	3434	Rui Dabó	G	f	1	\N	\N	2025-06-16 15:24:16.664415
788	1231558	233	Oliveirense	288773	Bruno Ventura	M	f	10	\N	\N	2025-06-16 15:24:16.664415
789	1231558	233	Oliveirense	109384	I. Miyata	F	f	29	\N	\N	2025-06-16 15:24:16.664415
790	1231558	233	Oliveirense	190486	Schürrle	M	f	56	\N	\N	2025-06-16 15:24:16.664415
791	1231545	214	Maritimo	130245	Samu	G	t	1	\N	\N	2025-06-16 15:24:16.664415
792	1231545	214	Maritimo	10300	Igor Julião	D	t	2	\N	\N	2025-06-16 15:24:16.664415
793	1231545	214	Maritimo	42002	Romain Correia	D	t	44	\N	\N	2025-06-16 15:24:16.664415
794	1231545	214	Maritimo	266387	Erivaldo Almeida	D	t	4	\N	\N	2025-06-16 15:24:16.664415
795	1231545	214	Maritimo	41262	Fábio China	D	t	45	\N	\N	2025-06-16 15:24:16.664415
796	1231545	214	Maritimo	80381	Euller	M	t	7	\N	\N	2025-06-16 15:24:16.664415
797	1231545	214	Maritimo	141764	Ibrahima	M	t	98	\N	\N	2025-06-16 15:24:16.664415
798	1231545	214	Maritimo	76933	V. Danilović	M	t	18	\N	\N	2025-06-16 15:24:16.664415
799	1231545	214	Maritimo	104444	Carlos Daniel	M	t	16	\N	\N	2025-06-16 15:24:16.664415
800	1231545	214	Maritimo	195731	P. Borukov	F	t	9	\N	\N	2025-06-16 15:24:16.664415
801	1231545	214	Maritimo	41452	Patrick Fernandes	F	t	29	\N	\N	2025-06-16 15:24:16.664415
802	1231545	214	Maritimo	329553	Martim Tavares	F	f	79	\N	\N	2025-06-16 15:24:16.664415
803	1231545	214	Maritimo	330422	Pedro Silva	M	f	8	\N	\N	2025-06-16 15:24:16.664415
804	1231545	214	Maritimo	119448	André Rodrigues	F	f	28	\N	\N	2025-06-16 15:24:16.664415
805	1231545	214	Maritimo	367017	Francisco Gomes	F	f	17	\N	\N	2025-06-16 15:24:16.664415
806	1231545	214	Maritimo	277196	Tomás Domingos	D	f	21	\N	\N	2025-06-16 15:24:16.664415
807	1231545	214	Maritimo	63556	Cristian Ponde	F	f	11	\N	\N	2025-06-16 15:24:16.664415
808	1231545	214	Maritimo	41962	Rodrigo Borges	D	f	24	\N	\N	2025-06-16 15:24:16.664415
809	1231545	214	Maritimo	281416	Rodrigo Andrade	M	f	88	\N	\N	2025-06-16 15:24:16.664415
810	1231545	214	Maritimo	323798	Gonçalo Tabuaço	G	f	99	\N	\N	2025-06-16 15:24:16.664415
811	1231545	4799	Torreense	291769	Leandro Matheus	G	t	39	\N	\N	2025-06-16 15:24:16.664415
812	1231545	4799	Torreense	275725	J. Lomboto	M	t	5	\N	\N	2025-06-16 15:24:16.664415
813	1231545	4799	Torreense	2331	Stopira	D	t	2	\N	\N	2025-06-16 15:24:16.664415
814	1231545	4799	Torreense	419915	N. Ahouonon	D	t	28	\N	\N	2025-06-16 15:24:16.664415
815	1231545	4799	Torreense	308315	Vando Félix	F	t	21	\N	\N	2025-06-16 15:24:16.664415
816	1231545	4799	Torreense	11002	Rúben Pinto	M	t	6	\N	\N	2025-06-16 15:24:16.664415
817	1231545	4799	Torreense	57818	J. Balanta	M	t	30	\N	\N	2025-06-16 15:24:16.664415
818	1231545	4799	Torreense	427076	David Costa	M	t	90	\N	\N	2025-06-16 15:24:16.664415
819	1231545	4799	Torreense	2046	Javi Vázquez	M	t	23	\N	\N	2025-06-16 15:24:16.664415
820	1231545	4799	Torreense	286961	Manu Pozo	F	t	11	\N	\N	2025-06-16 15:24:16.664415
821	1231545	4799	Torreense	28689	T. Thomsen	F	t	9	\N	\N	2025-06-16 15:24:16.664415
822	1231545	4799	Torreense	277159	Dani Bolt	D	f	22	\N	\N	2025-06-16 15:24:16.664415
823	1231545	4799	Torreense	381617	Miguel Rebelo	D	f	7	\N	\N	2025-06-16 15:24:16.664415
824	1231545	4799	Torreense	415153	Talles Wander	F	f	19	\N	\N	2025-06-16 15:24:16.664415
825	1231545	4799	Torreense	91401	Vasco Oliveira	D	f	72	\N	\N	2025-06-16 15:24:16.664415
826	1231545	4799	Torreense	41722	Tiago Matos	D	f	13	\N	\N	2025-06-16 15:24:16.664415
827	1231545	4799	Torreense	379974	André Simões	M	f	26	\N	\N	2025-06-16 15:24:16.664415
828	1231545	4799	Torreense	475493	S. Henriksen	G	f	44	\N	\N	2025-06-16 15:24:16.664415
829	1231545	4799	Torreense	277055	Mathys Jean-Marie	F	f	75	\N	\N	2025-06-16 15:24:16.664415
830	1231545	4799	Torreense	306881	Luccas Paraizo	F	f	77	\N	\N	2025-06-16 15:24:16.664415
\.


--
-- TOC entry 5106 (class 0 OID 16720)
-- Dependencies: 236
-- Data for Name: football_matches_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.football_matches_cache (id, fixture_id, home_team, away_team, match_date, status, season, league_name, venue, referee, home_score, away_score, created_at, updated_at, api_source, processed) FROM stdin;
33	1231612	Alverca	Maritimo	2025-02-16 17:00:00	FT	\N	\N	\N	\N	5	\N	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
34	1231603	Maritimo	Portimonense	2025-02-08 15:30:00	FT	\N	\N	\N	\N	2	\N	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
35	1231595	Chaves	Maritimo	2025-02-02 14:00:00	FT	\N	\N	\N	\N	1	1	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
36	1231586	Maritimo	Pacos Ferreira	2025-01-25 15:30:00	FT	\N	\N	\N	\N	2	2	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
37	1231584	Tondela	Maritimo	2025-01-19 15:30:00	FT	\N	\N	\N	\N	\N	\N	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
38	1231569	Vizela	Maritimo	2025-01-05 15:30:00	FT	\N	\N	\N	\N	3	2	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
39	1231558	Maritimo	Oliveirense	2024-12-29 15:30:00	FT	\N	\N	\N	\N	1	2	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
40	1231545	Maritimo	Torreense	2024-12-15 15:30:00	FT	\N	\N	\N	\N	\N	3	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
21	1231722	Maritimo	Vizela	2025-05-16 19:30:00	FT	\N	\N	\N	\N	1	2	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
22	1231711	Oliveirense	Maritimo	2025-05-10 13:00:00	FT	\N	\N	\N	\N	1	1	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
23	1231709	Maritimo	Feirense	2025-05-04 14:30:00	FT	\N	\N	\N	\N	1	1	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
24	1231701	Torreense	Maritimo	2025-04-26 10:00:00	FT	\N	\N	\N	\N	2	2	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
25	1231690	Maritimo	Mafra	2025-04-20 14:30:00	FT	\N	\N	\N	\N	2	\N	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
26	1231676	Benfica B	Maritimo	2025-04-13 13:00:00	FT	\N	\N	\N	\N	1	2	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
27	1231672	Maritimo	Leixoes	2025-04-05 14:30:00	FT	\N	\N	\N	\N	1	1	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
28	1231660	Penafiel	Maritimo	2025-03-29 14:00:00	FT	\N	\N	\N	\N	\N	1	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
29	1231654	Maritimo	Felgueiras 1932	2025-03-15 14:00:00	FT	\N	\N	\N	\N	\N	\N	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
30	1231646	Maritimo	Academico Viseu	2025-03-09 14:00:00	FT	\N	\N	\N	\N	1	1	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
31	1231638	FC Porto B	Maritimo	2025-03-02 14:00:00	FT	\N	\N	\N	\N	\N	1	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
32	1231629	Maritimo	União de Leiria	2025-02-22 15:30:00	FT	\N	\N	\N	\N	1	2	2025-06-16 15:24:16.664415	2025-06-16 15:24:16.664415	API-Football	t
\.


--
-- TOC entry 5110 (class 0 OID 16749)
-- Dependencies: 240
-- Data for Name: football_sync_control; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.football_sync_control (id, last_full_sync, last_check_sync, total_matches_cached, api_requests_today, api_requests_date, created_at, updated_at) FROM stdin;
1	2025-06-16 15:24:16.664415	2025-06-22 13:03:50.561629	20	1	2025-06-22	2025-06-14 19:44:13.720482	2025-06-22 13:03:50.561629
\.


--
-- TOC entry 5118 (class 0 OID 16823)
-- Dependencies: 248
-- Data for Name: man_of_match_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.man_of_match_votes (id, player_id, user_id, match_id, created_at, player_type, match_player_id) FROM stdin;
19	2	5	421	2025-06-16 22:06:27.358612	match	\N
20	2	12	421	2025-06-16 22:08:42.808726	match	\N
21	11	6	421	2025-06-16 22:42:27.227038	regular	\N
22	2	10	421	2025-06-16 22:01:11.254375	match	\N
23	2	9	421	2025-06-16 21:53:27.392023	match	\N
24	2	1	421	2025-06-16 21:47:46.206257	match	\N
28	2	4	421	2025-06-16 15:24:49.190546	match	\N
30	2	14	421	2025-06-16 01:23:46.241373	match	\N
\.


--
-- TOC entry 5126 (class 0 OID 16932)
-- Dependencies: 256
-- Data for Name: maritodle_daily_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maritodle_daily_attempts (id, user_id, game_date, attempts, won, completed, attempts_data, won_at, created_at, updated_at) FROM stdin;
2	1	2025-06-19	2	t	t	[{"nome": "Ali Alipour", "palpite": {"id": 110, "nome": "Ali Alipour", "sexo": "65 jogos", "idade": 29, "papel": "Jogador", "trofeus": ["14 contribuições"], "altura_cm": 181, "ano_saida": 2022, "created_at": "2025-06-11T00:40:42.799Z", "updated_at": "2025-06-11T00:40:42.799Z", "ano_entrada": 2020, "nacionalidade": "Irão", "posicao_principal": "PL"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-baixo", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-baixo", "coluna": "idade"}, {"icone": "vermelho", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "vermelho", "coluna": "periodo"}], "timestamp": "2025-06-19T06:04:32.980Z"}, {"nome": "Antonio Zarzana", "palpite": {"id": 93, "nome": "Antonio Zarzana", "sexo": "6 jogos", "idade": 23, "papel": "Jogador", "papeis": ["Jogador"], "trofeus": [], "posicoes": ["ED/MCO"], "altura_cm": 177, "ano_saida": 2023, "created_at": "2025-06-02T01:41:23.338Z", "updated_at": "2025-06-02T01:41:23.338Z", "ano_entrada": 2022, "nacionalidade": "Espanha", "posicao_principal": "ED/MCO"}, "feedback": [{"icone": "verde", "coluna": "jogos"}, {"icone": "verde", "coluna": "posicoes"}, {"icone": "verde", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "verde", "coluna": "idade"}, {"icone": "verde", "coluna": "nacionalidade"}, {"icone": "verde", "coluna": "contribuicoes"}, {"icone": "verde", "coluna": "periodo"}], "timestamp": "2025-06-19T07:13:34.287Z"}]	2025-06-19 08:13:34.288	2025-06-19 07:04:32.981543	2025-06-19 08:13:34.288474
1	1	2025-06-17	3	f	f	[{"nome": "Alhassane Keita", "palpite": {"id": 174, "nome": "Alhassane Keita", "sexo": "11 jogos", "idade": 33, "papel": "Jogador", "trofeus": ["4 contribuições"], "altura_cm": 183, "ano_saida": 2018, "created_at": "2025-06-13T01:13:24.368Z", "updated_at": "2025-06-13T01:13:24.368Z", "ano_entrada": 2017, "nacionalidade": "Guiné", "posicao_principal": "PL"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-baixo", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-baixo", "coluna": "idade"}, {"icone": "vermelho", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "verde", "coluna": "periodo"}], "timestamp": "2025-06-17T15:58:06.331Z"}, {"nome": "Ibrahima Guirassy", "palpite": {"id": 9, "nome": "Ibrahima Guirassy", "sexo": "34 jogos", "idade": 26, "papel": "Jogador", "trofeus": ["3 contribuições"], "altura_cm": 185, "ano_saida": 9999, "created_at": "2025-05-31T21:05:45.869Z", "updated_at": "2025-06-01T18:49:06.184Z", "ano_entrada": 2024, "nacionalidade": "França", "posicao_principal": "MDC/MC"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-baixo", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-cima", "coluna": "idade"}, {"icone": "vermelho", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "vermelho", "coluna": "periodo"}], "timestamp": "2025-06-17T16:04:12.287Z"}, {"nome": "Noah Madsen", "palpite": {"id": 7, "nome": "Noah Madsen", "sexo": "15 jogos", "idade": 23, "papel": "Jogador", "trofeus": ["2 contribuições"], "altura_cm": 190, "ano_saida": 9999, "created_at": "2025-05-31T21:05:45.869Z", "updated_at": "2025-06-01T18:49:06.183Z", "ano_entrada": 2023, "nacionalidade": "Dinamarca", "posicao_principal": "DC"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-baixo", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-cima", "coluna": "idade"}, {"icone": "vermelho", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "vermelho", "coluna": "periodo"}], "timestamp": "2025-06-17T16:06:02.657Z"}]	\N	2025-06-17 16:58:06.331851	2025-06-17 17:06:02.658575
3	10	2025-06-19	1	f	f	[{"nome": "Ali Alipour", "palpite": {"id": 110, "nome": "Ali Alipour", "sexo": "65 jogos", "idade": 29, "papel": "Jogador", "trofeus": ["14 contribuições"], "altura_cm": 181, "ano_saida": 2022, "created_at": "2025-06-11T00:40:42.799Z", "updated_at": "2025-06-11T00:40:42.799Z", "ano_entrada": 2020, "nacionalidade": "Irão", "posicao_principal": "PL"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-baixo", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-baixo", "coluna": "idade"}, {"icone": "vermelho", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "vermelho", "coluna": "periodo"}], "timestamp": "2025-06-19T06:31:31.469Z"}]	\N	2025-06-19 07:31:31.470185	2025-06-19 07:31:31.470185
4	4	2025-06-19	3	t	t	[{"nome": "Afonso Freitas", "palpite": {"id": 4, "nome": "Afonso Freitas", "sexo": "12 jogos", "idade": 25, "papel": "Jogador", "papeis": ["Jogador"], "trofeus": ["1 contribuição"], "posicoes": ["LB"], "altura_cm": 181, "ano_saida": 9999, "created_at": "2025-05-31T21:05:45.869Z", "updated_at": "2025-06-01T18:49:06.181Z", "ano_entrada": 2025, "nacionalidade": "Portugal", "posicao_principal": "LB"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-baixo", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-baixo", "coluna": "idade"}, {"icone": "vermelho", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "vermelho", "coluna": "periodo"}], "timestamp": "2025-06-19T06:39:00.184Z"}, {"nome": "Fábio Blanco", "palpite": {"id": 14, "nome": "Fábio Blanco", "sexo": "16 jogos", "idade": 21, "papel": "Jogador", "papeis": ["Jogador"], "trofeus": ["4 contribuições"], "posicoes": ["EE"], "altura_cm": 173, "ano_saida": 2025, "created_at": "2025-05-31T21:05:45.869Z", "updated_at": "2025-06-01T18:49:06.188Z", "ano_entrada": 2025, "nacionalidade": "Espanha", "posicao_principal": "EE"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-cima", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-cima", "coluna": "idade"}, {"icone": "verde", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "vermelho", "coluna": "periodo"}], "timestamp": "2025-06-19T06:39:13.221Z"}, {"nome": "Antonio Zarzana", "palpite": {"id": 93, "nome": "Antonio Zarzana", "sexo": "6 jogos", "idade": 23, "papel": "Jogador", "papeis": ["Jogador"], "trofeus": [], "posicoes": ["ED/MCO"], "altura_cm": 177, "ano_saida": 2023, "created_at": "2025-06-02T01:41:23.338Z", "updated_at": "2025-06-02T01:41:23.338Z", "ano_entrada": 2022, "nacionalidade": "Espanha", "posicao_principal": "ED/MCO"}, "feedback": [{"icone": "verde", "coluna": "jogos"}, {"icone": "verde", "coluna": "posicoes"}, {"icone": "verde", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "verde", "coluna": "idade"}, {"icone": "verde", "coluna": "nacionalidade"}, {"icone": "verde", "coluna": "contribuicoes"}, {"icone": "verde", "coluna": "periodo"}], "timestamp": "2025-06-19T06:39:19.865Z"}]	2025-06-19 07:39:19.866	2025-06-19 07:39:00.185009	2025-06-19 07:39:19.86677
5	9	2025-06-19	1	t	t	[{"nome": "Antonio Zarzana", "palpite": {"id": 93, "nome": "Antonio Zarzana", "sexo": "6 jogos", "idade": 23, "papel": "Jogador", "papeis": ["Jogador"], "trofeus": [], "posicoes": ["ED/MCO"], "altura_cm": 177, "ano_saida": 2023, "created_at": "2025-06-02T01:41:23.338Z", "updated_at": "2025-06-02T01:41:23.338Z", "ano_entrada": 2022, "nacionalidade": "Espanha", "posicao_principal": "ED/MCO"}, "feedback": [{"icone": "verde", "coluna": "jogos"}, {"icone": "verde", "coluna": "posicoes"}, {"icone": "verde", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "verde", "coluna": "idade"}, {"icone": "verde", "coluna": "nacionalidade"}, {"icone": "verde", "coluna": "contribuicoes"}, {"icone": "verde", "coluna": "periodo"}], "timestamp": "2025-06-19T07:15:56.203Z"}]	2025-06-19 08:15:56.203	2025-06-19 08:15:56.203756	2025-06-19 08:15:56.203756
6	1	2025-06-22	1	f	f	[{"nome": "Alhassane Keita", "palpite": {"id": 174, "nome": "Alhassane Keita", "sexo": "11 jogos", "idade": 33, "papel": "Jogador", "papeis": ["Jogador"], "trofeus": ["4 contribuições"], "posicoes": ["PL"], "altura_cm": 183, "ano_saida": 2018, "created_at": "2025-06-13T01:13:24.368Z", "updated_at": "2025-06-13T01:13:24.368Z", "ano_entrada": 2017, "nacionalidade": "Guiné", "posicao_principal": "PL"}, "feedback": [{"icone": "vermelho", "coluna": "jogos"}, {"icone": "vermelho", "coluna": "posicoes"}, {"icone": "seta-baixo", "coluna": "altura"}, {"icone": "verde", "coluna": "papeis"}, {"icone": "seta-baixo", "coluna": "idade"}, {"icone": "vermelho", "coluna": "nacionalidade"}, {"icone": "vermelho", "coluna": "contribuicoes"}, {"icone": "vermelho", "coluna": "periodo"}], "timestamp": "2025-06-22T11:44:32.651Z"}]	\N	2025-06-22 12:44:32.652584	2025-06-22 12:44:32.652584
\.


--
-- TOC entry 5124 (class 0 OID 16920)
-- Dependencies: 254
-- Data for Name: maritodle_daily_games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maritodle_daily_games (id, date, secret_player_id, secret_player_name, total_winners, created_at, updated_at) FROM stdin;
1	2025-06-17	158	Piqueti	0	2025-06-17 16:54:37.762338	2025-06-17 16:54:37.762338
2	2025-06-18	175	Baba	0	2025-06-17 23:00:55.765064	2025-06-17 23:00:55.765064
3	2025-06-19	93	Antonio Zarzana	3	2025-06-18 23:00:06.990258	2025-06-19 08:15:56.205074
4	2025-06-20	114	Andreas Karo	0	2025-06-19 23:00:50.071505	2025-06-19 23:00:50.071505
5	2025-06-22	119	Nanu	0	2025-06-22 12:44:05.610194	2025-06-22 12:44:05.610194
6	2025-06-23	167	Samuel Santos	0	2025-06-22 23:00:03.40605	2025-06-22 23:00:03.40605
\.


--
-- TOC entry 5095 (class 0 OID 16591)
-- Dependencies: 225
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
96	Jesús Ramírez	26 jogos	PL	187	Jogador	27	Venezuela	{"2 contribuições"}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
97	Percy Liza	15 jogos	PL	185	Jogador	25	Perú	{"2 contribuições"}	2022	2023	2025-06-02 02:41:23.338987	2025-06-02 02:41:23.338987
1	Samu Silva	20 jogos	GK	193	Jogador	26	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.173086
3	Junior Almeida	35 jogos	DC	189	Jogador	25	Brasil	{"3 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.180039
4	Afonso Freitas	12 jogos	LB	181	Jogador	25	Portugal	{"1 contribuição"}	2025	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.181098
5	Rodrigo Borges	37 jogos	DC	183	Jogador	26	Portugal	{"6 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.182003
7	Noah Madsen	15 jogos	DC	190	Jogador	23	Dinamarca	{"2 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.183446
22	Fábio China	169 jogos	LB	179	Jogador	32	Portugal	{"10 contribuições"}	2016	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.194533
23	Igor Julião	48 jogos	RB	175	Jogador	30	Brasil	{"7 contribuições"}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.195187
24	Tomás Domingos	59 jogos	RB	175	Jogador	26	Portugal	{"6 contribuições"}	2023	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.195802
25	Francisco França	28 jogos	MDC/MC/MCO	186	Jogador	23	Portugal	{"3 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.196341
26	Gonçalo Tabuaço	31 jogos	GK	188	Jogador	24	Portugal	{}	2024	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.196862
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
10	Carlos Daniel	31 jogos	MCO/MC	178	Jogador	30	Portugal	{"10 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.186023
11	Vladan Danilović	31 jogos	MDC/MC	183	Jogador	26	Bósnia-Herzegovina	{}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.187193
6	Romain Correia	29 jogos	DC	183	Jogador	23	França	{"2 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.182779
8	Pedro Silva	14 jogos	MC/MCO/EE	178	Jogador	28	Portugal	{}	2023	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.184032
9	Ibrahima Guirassy	34 jogos	MDC/MC	185	Jogador	26	França	{"3 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.184817
18	Martim Tavares	31 jogos	PL	183	Jogador	21	Portugal	{"8 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.191453
19	Nachon Nsingi	4 jogos	ED	176	Jogador	24	Bélgica	{}	2025	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.192098
20	Daniel Benchimol	17 jogos	EE/ED	162	Jogador	22	Portugal	{}	2025	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.19301
21	Enrique Peña Zauner	10 jogos	EE/ED	177	Jogador	25	Alemanha	{"3 contribuições"}	2025	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.19379
13	Rodrigo Andrade	9 jogos	MDC	180	Jogador	23	Portugal	{}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.188455
15	Preslav Borukov	23 jogos	PL	180	Jogador	25	Bulgária	{"3 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.189676
16	Alexandre Guedes	15 jogos	PL	188	Jogador	29	Portugal	{"4 contribuições"}	2025	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.190287
17	Patrick Fernandes	31 jogos	PL/ED	182	Jogador	27	Cabo Verde	{"6 contribuições"}	2024	9999	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.190803
12	Michel Costa	13 jogos	MC/MCO	165	Jogador	23	Brazil	{"2 contribuições"}	2025	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.18789
14	Fábio Blanco	16 jogos	EE	173	Jogador	21	Espanha	{"4 contribuições"}	2025	2025	2025-05-31 22:05:45.86938	2025-06-01 19:49:06.188983
98	Paulo Victor	30 jogos	GK	187	Jogador	38	Brasil	{}	2021	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
99	Jorge Sáenz	7 jogos	DC	188	Jogador	28	Espanha	{}	2021	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
100	Tim Waker	8 jogos	RB	190	Jogador	31	Suécia	{}	2021	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
101	Iván Rossi	28 jogos	MDC/MC	183	Jogador	31	Argentina	{}	2021	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
102	Filipe Cardoso	1 jogos	MDC	190	Jogador	31	Portugal	{}	2021	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
103	Pedro Pelágio	79 jogos	MC	181	Jogador	25	Portugal	{"2 contribuições"}	2019	2023	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
104	André Teles	8 jogos	MC/MDC	180	Jogador	28	Portugal	{}	2022	2023	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
105	Henrique	27 jogos	EE	178	Jogador	31	Brasil	{"3 contribuições"}	2021	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
106	Milson	32 jogos	EE	170	Jogador	25	Angola	{"3 contribuições"}	2021	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
107	Rúben Macedo	28 jogos	EE/ED	171	Jogador	29	Portugal	{"2 contribuições"}	2020	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
108	Rafik Guitane	60 jogos	MCO/ED	170	Jogador	26	França	{"8 contribuições"}	2020	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
109	Clésio Baúque	20 jogos	EE/ED	174	Jogador	30	Moçambique	{"2 contribuições"}	2021	2023	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
110	Ali Alipour	65 jogos	PL	181	Jogador	29	Irão	{"14 contribuições"}	2020	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
111	Ricardinho	12 jogos	PL	181	Jogador	24	Brasil	{"1 contribuição"}	2021	2022	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
112	Charles	93 jogos	GK	186	Jogador	31	Brasil	{}	2016	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
113	Caio Secco	5 jogos	GK	195	Jogador	34	Brasil	{}	2020	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
114	Andreas Karo	9 jogos	DC	190	Jogador	28	Chipre	{}	2021	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
115	Lucas Áfrico	43 jogos	DC	188	Jogador	30	Brasil	{"3 contribuições"}	2018	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
116	Dejan Kerkez	22 jogos	DC	190	Jogador	29	Sérvia	{}	2019	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
117	Aloísio Neto	5 jogos	DC	188	Jogador	27	Brasil	{"1 contribuição"}	2017	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
118	Marcelo Hermes	30 jogos	LE	177	Jogador	30	Brasil	{"2 contribuições"}	2020	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
119	Nanu	56 jogos	RB/MD	177	Jogador	31	Guinea-Bissau	{"11 contribuições"}	2019	2020	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
120	Franck Bambock	59 jogos	MDC/MC	181	Jogador	30	França	{"5 contribuições"}	2019	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
121	Jean Irmer	30 jogos	MDC/MC	183	Jogador	30	Brasil	{}	2020	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
122	Jean Cléber	89 jogos	MDC/MC/MCO	180	Jogador	35	Brasil	{"11 contribuições"}	2016	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
123	Jorge Correa	114 jogos	EE/MCO	170	Jogador	32	Argentina	{"16 contribuições"}	2018	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
124	Marcelinho	19 jogos	EE/ED	176	Jogador	28	Argentina	{"2 contribuições"}	2019	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
125	Fumu Tamuzo	13 jogos	MD/ED	180	Jogador	30	França	{}	2020	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
126	Rodrigo Pinho	118 jogos	PL/ED	185	Jogador	34	Brasil	{"43 contribuições"}	2017	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
127	Sassá	7 jogos	PL	174	Jogador	31	Brasil	{}	2021	2021	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
128	Getterson Alves	48 jogos	PL	180	Jogador	34	Brasil	{"8 contribuições"}	2019	2020	2025-06-11 01:40:42.799351	2025-06-11 01:40:42.799351
129	Douglas Grolli	22 jogos	DC	189	Jogador	35	Brasil	{}	2019	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
130	Rúben Ferreira	180 jogos	DE	183	Jogador	35	Portugal	{"30 contribuições"}	2011	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
131	Bebeto	85 jogos	DD	174	Jogador	35	Brasil	{"7 contribuições"}	2017	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
132	Josip Vukovic	54 jogos	MDC/MC	184	Jogador	33	Croácia	{"3 contribuições"}	2018	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
133	Jhon Cley	13 jogos	MCO	183	Jogador	31	Brasil	{"3 contribuições"}	2019	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
134	Daizen Maeda	24 jogos	EE/PL	173	Jogador	27	Japão	{"4 contribuições"}	2019	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
135	Leandro Barrera	35 jogos	EE	179	Jogador	34	Argentina	{"13 contribuições"}	2018	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
136	Eri	20 jogos	EE/ED	178	Jogador	31	Portugal	{"1 contribuição"}	2019	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
137	Luciano Nequecaur	11 jogos	PL	195	Jogador	32	Argentina	{}	2019	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
138	Marcão	9 jogos	DC	193	Jogador	29	Brasil	{}	2018	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
139	Coronas	10 jogos	DD	178	Jogador	34	Portugal	{}	2016	2019	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
140	João Gamboa	53 jogos	MDC	187	Jogador	28	Portugal	{"3 contribuições"}	2017	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
141	Fabrício Baiano	39 jogos	MDC/MC	179	Jogador	32	Brasil	{}	2017	2020	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
142	Danny	81 jogos	MCO	178	Jogador	41	Portugal	{"9 contribuições"}	2001	2004	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
143	Gildo	5 jogos	EE/ED	171	Jogador	30	Moçambique	{}	2017	2019	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
144	Ricardo Valente	59 jogos	PL	181	Jogador	34	Portugal	{"16 contribuições"}	2017	2019	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
145	Ibson Melo	26 jogos	PL	179	Jogador	35	Brasil	{"4 contribuições"}	2017	2019	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
146	Everton	31 jogos	PL	186	Jogador	31	Brasil	{"5 contribuições"}	2017	2019	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
147	Nikolaos Ioannidis	3 jogos	PL	188	Jogador	31	Grécia	{}	2018	2019	2025-06-12 01:46:24.65001	2025-06-12 01:46:24.65001
148	Pablo Santos	25 jogos	DC	188	Jogador	26	Brasil	{"1 contribuição"}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
149	Maurício Antônio	47 jogos	DC	183	Jogador	33	Brasil	{"4 contribuições"}	2016	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
150	Dráusio	18 jogos	DC	188	Jogador	33	Brasil	{"1 contribuição"}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
151	Diney Borges	25 jogos	DC/MDC	185	Jogador	30	Cabo Verde	{}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
152	Luís Martins	31 jogos	DE	177	Jogador	33	Portugal	{"1 contribuição"}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
153	Cristiano Gomes	5 jogos	DD	183	Jogador	30	Portugal	{}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
154	Erdem Sen	53 jogos	MDC	180	Jogador	36	Bélgica	{"3 contribuições"}	2016	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
155	Éber Bessa	103 jogos	MCO	166	Jogador	33	Brasil	{"9 contribuições"}	2015	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
156	Filipe Oliveira	15 jogos	MC/MCO	187	Jogador	31	Portugal	{"1 contribuição"}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
157	Gevorg Ghazaryan	67 jogos	EE	180	Jogador	37	Arménia	{"14 contribuições"}	2015	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
158	Piqueti	7 jogos	EE/ED	173	Jogador	32	Guiné Bissau	{}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
159	Viktor Lundberg	7 jogos	PL	187	Jogador	34	Suécia	{}	2015	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
160	Gottardi	20 jogos	GK	193	Jogador	39	Brasil	{}	2016	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
161	Alireza Haghighi	5 jogos	GK	193	Jogador	37	Irão	{}	2016	2016	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
162	Welligton	13 jogos	GK	193	Jogador	35	Brasil	{}	2012	2016	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
163	Raúl Silva	67 jogos	DC	187	Jogador	35	Brasil	{"12 contribuições"}	2015	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
164	Dirceu	34 jogos	DC	192	Jogador	37	Brasil	{"4 contribuições"}	2015	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
165	Deyvison	40 jogos	DC	186	Jogador	36	Brasil	{"1 contribuição"}	2015	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
166	Patrick	71 jogos	DD	174	Jogador	34	Brasil	{"9 contribuições"}	2015	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
167	Samuel Santos	7 jogos	DD	177	Jogador	35	Brasil	{}	2016	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
168	Fransérgio	129 jogos	MDC/MC	186	Jogador	34	Brasil	{"32 contribuições"}	2014	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
169	Alex Soares	110 jogos	MDC/MC/MCO	179	Jogador	34	Portugal	{"17 contribuições"}	2013	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
170	Xavier	82 jogos	EE/MCO	176	Jogador	32	Portugal	{"15 contribuições"}	2014	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
171	Brito	24 jogos	EE/ED	178	Jogador	37	Cabo Verde	{"3 contribuições"}	2016	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
172	Gevaro Nepomuceno	15 jogos	EE	175	Jogador	32	Curaçau	{"1 contribuição"}	2016	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
173	Dyego Sousa	79 jogos	PL	189	Jogador	35	Portugal	{"33 contribuições"}	2014	2017	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
174	Alhassane Keita	11 jogos	PL	183	Jogador	33	Guiné	{"4 contribuições"}	2017	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
175	Baba	153 jogos	PL	182	Jogador	37	Senegal	{"58 contribuições"}	2015	2016	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
176	Donald Djoussé	30 jogos	PL	183	Jogador	35	Camarões	{"5 contribuições"}	2016	2018	2025-06-13 02:13:24.368435	2025-06-13 02:13:24.368435
\.


--
-- TOC entry 5120 (class 0 OID 16848)
-- Dependencies: 250
-- Data for Name: match_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match_players (id, name, "position", image_url, api_player_id, api_player_name, created_at, updated_at) FROM stdin;
1	Gonçalo Tabuaço	Guarda-redes	\N	323798	Gonçalo Tabuaço	2025-06-15 19:24:42.842541	2025-06-15 19:24:42.842541
2	Michel	Médio	\N	197321	Michel	2025-06-15 19:24:42.848648	2025-06-15 19:24:42.848648
3	Tomás Domingos	Defesa	\N	277196	Tomás Domingos	2025-06-15 19:51:26.838478	2025-06-15 19:51:26.838478
4	N. Madsen	Defesa	\N	279450	N. Madsen	2025-06-15 19:51:26.841198	2025-06-15 19:51:26.841198
5	V. Danilović	Médio	\N	76933	V. Danilović	2025-06-15 19:51:26.845913	2025-06-15 19:51:26.845913
6	E. Peña Zauner	Jogador	\N	113585	E. Peña Zauner	2025-06-15 19:51:26.850075	2025-06-15 19:51:26.850075
7	Daniel Silva	Jogador	\N	367849	Daniel Silva	2025-06-15 19:51:26.85453	2025-06-15 19:51:26.85453
8	Francisco França	Médio	\N	323947	Francisco França	2025-06-15 19:51:26.856567	2025-06-15 19:51:26.856567
\.


--
-- TOC entry 5112 (class 0 OID 16769)
-- Dependencies: 242
-- Data for Name: match_voting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match_voting (id, home_team, away_team, match_date, is_active, match_id, created_at) FROM stdin;
1	CS Marítimo	FC Tondela	2024-01-20	f	\N	2025-06-14 19:48:52.60362
2	CS Marítimo	FC Porto	2025-06-14	f	999999	2025-06-14 19:53:29.236996
9	CS Marítimo	FC Tondela	2024-01-20	f	\N	2025-06-14 20:00:00.346384
12	CS Marítimo	FC Tondela	2024-01-20	f	\N	2025-06-14 21:52:14.552582
13	CS Marítimo	FC Tondela	2024-01-20	f	\N	2025-06-15 01:13:17.193423
421	Maritimo	Vizela	2025-05-16	t	1231722	2025-06-16 22:02:21.258868
385	CS Marítimo	FC Arouca	2024-01-14	f	999001	2025-06-15 01:39:01.724363
\.


--
-- TOC entry 5114 (class 0 OID 16778)
-- Dependencies: 244
-- Data for Name: match_voting_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match_voting_players (id, match_voting_id, player_id, player_type, match_player_id) FROM stdin;
1	1	14	regular	\N
2	1	3	regular	\N
3	1	12	regular	\N
4	1	7	regular	\N
5	1	10	regular	\N
6	1	1	regular	\N
7	1	8	regular	\N
8	1	4	regular	\N
9	1	9	regular	\N
10	1	6	regular	\N
11	1	13	regular	\N
12	1	5	regular	\N
13	1	15	regular	\N
14	1	11	regular	\N
15	1	2	regular	\N
16	2	10	regular	\N
17	2	12	regular	\N
18	2	17	regular	\N
43	9	14	regular	\N
44	9	3	regular	\N
45	9	12	regular	\N
46	9	7	regular	\N
47	9	10	regular	\N
48	9	1	regular	\N
49	9	8	regular	\N
50	9	4	regular	\N
51	9	9	regular	\N
52	9	6	regular	\N
53	9	13	regular	\N
54	9	5	regular	\N
55	9	15	regular	\N
56	9	11	regular	\N
57	9	2	regular	\N
66	12	14	regular	\N
67	12	3	regular	\N
68	12	12	regular	\N
69	12	7	regular	\N
70	12	10	regular	\N
71	12	1	regular	\N
72	12	8	regular	\N
73	12	4	regular	\N
74	12	9	regular	\N
75	12	6	regular	\N
76	12	13	regular	\N
77	12	5	regular	\N
78	12	15	regular	\N
79	12	11	regular	\N
80	12	2	regular	\N
81	13	14	regular	\N
82	13	3	regular	\N
83	13	12	regular	\N
84	13	7	regular	\N
85	13	10	regular	\N
86	13	1	regular	\N
87	13	8	regular	\N
88	13	4	regular	\N
89	13	9	regular	\N
90	13	6	regular	\N
91	13	13	regular	\N
92	13	5	regular	\N
93	13	15	regular	\N
94	13	11	regular	\N
95	13	2	regular	\N
1580	385	10	regular	\N
1581	385	12	regular	\N
1582	385	17	regular	\N
1583	385	6	regular	\N
2123	421	\N	match	1
2124	421	\N	match	3
2125	421	11	regular	\N
2126	421	9	regular	\N
2127	421	6	regular	\N
2128	421	13	regular	\N
2129	421	15	regular	\N
2130	421	22	regular	\N
2131	421	\N	match	2
2132	421	25	regular	\N
2133	421	21	regular	\N
2134	421	23	regular	\N
2135	421	14	regular	\N
2136	421	26	regular	\N
2137	421	\N	match	8
2138	421	12	regular	\N
\.


--
-- TOC entry 5116 (class 0 OID 16797)
-- Dependencies: 246
-- Data for Name: player_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player_ratings (id, player_id, user_id, match_id, rating, created_at, player_type, match_player_id) FROM stdin;
322	1	5	421	7	2025-06-16 22:06:27.358612	regular	\N
323	3	5	421	5	2025-06-16 22:06:27.358612	regular	\N
324	11	5	421	7	2025-06-16 22:06:27.358612	regular	\N
325	9	5	421	5	2025-06-16 22:06:27.358612	regular	\N
326	6	5	421	7	2025-06-16 22:06:27.358612	regular	\N
327	13	5	421	5	2025-06-16 22:06:27.358612	regular	\N
328	15	5	421	7	2025-06-16 22:06:27.358612	regular	\N
329	22	5	421	5	2025-06-16 22:06:27.358612	regular	\N
330	2	5	421	7	2025-06-16 22:06:27.358612	regular	\N
331	25	5	421	5	2025-06-16 22:06:27.358612	regular	\N
332	21	5	421	7	2025-06-16 22:06:27.358612	regular	\N
333	23	5	421	5	2025-06-16 22:06:27.358612	regular	\N
334	14	5	421	7	2025-06-16 22:06:27.358612	regular	\N
335	26	5	421	5	2025-06-16 22:06:27.358612	regular	\N
336	8	5	421	7	2025-06-16 22:06:27.358612	regular	\N
337	12	5	421	5	2025-06-16 22:06:27.358612	regular	\N
338	1	12	421	7	2025-06-16 22:08:42.808726	regular	\N
339	3	12	421	5	2025-06-16 22:08:42.808726	regular	\N
340	11	12	421	7	2025-06-16 22:08:42.808726	regular	\N
341	9	12	421	5	2025-06-16 22:08:42.808726	regular	\N
342	6	12	421	7	2025-06-16 22:08:42.808726	regular	\N
343	13	12	421	5	2025-06-16 22:08:42.808726	regular	\N
344	15	12	421	7	2025-06-16 22:08:42.808726	regular	\N
345	22	12	421	5	2025-06-16 22:08:42.808726	regular	\N
346	2	12	421	7	2025-06-16 22:08:42.808726	regular	\N
347	25	12	421	5	2025-06-16 22:08:42.808726	regular	\N
348	21	12	421	7	2025-06-16 22:08:42.808726	regular	\N
349	23	12	421	5	2025-06-16 22:08:42.808726	regular	\N
350	14	12	421	7	2025-06-16 22:08:42.808726	regular	\N
351	26	12	421	5	2025-06-16 22:08:42.808726	regular	\N
352	8	12	421	7	2025-06-16 22:08:42.808726	regular	\N
353	12	12	421	5	2025-06-16 22:08:42.808726	regular	\N
354	1	6	421	7	2025-06-16 22:42:27.227038	regular	\N
355	3	6	421	5	2025-06-16 22:42:27.227038	regular	\N
356	11	6	421	5	2025-06-16 22:42:27.227038	regular	\N
357	9	6	421	5	2025-06-16 22:42:27.227038	regular	\N
358	6	6	421	5	2025-06-16 22:42:27.227038	regular	\N
359	13	6	421	5	2025-06-16 22:42:27.227038	regular	\N
360	15	6	421	5	2025-06-16 22:42:27.227038	regular	\N
361	22	6	421	6	2025-06-16 22:42:27.227038	regular	\N
362	2	6	421	6	2025-06-16 22:42:27.227038	regular	\N
363	25	6	421	5	2025-06-16 22:42:27.227038	regular	\N
364	21	6	421	5	2025-06-16 22:42:27.227038	regular	\N
365	23	6	421	5	2025-06-16 22:42:27.227038	regular	\N
366	14	6	421	5	2025-06-16 22:42:27.227038	regular	\N
367	26	6	421	5	2025-06-16 22:42:27.227038	regular	\N
368	8	6	421	5	2025-06-16 22:42:27.227038	regular	\N
369	12	6	421	5	2025-06-16 22:42:27.227038	regular	\N
370	1	10	421	5	2025-06-16 22:01:11.254375	regular	\N
371	3	10	421	7	2025-06-16 22:01:11.254375	regular	\N
372	11	10	421	5	2025-06-16 22:01:11.254375	regular	\N
373	9	10	421	7	2025-06-16 22:01:11.254375	regular	\N
374	6	10	421	5	2025-06-16 22:01:11.254375	regular	\N
375	13	10	421	7	2025-06-16 22:01:11.254375	regular	\N
376	15	10	421	5	2025-06-16 22:01:11.254375	regular	\N
377	22	10	421	7	2025-06-16 22:01:11.254375	regular	\N
378	2	10	421	5	2025-06-16 22:01:11.254375	regular	\N
379	25	10	421	7	2025-06-16 22:01:11.254375	regular	\N
380	21	10	421	5	2025-06-16 22:01:11.254375	regular	\N
381	23	10	421	7	2025-06-16 22:01:11.254375	regular	\N
382	14	10	421	5	2025-06-16 22:01:11.254375	regular	\N
383	26	10	421	7	2025-06-16 22:01:11.254375	regular	\N
384	8	10	421	5	2025-06-16 22:01:11.254375	regular	\N
385	12	10	421	7	2025-06-16 22:01:11.254375	regular	\N
386	1	9	421	7	2025-06-16 21:53:27.392023	regular	\N
387	3	9	421	7	2025-06-16 21:53:27.392023	regular	\N
388	11	9	421	7	2025-06-16 21:53:27.392023	regular	\N
389	9	9	421	7	2025-06-16 21:53:27.392023	regular	\N
390	6	9	421	7	2025-06-16 21:53:27.392023	regular	\N
391	13	9	421	7	2025-06-16 21:53:27.392023	regular	\N
392	15	9	421	7	2025-06-16 21:53:27.392023	regular	\N
393	22	9	421	7	2025-06-16 21:53:27.392023	regular	\N
394	2	9	421	7	2025-06-16 21:53:27.392023	regular	\N
395	25	9	421	7	2025-06-16 21:53:27.392023	regular	\N
396	21	9	421	7	2025-06-16 21:53:27.392023	regular	\N
397	23	9	421	7	2025-06-16 21:53:27.392023	regular	\N
398	14	9	421	7	2025-06-16 21:53:27.392023	regular	\N
399	26	9	421	7	2025-06-16 21:53:27.392023	regular	\N
400	8	9	421	7	2025-06-16 21:53:27.392023	regular	\N
401	12	9	421	7	2025-06-16 21:53:27.392023	regular	\N
402	1	1	421	5	2025-06-16 21:47:46.206257	regular	\N
403	3	1	421	7	2025-06-16 21:47:46.206257	regular	\N
404	11	1	421	7	2025-06-16 21:47:46.206257	regular	\N
405	9	1	421	5	2025-06-16 21:47:46.206257	regular	\N
406	6	1	421	7	2025-06-16 21:47:46.206257	regular	\N
407	13	1	421	5	2025-06-16 21:47:46.206257	regular	\N
408	15	1	421	7	2025-06-16 21:47:46.206257	regular	\N
409	22	1	421	7	2025-06-16 21:47:46.206257	regular	\N
410	2	1	421	5	2025-06-16 21:47:46.206257	regular	\N
411	25	1	421	7	2025-06-16 21:47:46.206257	regular	\N
412	21	1	421	5	2025-06-16 21:47:46.206257	regular	\N
413	23	1	421	7	2025-06-16 21:47:46.206257	regular	\N
414	14	1	421	5	2025-06-16 21:47:46.206257	regular	\N
415	26	1	421	7	2025-06-16 21:47:46.206257	regular	\N
416	8	1	421	5	2025-06-16 21:47:46.206257	regular	\N
417	12	1	421	7	2025-06-16 21:47:46.206257	regular	\N
466	1	4	421	7	2025-06-16 15:24:49.190546	regular	\N
467	3	4	421	5	2025-06-16 15:24:49.190546	regular	\N
468	11	4	421	6	2025-06-16 15:24:49.190546	regular	\N
469	9	4	421	6	2025-06-16 15:24:49.190546	regular	\N
470	6	4	421	6	2025-06-16 15:24:49.190546	regular	\N
471	13	4	421	6	2025-06-16 15:24:49.190546	regular	\N
472	15	4	421	6	2025-06-16 15:24:49.190546	regular	\N
473	22	4	421	6	2025-06-16 15:24:49.190546	regular	\N
474	2	4	421	6	2025-06-16 15:24:49.190546	regular	\N
475	25	4	421	6	2025-06-16 15:24:49.190546	regular	\N
476	21	4	421	6	2025-06-16 15:24:49.190546	regular	\N
477	23	4	421	6	2025-06-16 15:24:49.190546	regular	\N
478	14	4	421	6	2025-06-16 15:24:49.190546	regular	\N
479	26	4	421	6	2025-06-16 15:24:49.190546	regular	\N
480	8	4	421	6	2025-06-16 15:24:49.190546	regular	\N
481	12	4	421	6	2025-06-16 15:24:49.190546	regular	\N
498	1	14	421	7	2025-06-16 01:23:46.241373	regular	\N
499	3	14	421	5	2025-06-16 01:23:46.241373	regular	\N
500	11	14	421	7	2025-06-16 01:23:46.241373	regular	\N
501	9	14	421	5	2025-06-16 01:23:46.241373	regular	\N
502	6	14	421	7	2025-06-16 01:23:46.241373	regular	\N
503	13	14	421	5	2025-06-16 01:23:46.241373	regular	\N
504	15	14	421	7	2025-06-16 01:23:46.241373	regular	\N
505	22	14	421	5	2025-06-16 01:23:46.241373	regular	\N
506	2	14	421	7	2025-06-16 01:23:46.241373	regular	\N
507	25	14	421	5	2025-06-16 01:23:46.241373	regular	\N
508	21	14	421	7	2025-06-16 01:23:46.241373	regular	\N
509	23	14	421	5	2025-06-16 01:23:46.241373	regular	\N
510	14	14	421	7	2025-06-16 01:23:46.241373	regular	\N
511	26	14	421	5	2025-06-16 01:23:46.241373	regular	\N
512	8	14	421	7	2025-06-16 01:23:46.241373	regular	\N
513	12	14	421	5	2025-06-16 01:23:46.241373	regular	\N
\.


--
-- TOC entry 5097 (class 0 OID 16600)
-- Dependencies: 227
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
17	Rodrigo Andrade	Médio	/images/rodrigo-andrade.png	2025-05-19 22:27:57.227969+01
20	Preslav Borukov	Avançado	/images/preslav-borukov.png	2025-05-19 22:27:57.227969+01
21	Alexandre Guedes	Avançado	/images/alexandre-guedes.png	2025-05-19 22:27:57.227969+01
22	Patrick Fernandes	Avançado	/images/patrick-fernandes.png	2025-05-19 22:27:57.227969+01
23	Martim Tavares	Avançado	/images/martim-tavares.png	2025-05-19 22:27:57.227969+01
26	Daniel Benchimol	Avançado	/images/daniel-benchimol.png	2025-05-19 22:27:57.227969+01
25	Peña Zauner	Avançado	/images/pena-zauner.png	2025-05-19 22:27:57.227969+01
10	Fábio China	Defesa	/images/fabio-china.png	2025-05-19 22:27:57.227969+01
4	Igor Julião	Defesa	/images/igor-juliao.png	2025-05-19 22:27:57.227969+01
2	Gonçalo Tabuaço	Guarda-redes	/images/goncalo-tabuaco-new.png	2025-05-19 22:27:57.227969+01
18	Francisco França	Médio	/images/francisco-franca-new.png	2025-05-19 22:27:57.227969+01
7	Tomás Domingos	Defesa	/images/tomas-domingos-new.png	2025-05-19 22:27:57.227969+01
\.


--
-- TOC entry 5099 (class 0 OID 16607)
-- Dependencies: 229
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
-- TOC entry 5122 (class 0 OID 16883)
-- Dependencies: 252
-- Data for Name: transfer_rumors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transfer_rumors (id, unique_id, player_name, type, club, value, status, date, source, reliability, description, is_main_team, category, "position", is_approved, is_deleted, created_by, created_at, updated_at, deleted_at) FROM stdin;
3	real_brs5w0_1	Patrick Fernandes	venda	Destino a confirmar	Valor não revelado	rumor	2024-01-15	Google News	1	Internacional cabo-verdiano Patrick Fernandes deixa Marítimo para assinar pelos romenos do Otelul Galati - Expresso das Ilhas	t	senior	\N	f	t	\N	2025-06-17 00:32:43.840014+01	2025-06-17 00:38:58.398393+01	2025-06-17 00:38:58.398393+01
4	real_4nx3bv_11	Vítor Matos	compra	CS Marítimo	Valor não revelado	confirmado	2023-12-14	Google News	2	Oficial: Vítor Matos, antigo adjunto de Klopp, é o novo treinador do Marítimo - Flashscore.pt	t	senior	\N	f	t	\N	2025-06-17 00:32:43.841701+01	2025-06-17 00:38:58.403175+01	2025-06-17 00:38:58.403175+01
1	vitor_matos_2024	Vítor Matos	compra	CS Marítimo	Valor não revelado	confirmado	2025-06-13	Google News	5	Oficial: Vítor Matos é o novo treinador do Marítimo - Record	t	coach	\N	t	f	\N	2025-06-17 00:13:39.499113+01	2025-06-17 00:43:35.071498+01	\N
2	patrick_fernandes_2024	Patrick Fernandes	venda	Otelul Galati	Valor não revelado	confirmado	2025-06-15	Google News	5	Internacional cabo-verdiano Patrick Fernandes deixa Marítimo para assinar pelos romenos do Otelul Galati - Expresso das Ilhas	t	senior	\N	t	f	\N	2025-06-17 00:13:39.502213+01	2025-06-17 00:43:35.077315+01	\N
6	real_czazk3_11	Vítor Matos	compra	CS Marítimo	Valor não revelado	confirmado	2025-06-13	Google News	2	Oficial: Vítor Matos é o novo treinador do Marítimo - Record	t	senior	\N	f	t	\N	2025-06-17 00:39:45.539359+01	2025-06-17 15:13:51.006494+01	2025-06-17 15:13:51.006494+01
8	real_oxtqyn_17	Lu	compra	CS Marítimo	Valor não revelado	rumor	2025-05-23	Google News	1	Luís Gabriel é o novo treinador da equipa feminina - CS Marítimo	t	senior	\N	f	t	\N	2025-06-17 00:43:57.145625+01	2025-06-17 15:13:53.705109+01	2025-06-17 15:13:53.705109+01
9	real_v0m8xx_0	Wilson	compra	CS Marítimo	Valor não revelado	rumor	2025-06-17	Google News	1	Wilson Nóbrega é o novo treinador da equipa Sub-17 masculina do CS Marítimo - RTP Madeira	t	senior	\N	f	t	\N	2025-06-17 15:13:06.232159+01	2025-06-17 15:13:56.791957+01	2025-06-17 15:13:56.791957+01
10	real_brs5w0_2	Patrick Fernandes	venda	Destino a confirmar	Valor não revelado	rumor	2025-06-16	Google News	1	Internacional cabo-verdiano Patrick Fernandes deixa Marítimo para assinar pelos romenos do Otelul Galati - Expresso das Ilhas	t	senior	\N	f	t	\N	2025-06-17 15:13:06.234595+01	2025-06-17 15:13:59.430982+01	2025-06-17 15:13:59.430982+01
\.


--
-- TOC entry 5101 (class 0 OID 16612)
-- Dependencies: 231
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, google_id, is_admin) FROM stdin;
2	Jope1	asdasd@gmail.com	$2b$10$r5iqHmvm7D9BWcWwBwNGYexMzvTa4m/NPzgcVtnEYov1PmVi2j1IG	2025-05-20 20:54:52.622871+01	\N	f
3	salvador	sadsad@gmail.com	$2b$10$8T99dZuwvFTQ7e9X/T8L1.BnPepERg8.Lh8TQxgoa3WkRdLMjdscS	2025-05-20 22:48:41.300552+01	\N	f
4	Jope THE BEAST	jopethebeast@gmail.com	$2b$10$l/nHhf.wRNdbvO3eXo33q.p9t/dRZV.0aj.CaIedG2eROv5oEpocy	2025-05-22 14:24:43.204154+01	114941445721236454444	f
5	jopegomes_15	asd@gmail.com	$2b$10$Eeyn8AxFDELvSZMmJBLrrekp.droPfYiyoeMdQrwPfNjmuESCz2r6	2025-05-24 01:45:43.635314+01	\N	f
6	qwe	qwe@gmail.com	$2b$10$tDDGuH4JdPKAuzz0NlUg9.7axm1VZrtldeyWcT/M/eEPYKvJCDON6	2025-05-24 20:22:03.836358+01	\N	f
8	emanuel	rty@gmail.com	$2b$10$MQhUxNJKnNfqrqnpGq7HzuZNDmWiEwZ7qN/ynqx7oLs9FiZ98HQFm	2025-05-25 13:09:38.780178+01	\N	f
9	IconicPrints	iconicprintsoficial@gmail.com	$2b$10$qLOYaN6wzR710g7HBBpLDuUv8HJoCefg4TsUnfSU7KuMT/.sY4ZYm	2025-05-25 15:14:33.643935+01	108809104178473985146	f
10	MostLikedWebProject	mostlikedwebproject@gmail.com	$2b$10$hz3/X/X26bK6qVn7VFsides/JFX322.1goZh.w5s3eP5p06yyUDTO	2025-05-25 21:34:38.871089+01	111659102641992005039	f
1	Jope	jope.sousagomes8@gmail.com	$2b$10$327tnVdw9fx.v2jgOqrlVOgcj.fOUATFIiDVdi6iDTKYcCraggwDC	2025-05-19 23:30:09.016555+01	105806198648964062923	t
12	zxc	zxc@gmail.com	$2b$10$X.33U0bJvYzaeShiDnKHPeC/JKtH9/CV1hLSBllAkxkkH5dbclh92	2025-06-16 01:04:28.501629+01	\N	f
13	bnm	bnm@gmail.com	$2b$10$.Cbfllby0If9tuI4PCD3Wu6L4LsfRLyKLZyKOYqAqVqLSDFvpxK9u	2025-06-16 01:09:50.282063+01	\N	f
14	jkl	jkl@gmail.com	$2b$10$CxO6VDDfMjEROijk507bYO6u/aMf4WGcDIqWJVT2Zo5MvTCit9yiu	2025-06-16 01:16:12.260182+01	\N	f
\.


--
-- TOC entry 5103 (class 0 OID 16620)
-- Dependencies: 233
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
24	3	17	2025-05-20 22:50:38.912283+01
26	4	10	2025-05-22 14:25:01.850352+01
27	4	14	2025-05-23 00:27:43.814943+01
29	1	17	2025-05-24 01:40:08.278326+01
30	1	8	2025-05-24 01:40:08.278642+01
32	1	7	2025-05-24 01:40:12.961632+01
33	1	3	2025-05-24 11:40:16.301502+01
34	1	1	2025-05-24 11:40:16.303032+01
35	6	15	2025-05-24 20:27:17.559809+01
36	6	25	2025-05-24 20:27:17.569453+01
37	6	18	2025-05-24 20:27:17.569631+01
39	6	26	2025-05-24 20:27:17.569887+01
40	6	23	2025-05-24 20:27:17.570287+01
41	6	13	2025-05-24 20:27:17.643862+01
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
55	8	14	2025-05-25 13:11:21.343537+01
56	8	17	2025-05-25 13:11:21.344121+01
57	8	18	2025-05-25 13:11:21.344202+01
58	8	22	2025-05-25 13:11:21.34463+01
60	8	21	2025-05-25 13:11:21.344946+01
61	8	20	2025-05-25 13:11:21.360893+01
62	8	26	2025-05-25 13:11:21.360975+01
63	8	25	2025-05-25 13:11:21.36107+01
64	8	23	2025-05-25 13:11:21.361187+01
65	4	7	2025-05-25 21:46:07.96884+01
67	5	1	2025-05-26 12:35:46.660643+01
68	5	3	2025-05-26 12:35:46.662489+01
70	5	21	2025-05-26 12:35:46.665198+01
71	5	14	2025-05-26 12:35:46.667408+01
73	1	13	2025-05-27 22:01:09.163209+01
72	1	15	2025-05-27 22:01:09.163126+01
74	1	18	2025-05-27 22:01:09.195201+01
75	1	2	2025-06-14 10:33:03.427913+01
76	1	11	2025-06-14 10:33:03.439547+01
77	1	25	2025-06-14 10:33:03.442333+01
\.


--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 218
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 29, true);


--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 220
-- Name: custom_poll_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_poll_votes_id_seq', 3, true);


--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 222
-- Name: custom_polls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_polls_id_seq', 2, true);


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 224
-- Name: discussions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discussions_id_seq', 7, true);


--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 237
-- Name: football_lineups_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.football_lineups_cache_id_seq', 830, true);


--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 235
-- Name: football_matches_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.football_matches_cache_id_seq', 40, true);


--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 239
-- Name: football_sync_control_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.football_sync_control_id_seq', 1, true);


--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 247
-- Name: man_of_match_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.man_of_match_votes_id_seq', 32, true);


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 255
-- Name: maritodle_daily_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maritodle_daily_attempts_id_seq', 6, true);


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 253
-- Name: maritodle_daily_games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maritodle_daily_games_id_seq', 6, true);


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 226
-- Name: maritodle_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maritodle_players_id_seq', 176, true);


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 249
-- Name: match_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.match_players_id_seq', 8, true);


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 241
-- Name: match_voting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.match_voting_id_seq', 421, true);


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 243
-- Name: match_voting_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.match_voting_players_id_seq', 2138, true);


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 245
-- Name: player_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.player_ratings_id_seq', 545, true);


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 228
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 30, true);


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 230
-- Name: poll_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.poll_votes_id_seq', 23, true);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 251
-- Name: transfer_rumors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transfer_rumors_id_seq', 10, true);


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 232
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 234
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votes_id_seq', 77, true);


--
-- TOC entry 4821 (class 2606 OID 16635)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 16637)
-- Name: custom_poll_votes custom_poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes
    ADD CONSTRAINT custom_poll_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 16639)
-- Name: custom_polls custom_polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls
    ADD CONSTRAINT custom_polls_pkey PRIMARY KEY (id);


--
-- TOC entry 4834 (class 2606 OID 16641)
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 16742)
-- Name: football_lineups_cache football_lineups_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_lineups_cache
    ADD CONSTRAINT football_lineups_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 4865 (class 2606 OID 16733)
-- Name: football_matches_cache football_matches_cache_fixture_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_matches_cache
    ADD CONSTRAINT football_matches_cache_fixture_id_key UNIQUE (fixture_id);


--
-- TOC entry 4867 (class 2606 OID 16731)
-- Name: football_matches_cache football_matches_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_matches_cache
    ADD CONSTRAINT football_matches_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 16759)
-- Name: football_sync_control football_sync_control_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_sync_control
    ADD CONSTRAINT football_sync_control_pkey PRIMARY KEY (id);


--
-- TOC entry 4888 (class 2606 OID 16829)
-- Name: man_of_match_votes man_of_match_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.man_of_match_votes
    ADD CONSTRAINT man_of_match_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 16831)
-- Name: man_of_match_votes man_of_match_votes_user_id_match_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.man_of_match_votes
    ADD CONSTRAINT man_of_match_votes_user_id_match_id_key UNIQUE (user_id, match_id);


--
-- TOC entry 4913 (class 2606 OID 16945)
-- Name: maritodle_daily_attempts maritodle_daily_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_daily_attempts
    ADD CONSTRAINT maritodle_daily_attempts_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 16947)
-- Name: maritodle_daily_attempts maritodle_daily_attempts_user_id_game_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_daily_attempts
    ADD CONSTRAINT maritodle_daily_attempts_user_id_game_date_key UNIQUE (user_id, game_date);


--
-- TOC entry 4907 (class 2606 OID 16930)
-- Name: maritodle_daily_games maritodle_daily_games_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_daily_games
    ADD CONSTRAINT maritodle_daily_games_date_key UNIQUE (date);


--
-- TOC entry 4909 (class 2606 OID 16928)
-- Name: maritodle_daily_games maritodle_daily_games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_daily_games
    ADD CONSTRAINT maritodle_daily_games_pkey PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 16643)
-- Name: maritodle_players maritodle_players_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players
    ADD CONSTRAINT maritodle_players_nome_key UNIQUE (nome);


--
-- TOC entry 4844 (class 2606 OID 16645)
-- Name: maritodle_players maritodle_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maritodle_players
    ADD CONSTRAINT maritodle_players_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 16857)
-- Name: match_players match_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_players
    ADD CONSTRAINT match_players_pkey PRIMARY KEY (id);


--
-- TOC entry 4878 (class 2606 OID 16776)
-- Name: match_voting match_voting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting
    ADD CONSTRAINT match_voting_pkey PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 16785)
-- Name: match_voting_players match_voting_players_match_voting_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting_players
    ADD CONSTRAINT match_voting_players_match_voting_id_player_id_key UNIQUE (match_voting_id, player_id);


--
-- TOC entry 4882 (class 2606 OID 16783)
-- Name: match_voting_players match_voting_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting_players
    ADD CONSTRAINT match_voting_players_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 16804)
-- Name: player_ratings player_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_ratings
    ADD CONSTRAINT player_ratings_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 16806)
-- Name: player_ratings player_ratings_player_id_user_id_match_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_ratings
    ADD CONSTRAINT player_ratings_player_id_user_id_match_id_key UNIQUE (player_id, user_id, match_id);


--
-- TOC entry 4846 (class 2606 OID 16647)
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 16649)
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 16903)
-- Name: transfer_rumors transfer_rumors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_rumors
    ADD CONSTRAINT transfer_rumors_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 16905)
-- Name: transfer_rumors transfer_rumors_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_rumors
    ADD CONSTRAINT transfer_rumors_unique_id_key UNIQUE (unique_id);


--
-- TOC entry 4853 (class 2606 OID 16651)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4855 (class 2606 OID 16653)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 4857 (class 2606 OID 16655)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 16657)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4861 (class 2606 OID 16659)
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 16661)
-- Name: votes votes_user_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_player_id_key UNIQUE (user_id, player_id);


--
-- TOC entry 4827 (class 1259 OID 16662)
-- Name: custom_poll_votes_poll_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_poll_votes_poll_id_idx ON public.custom_poll_votes USING btree (poll_id);


--
-- TOC entry 4828 (class 1259 OID 16663)
-- Name: custom_poll_votes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_poll_votes_user_id_idx ON public.custom_poll_votes USING btree (user_id);


--
-- TOC entry 4829 (class 1259 OID 16664)
-- Name: custom_poll_votes_user_poll_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX custom_poll_votes_user_poll_unique ON public.custom_poll_votes USING btree (user_id, poll_id);


--
-- TOC entry 4830 (class 1259 OID 16665)
-- Name: custom_polls_created_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_polls_created_by_idx ON public.custom_polls USING btree (created_by);


--
-- TOC entry 4822 (class 1259 OID 16666)
-- Name: idx_comments_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_author_id ON public.comments USING btree (author_id);


--
-- TOC entry 4823 (class 1259 OID 16667)
-- Name: idx_comments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_created_at ON public.comments USING btree (created_at);


--
-- TOC entry 4824 (class 1259 OID 16668)
-- Name: idx_comments_discussion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_discussion_id ON public.comments USING btree (discussion_id);


--
-- TOC entry 4835 (class 1259 OID 16669)
-- Name: idx_discussions_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_author_id ON public.discussions USING btree (author_id);


--
-- TOC entry 4836 (class 1259 OID 16670)
-- Name: idx_discussions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_created_at ON public.discussions USING btree (created_at);


--
-- TOC entry 4837 (class 1259 OID 16671)
-- Name: idx_discussions_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_updated_at ON public.discussions USING btree (updated_at);


--
-- TOC entry 4873 (class 1259 OID 16763)
-- Name: idx_football_lineups_fixture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_football_lineups_fixture ON public.football_lineups_cache USING btree (fixture_id);


--
-- TOC entry 4874 (class 1259 OID 16764)
-- Name: idx_football_lineups_player; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_football_lineups_player ON public.football_lineups_cache USING btree (player_api_id);


--
-- TOC entry 4868 (class 1259 OID 16760)
-- Name: idx_football_matches_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_football_matches_date ON public.football_matches_cache USING btree (match_date DESC);


--
-- TOC entry 4869 (class 1259 OID 16761)
-- Name: idx_football_matches_fixture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_football_matches_fixture ON public.football_matches_cache USING btree (fixture_id);


--
-- TOC entry 4870 (class 1259 OID 16762)
-- Name: idx_football_matches_processed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_football_matches_processed ON public.football_matches_cache USING btree (processed);


--
-- TOC entry 4910 (class 1259 OID 16950)
-- Name: idx_maritodle_daily_attempts_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_daily_attempts_date ON public.maritodle_daily_attempts USING btree (game_date);


--
-- TOC entry 4911 (class 1259 OID 16949)
-- Name: idx_maritodle_daily_attempts_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_daily_attempts_user_date ON public.maritodle_daily_attempts USING btree (user_id, game_date);


--
-- TOC entry 4905 (class 1259 OID 16948)
-- Name: idx_maritodle_daily_games_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_daily_games_date ON public.maritodle_daily_games USING btree (date);


--
-- TOC entry 4838 (class 1259 OID 16672)
-- Name: idx_maritodle_players_nacionalidade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_nacionalidade ON public.maritodle_players USING btree (nacionalidade);


--
-- TOC entry 4839 (class 1259 OID 16673)
-- Name: idx_maritodle_players_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_nome ON public.maritodle_players USING btree (nome);


--
-- TOC entry 4840 (class 1259 OID 16674)
-- Name: idx_maritodle_players_posicao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_maritodle_players_posicao ON public.maritodle_players USING btree (posicao_principal);


--
-- TOC entry 4891 (class 1259 OID 16859)
-- Name: idx_match_players_api_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_match_players_api_id ON public.match_players USING btree (api_player_id);


--
-- TOC entry 4892 (class 1259 OID 16858)
-- Name: idx_match_players_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_match_players_name ON public.match_players USING btree (name);


--
-- TOC entry 4895 (class 1259 OID 16916)
-- Name: idx_transfer_rumors_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transfer_rumors_created_at ON public.transfer_rumors USING btree (created_at);


--
-- TOC entry 4896 (class 1259 OID 16914)
-- Name: idx_transfer_rumors_is_approved; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transfer_rumors_is_approved ON public.transfer_rumors USING btree (is_approved);


--
-- TOC entry 4897 (class 1259 OID 16915)
-- Name: idx_transfer_rumors_is_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transfer_rumors_is_deleted ON public.transfer_rumors USING btree (is_deleted);


--
-- TOC entry 4898 (class 1259 OID 16912)
-- Name: idx_transfer_rumors_player_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transfer_rumors_player_name ON public.transfer_rumors USING btree (player_name);


--
-- TOC entry 4899 (class 1259 OID 16913)
-- Name: idx_transfer_rumors_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transfer_rumors_status ON public.transfer_rumors USING btree (status);


--
-- TOC entry 4900 (class 1259 OID 16911)
-- Name: idx_transfer_rumors_unique_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transfer_rumors_unique_id ON public.transfer_rumors USING btree (unique_id);


--
-- TOC entry 4849 (class 1259 OID 16675)
-- Name: poll_votes_position_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX poll_votes_position_id_idx ON public.poll_votes USING btree (position_id);


--
-- TOC entry 4850 (class 1259 OID 16676)
-- Name: poll_votes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX poll_votes_user_id_idx ON public.poll_votes USING btree (user_id);


--
-- TOC entry 4851 (class 1259 OID 16677)
-- Name: poll_votes_user_position_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX poll_votes_user_position_unique ON public.poll_votes USING btree (user_id, position_id);


--
-- TOC entry 4937 (class 2620 OID 16678)
-- Name: comments trigger_update_discussion_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_discussion_timestamp AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_discussion_timestamp();


--
-- TOC entry 4939 (class 2620 OID 16918)
-- Name: transfer_rumors trigger_update_transfer_rumors_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_transfer_rumors_updated_at BEFORE UPDATE ON public.transfer_rumors FOR EACH ROW EXECUTE FUNCTION public.update_transfer_rumors_updated_at();


--
-- TOC entry 4938 (class 2620 OID 16766)
-- Name: football_sync_control update_football_sync_control_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_football_sync_control_updated_at BEFORE UPDATE ON public.football_sync_control FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4941 (class 2620 OID 16952)
-- Name: maritodle_daily_attempts update_maritodle_daily_attempts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_maritodle_daily_attempts_updated_at BEFORE UPDATE ON public.maritodle_daily_attempts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4940 (class 2620 OID 16951)
-- Name: maritodle_daily_games update_maritodle_daily_games_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_maritodle_daily_games_updated_at BEFORE UPDATE ON public.maritodle_daily_games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4916 (class 2606 OID 16679)
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4917 (class 2606 OID 16684)
-- Name: comments comments_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- TOC entry 4918 (class 2606 OID 16689)
-- Name: custom_poll_votes custom_poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_poll_votes
    ADD CONSTRAINT custom_poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.custom_polls(id) ON DELETE CASCADE;


--
-- TOC entry 4919 (class 2606 OID 16694)
-- Name: custom_polls custom_polls_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_polls
    ADD CONSTRAINT custom_polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4920 (class 2606 OID 16699)
-- Name: discussions discussions_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 16906)
-- Name: transfer_rumors fk_transfer_rumors_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfer_rumors
    ADD CONSTRAINT fk_transfer_rumors_user FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4924 (class 2606 OID 16743)
-- Name: football_lineups_cache football_lineups_cache_fixture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.football_lineups_cache
    ADD CONSTRAINT football_lineups_cache_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.football_matches_cache(fixture_id) ON DELETE CASCADE;


--
-- TOC entry 4932 (class 2606 OID 16842)
-- Name: man_of_match_votes man_of_match_votes_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.man_of_match_votes
    ADD CONSTRAINT man_of_match_votes_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match_voting(id) ON DELETE CASCADE;


--
-- TOC entry 4933 (class 2606 OID 16876)
-- Name: man_of_match_votes man_of_match_votes_match_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.man_of_match_votes
    ADD CONSTRAINT man_of_match_votes_match_player_id_fkey FOREIGN KEY (match_player_id) REFERENCES public.match_players(id);


--
-- TOC entry 4934 (class 2606 OID 16832)
-- Name: man_of_match_votes man_of_match_votes_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.man_of_match_votes
    ADD CONSTRAINT man_of_match_votes_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4935 (class 2606 OID 16837)
-- Name: man_of_match_votes man_of_match_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.man_of_match_votes
    ADD CONSTRAINT man_of_match_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 16862)
-- Name: match_voting_players match_voting_players_match_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting_players
    ADD CONSTRAINT match_voting_players_match_player_id_fkey FOREIGN KEY (match_player_id) REFERENCES public.match_players(id);


--
-- TOC entry 4926 (class 2606 OID 16786)
-- Name: match_voting_players match_voting_players_match_voting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting_players
    ADD CONSTRAINT match_voting_players_match_voting_id_fkey FOREIGN KEY (match_voting_id) REFERENCES public.match_voting(id) ON DELETE CASCADE;


--
-- TOC entry 4927 (class 2606 OID 16791)
-- Name: match_voting_players match_voting_players_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_voting_players
    ADD CONSTRAINT match_voting_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4928 (class 2606 OID 16817)
-- Name: player_ratings player_ratings_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_ratings
    ADD CONSTRAINT player_ratings_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match_voting(id) ON DELETE CASCADE;


--
-- TOC entry 4929 (class 2606 OID 16869)
-- Name: player_ratings player_ratings_match_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_ratings
    ADD CONSTRAINT player_ratings_match_player_id_fkey FOREIGN KEY (match_player_id) REFERENCES public.match_players(id);


--
-- TOC entry 4930 (class 2606 OID 16807)
-- Name: player_ratings player_ratings_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_ratings
    ADD CONSTRAINT player_ratings_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4931 (class 2606 OID 16812)
-- Name: player_ratings player_ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_ratings
    ADD CONSTRAINT player_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4921 (class 2606 OID 16704)
-- Name: poll_votes poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 16709)
-- Name: votes votes_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 16714)
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-06-23 13:55:37

--
-- PostgreSQL database dump complete
--

