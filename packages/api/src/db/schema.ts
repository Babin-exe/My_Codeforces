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




import { or, SQL, sql } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, integer, pgEnum, check, text, boolean, unique } from "drizzle-orm/pg-core";

export const userRole = pgEnum('user_role', ['USER', 'ADMIN']);
export const status = pgEnum('status', ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']);
export const checkerType = pgEnum('checker_type', ['STANDARD', 'INTERACTIVE', 'SPECIAL']);
export const verdicts = pgEnum('verdicts', ['PENDING', 'COMPILING', 'RUNNING',
    'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR',
    'COMPILATION_ERROR', 'INTERNAL_ERROR', 'CANCELLED']);


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
    role: userRole('role').default('USER').notNull(),
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



export const problems = pgTable("problems", {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    slug: text("slug").unique().notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: "restrict" }),
    visibility: boolean('visibility').notNull().default(false),
    status: status('status').default("DRAFT").notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true })
});




export const problemVersions = pgTable('problem_versions', {
    id: uuid('id').defaultRandom().primaryKey(),
    problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: "restrict" }),
    versionNumber: integer('version_number').notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    title: text('title').notNull(),
    timeLimitMs: integer('time_limit_ms').notNull().default(1000),
    memoryLimitMb: integer('memory_limit_mb').notNull().default(256),
    statement: text('statement').notNull(),
    outputLimitMb: integer('output_limit_mb').notNull().default(1),
    difficulty: integer('difficulty').notNull().default(800),
    checkerType: checkerType('checker_type').notNull().default("STANDARD"),
    testCaseCount: integer('test_case_count').notNull(),
    testCaseS3Key: varchar('testcase_s3_key', { length: 256 }).notNull(),
    testCaseVersion: integer('testcase_version').notNull().default(1),
    isActive: boolean('is_active').notNull().default(true),
    checkerScriptS3Key: varchar('checker_script_s3_key', { length: 256 })



}, (table) => [
    check('checker_stuff',
        sql
            `(${table.checkerType} = 'STANDARD' AND ${table.checkerScriptS3Key} IS NULL) OR
         
            (${table.checkerType} IN ('INTERACTIVE','SPECIAL') AND ${table.checkerScriptS3Key} IS NOT NULL) 

    `),

    check('rating_check', sql`${table.difficulty} >=800 AND ${table.difficulty} <=3500`),
    check('time_limit_check', sql`${table.timeLimitMs} >=1000 AND ${table.timeLimitMs} <=3000`),
    check(`memory_limit_check`, sql`${table.memoryLimitMb} >=256 AND ${table.memoryLimitMb}<=512 AND ${table.outputLimitMb} >=1 AND 
        ${table.outputLimitMb} <=64`),
    check('version_number_check', sql`${table.versionNumber}>0`),
    check('testcase_count_check', sql`${table.testCaseCount} >0`),
    check('testcase_version', sql`${table.testCaseVersion} > 0 `),

    unique('uq_problem_version').on(table.problemId, table.versionNumber),

],
);

export const submissions = pgTable('submissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    problemId: uuid('problem_id').notNull().references(() => problems.id, { onDelete: "restrict" }),
    problemVersionId: uuid('problem_version_id').notNull().references(() => problemVersions.id, { onDelete: "restrict" }),
    language: varchar('language', { length: 32 }).notNull(),
    sourceCodeKey: varchar('source_code_key', { length: 256 }).notNull(),
    verdict: verdicts('verdict').notNull().default("PENDING"),
    timeMs: integer('time_ms'),
    memoryKb: integer('memory_kb'),
    compilerOutput: text('compiler_output'),
    runtimeOutput: text('runtime_output'),
    judgeVersion: varchar('judge_version', { length: 64 }),
    exitCode: integer('exit_code'),
    signal: varchar('signal', { length: 32 }),
    judgedAt: timestamp('judged_at', { withTimezone: true }),
    testCaseTotal: integer('test_case_total'),
    testCasePassed: integer('test_case_passed'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});


