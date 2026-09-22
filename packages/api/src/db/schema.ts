export const USER_ROLE = `
CREATE TYPE user_role as ENUM('USER' , 'ADMIN');
`;

export const CHECKER_TYPE = `CREATE TYPE checker_type as ENUM ('STANDARD' , 'INTERACTIVE' , 'SPECIAL' )`;

export const STATUS = `CREATE TYPE status AS ENUM('DRAFT' , 'IN_REVIEW' , 'PUBLISHED' , 'ARCHIVED')`;

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


export const PROBLEMS = `
CREATE TABLE problems(

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    slug TEXT UNIQUE NOT NULL,

    created_by UUID NOT NULL,

    CONSTRAINT fk_problems_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    visibility BOOLEAN NOT NULL DEFAULT FALSE,

    status status NOT NULL DEFAULT 'DRAFT',

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ

);
`;


/*
 fk_table_name_column name
 */


export const PROBLEM_VERSIONS = `

CREATE TABLE problem_versions (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

problem_id UUID NOT NULL,

CONSTRAINT  fk_problem_version_problem_id
FOREIGN KEY (problem_id)
REFERENCES problems(id)
 ON DELETE RESTRICT ,

version_number INTEGER NOT NULL ,

created_by UUID NOT NULL ,

CONSTRAINT fk_problem_version_created_by 
FOREIGN KEY (created_by) 
REFERENCES users(id),

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

title TEXT NOT NULL ,

CONSTRAINT uq_problem_version
 UNIQUE(problem_id , version_number),

time_limit_ms INTEGER NOT NULL DEFAULT 1000,

memory_limit_mb INTEGER NOT NULL DEFAULT 256,

statement TEXT NOT NULL ,

output_limit_mb INTEGER NOT NULL DEFAULT 1,


difficulty INTEGER NOT NULL DEFAULT 800,

checker_type checker_type NOT NULL DEFAULT 'STANDARD' ,

testcase_count INTEGER NOT NULL ,

testcase_s3_key VARCHAR(256) NOT NULL ,

testcase_version INTEGER NOT NULL ,


is_active BOOLEAN NOT NULL ,


CHECK (
difficulty >=800 AND difficulty <= 3500
) , 

CHECK (
time_limit_ms >=1000 AND time_limit_ms <=3000
),

CHECK (
memory_limit_mb>=256
AND memory_limit_mb <= 512
AND output_limit_mb >= 1
AND output_limit_mb <= 64
),

CHECK (
version_number > 0 
) ,

CHECK (
testcase_count > 0 
), 


CHECK (
testcase_version > 0
)

);
`;
