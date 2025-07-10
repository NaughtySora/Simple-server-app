create table if not exists user_system (
  id uuid not null default gen_random_uuid(),
  nickname varchar(25) not null check(length(nickname) >= 3 and nickname !~ '[^A-Za-z0-9_]'),
  password text not null,
  email varchar(255) not null check(length(nickname) >= 5)
);