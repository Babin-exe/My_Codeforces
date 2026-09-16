export const USER_ROLE = `
CREATE TYPE user_role as ENUM('USER' , 'ADMIN');
`;

export const USER = `
CREATE TABLE users(
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

display_name VARCHAR(255) NOT NULL,
user_name VARCHAR(32) NOT NULL UNIQUE,

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

email VARCHAR(255) NOT NULL UNIQUE,
phone_no VARCHAR(20) UNIQUE,
password_hash VARCHAR(255) NOT NULL,

rating INTEGER,
max_rating INTEGER,

CHECK (
    (rating IS NULL AND max_rating IS NULL)
    OR
    (
        rating IS NOT NULL
        AND max_rating IS NOT NULL
        AND rating >= 0
        AND max_rating >= rating
    )
),

avatar_url VARCHAR(255),

role user_role NOT NULL DEFAULT 'USER',

updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);
`;