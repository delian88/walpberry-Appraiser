
-- Walpberry Appraiser DB Schema

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(100),
    first_name VARCHAR(100),
    ippis_number VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('EMPLOYEE', 'PM', 'CTO', 'ADMIN')),
    designation VARCHAR(255),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contracts (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monthly_reviews (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appraisals (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching within JSONB
CREATE INDEX idx_contracts_employee ON contracts ((data->>'employeeId'));
CREATE INDEX idx_appraisals_status ON appraisals ((data->>'status'));
