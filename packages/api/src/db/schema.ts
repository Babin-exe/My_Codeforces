/*
export const USER_ROLE = `
CREATE TYPE user_role as ENUM('USER' , 'ADMIN');
`;

export const CHECKER_TYPE = `CREATE TYPE checker_type as ENUM ('STANDARD' , 'INTERACTIVE' , 'SPECIAL' )`;
export const STATUS = `CREATE TYPE status AS ENUM('DRAFT' , 'IN_REVIEW' , 'PUBLISHED' , 'ARCHIVED')`;


export const VERDICT = `CREATE TYPE verdicts AS ENUM (
    'PENDING', 'COMPILING', 'RUNNING',
    'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR',
    'COMPILATION_ERROR', 'INTERNAL_ERROR', 'CANCELLED'
)`;


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



 fk_table_name_column name



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

testcase_version INTEGER NOT NULL  DEFAULT 1,


is_active BOOLEAN NOT NULL DEFAULT TRUE ,



checker_script_s3_key VARCHAR(256)  ,
 
CHECK (

(
checker_type = 'STANDARD' AND checker_script_s3_key IS NULL
)

 OR 

 (
 checker_type IN ('INTERACTIVE' , 'SPECIAL') AND checker_script_s3_key IS NOT NULL
 )

),


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




Probelm can be of normal kind or of  interactive / Special  so we need script to run and check for correcteness 
checker_script_S3_key  

we have 
1) problem version  - 
2 ) test case version - 





export const SUBMISSIONS = `

CREATE TABLE submissions (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID NOT NULL ,
CONSTRAINT fk_submissions_user_id FOREIGN KEY(user_id) REFERENCES users(id),

problem_id UUID NOT NULL , 
CONSTRAINT fk_submissions_problem_id FOREIGN KEY (problem_id) REFERENCES problems(id),

problem_version_id UUID NOT NULL,
CONSTRAINT fk_submissions_problem_version_id FOREIGN KEY(problem_version_id) REFERENCES problem_versions(id),

language VARCHAR(32) NOT NULL,
source_code_key VARCHAR(256) NOT NULL ,

verdict verdicts NOT NULL DEFAULT 'PENDING',

time_ms INTEGER ,
memory_kb INTEGER,

compiler_output TEXT, 
runtime_output TEXT,

judge_version VARCHAR(64) ,

exit_code INTEGER ,

signal VARCHAR(32),

judged_at TIMESTAMPTZ ,



test_case_total INTEGER ,
test_case_passed INTEGER,


created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;



i may not know no of test cases at submission , and how many test case passed 
but when the judged output comes then i know how many test cases were there and how many passed 
so i can fill these later for that reason i will let it be null







with this much sql in mind lets try to write the drizzle schema now ...

 */




import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, integer, pgEnum, check } from "drizzle-orm/pg-core";

export const userrole = pgEnum('user_role', ['USER', 'ADMIN']);

export const users = pgTable("users", {
    id: uuid('id').defaultRandom().primaryKey(),
    userName: varchar('user_name', { length: 32 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phoneNo: varchar('phone_no', { length: 20 }).unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    rating: integer("rating"),
    maxRating: integer("max_rating"),
    avatarUrl: varchar('avatar_url', { length: 256 }),
    role: userrole('role').default('USER').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    check('rating_logic_check',
        sql`(
        ${table.rating} IS NULL AND ${table.maxRating} IS NULL 
    )
    OR 
    (
    ${table.rating} IS NOT NULL 
    AND ${table.maxRating} IS NOT NULL         
    AND ${table.rating} >= 0
    AND 
     ${table.maxRating} >= ${table.rating}
    )
        `),
]
);




