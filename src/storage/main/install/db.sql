
CREATE TABLE IF NOT EXISTS user_system (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  nickname varchar(25) UNIQUE NOT NULL,
  password text NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  create_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp,
  CHECK(LENGTH(nickname::text) >= 3 AND nickname::text !~ '[^a-zA-Z0-9_]'),
  CHECK(LENGTH(email::text) >= 5)
);

CREATE TABLE IF NOT EXISTS user_session (
  user_id serial NOT NULL,
  access text,
  refresh text,
  create_at timestamptz NOT NULL DEFAULT current_timestamp,
  updated_at timestamptz NOT NULL DEFAULT current_timestamp,
  constraint fk_user_session foreign key (user_id) references user_system(id) on delete cascade,
  constraint pk_user_session primary key(access, refresh)
);

CREATE OR REPLACE FUNCTION refresh_update_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER refresh_update_at
BEFORE UPDATE 
ON user_system
FOR EACH ROW
EXECUTE FUNCTION refresh_update_at();

CREATE OR REPLACE TRIGGER refresh_update_at
BEFORE UPDATE 
ON user_session
FOR EACH ROW
EXECUTE FUNCTION refresh_update_at();