-- Create separate databases for each microservice
CREATE DATABASE IF NOT EXISTS auth_service_db;
CREATE DATABASE IF NOT EXISTS users_service_db;
CREATE DATABASE IF NOT EXISTS hr_service_db;

-- Create shadow databases for Prisma migrations
CREATE DATABASE IF NOT EXISTS auth_service_shadow;
CREATE DATABASE IF NOT EXISTS users_service_shadow;
CREATE DATABASE IF NOT EXISTS hr_service_shadow;

-- Create a dedicated user
CREATE USER IF NOT EXISTS 'micro_user'@'%' IDENTIFIED BY 'micro_password';

-- Grant all privileges on each database to the user
GRANT ALL PRIVILEGES ON auth_service_db.* TO 'micro_user'@'%';
GRANT ALL PRIVILEGES ON users_service_db.* TO 'micro_user'@'%';
GRANT ALL PRIVILEGES ON hr_service_db.* TO 'micro_user'@'%';

-- Grant privileges on shadow databases
GRANT ALL PRIVILEGES ON auth_service_shadow.* TO 'micro_user'@'%';
GRANT ALL PRIVILEGES ON users_service_shadow.* TO 'micro_user'@'%';
GRANT ALL PRIVILEGES ON hr_service_shadow.* TO 'micro_user'@'%';

-- Grant CREATE and DROP permissions for dynamic shadow databases
GRANT CREATE, DROP, ALTER, INDEX, REFERENCES ON *.* TO 'micro_user'@'%';

FLUSH PRIVILEGES;