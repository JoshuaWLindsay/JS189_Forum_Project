CREATE DATABASE forum_threads;

-- \c forum_threads

CREATE TABLE churches (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE sermons (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  date date NOT NULL,
  series text NOT NULL,
  youtube_id char(11) NOT NULL UNIQUE,
  church_id integer REFERENCES churches (id) ON DELETE CASCADE
);

CREATE TABLE users (
  username text PRIMARY KEY,
  password text NOT NULL
);

CREATE TABLE threads (
  id serial PRIMARY KEY,
  group_name text NOT NULL,
  prompt text NOT NULL,
  date timestamptz DEFAULT NOW(),
  username text REFERENCES users (username) ON DELETE CASCADE,
  sermon_id integer REFERENCES sermons (id) ON DELETE CASCADE
);

CREATE TABLE posts (
  id serial PRIMARY KEY,
  content text NOT NULL,
  date timestamptz DEFAULT NOW(),
  thread_id integer REFERENCES threads (id) ON DELETE CASCADE,
  username text REFERENCES users (username) ON DELETE CASCADE
);
