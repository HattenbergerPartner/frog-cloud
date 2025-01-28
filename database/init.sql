CREATE TABLE crawls (
    id serial,
    task_id text,
    status text,
    start_url text,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    report_data jsonb,
    PRIMARY KEY (id)
);
CREATE TABLE configs (
    id serial,
    config_id text,
    status text,
    name text,
    description text,
    created_time TIMESTAMPTZ,
    config_data jsonb,
    PRIMARY KEY (id)
);