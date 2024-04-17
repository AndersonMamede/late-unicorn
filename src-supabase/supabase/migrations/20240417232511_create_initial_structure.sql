CREATE TABLE public.category(
  category_id serial PRIMARY KEY NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT '',
  UNIQUE(name)
);

CREATE TABLE public.project(
  project_id serial PRIMARY KEY NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  user_id uuid NOT NULL,
  name VARCHAR(50) NOT NULL DEFAULT '',
  description VARCHAR(1000) NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  lifetime_in_months integer NOT NULL DEFAULT 0,
  total_users integer NOT NULL DEFAULT 0,
  total_revenue integer NOT NULL DEFAULT 0,
  founders VARCHAR(100) NOT NULL DEFAULT '',
  technologies VARCHAR(300) NOT NULL DEFAULT '',
  learnings VARCHAR(500) NOT NULL DEFAULT ''
);
ALTER TABLE project ADD CONSTRAINT fk_project_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE RESTRICT;

CREATE TABLE public.project_scheenshot(
  project_scheenshot_id serial PRIMARY KEY NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  project_id integer NOT NULL,
  url VARCHAR(500) NOT NULL
);
ALTER TABLE project_scheenshot ADD CONSTRAINT fk_project_scheenshot_project_id
  FOREIGN KEY (project_id) REFERENCES public.project(project_id)
  ON DELETE RESTRICT;

CREATE TABLE public.project_category(
  project_category_id serial PRIMARY KEY NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  project_id integer NOT NULL,
  category_id integer NOT NULL
);
ALTER TABLE project_category ADD CONSTRAINT fk_project_category_project_id
  FOREIGN KEY (project_id) REFERENCES public.project(project_id)
  ON DELETE RESTRICT;
ALTER TABLE project_category ADD CONSTRAINT fk_project_category_category_id
  FOREIGN KEY (category_id) REFERENCES public.category(category_id)
  ON DELETE RESTRICT;

CREATE TABLE public.project_speculation(
  project_speculation_id serial PRIMARY KEY NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  project_id integer NOT NULL,
  sentence VARCHAR(500) NOT NULL DEFAULT ''
);
ALTER TABLE project_speculation ADD CONSTRAINT fk_project_speculation_project_id
  FOREIGN KEY (project_id) REFERENCES public.project(project_id)
  ON DELETE RESTRICT;
