CREATE USER dev WITH PASSWORD 'aA1234!';
CREATE DATABASE dev OWNER dev;

-- psql -U user_name -d db_name -a -f file.sql