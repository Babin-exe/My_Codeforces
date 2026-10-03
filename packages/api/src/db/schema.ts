import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, integer, pgEnum, check, text, boolean, unique } from "drizzle-orm/pg-core";

export const userRole = pgEnum('user_role', ['USER', 'ADMIN']);
export const problemStatus = pgEnum('problem_status', ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']);
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
    status: problemStatus('status').default("DRAFT").notNull(),
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
    testCaseS3Key: varchar('test_case_s3_key', { length: 256 }).notNull(),
    testCaseVersion: integer('test_case_version').notNull().default(1),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Problem = typeof problems.$inferSelect;
export type ProblemVersion = typeof problemVersions.$inferSelect;
export type Submission = typeof submissions.$inferSelect;


