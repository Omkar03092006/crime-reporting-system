CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    latitude DOUBLE NOT NULL DEFAULT 0.0,
    longitude DOUBLE NOT NULL DEFAULT 0.0,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crimes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crime_type VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    latitude DOUBLE,
    longitude DOUBLE,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reported_by BIGINT,
    CONSTRAINT fk_crime_user FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- Add any other existing tables below
-- ... rest of schema ... 