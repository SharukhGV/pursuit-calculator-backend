-- -- Drop the database if it exists
-- DROP DATABASE IF EXISTS auth_db;

-- -- Create a new database
-- CREATE DATABASE auth_db;

-- -- Connect to the new database
-- \c auth_db;

-- -- Drop the users table if it exists
-- DROP TABLE IF EXISTS users;

-- -- Create the users table
-- CREATE TABLE users (
--     id SERIAL PRIMARY KEY,              -- Auto-incrementing primary key
--     username VARCHAR(100) NOT NULL UNIQUE, -- Unique username
--     password VARCHAR(255) NOT NULL,        -- Password hash
--     created_at TIMESTAMP DEFAULT NOW(),    -- Timestamp for user creation
--     updated_at TIMESTAMP DEFAULT NOW()     -- Timestamp for the last update
-- );

-- -- Example Indexes for Performance (Optional)
-- CREATE INDEX idx_username ON users (username);


-- -- -- Drop the calculations table if it exists
-- -- DROP TABLE IF EXISTS calculations;

-- -- Create the calculations table
-- CREATE TABLE calculations (
--     id SERIAL PRIMARY KEY,
--     number1 FLOAT NOT NULL,
--     number2 FLOAT NOT NULL,
--     operation VARCHAR(10) NOT NULL,
--     result FLOAT NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );
