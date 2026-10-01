CREATE TYPE "public"."checker_type" AS ENUM('STANDARD', 'INTERACTIVE', 'SPECIAL');--> statement-breakpoint
CREATE TYPE "public"."problem_status" AS ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."verdicts" AS ENUM('PENDING', 'COMPILING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'INTERNAL_ERROR', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "problem_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"time_limit_ms" integer DEFAULT 1000 NOT NULL,
	"memory_limit_mb" integer DEFAULT 256 NOT NULL,
	"statement" text NOT NULL,
	"output_limit_mb" integer DEFAULT 1 NOT NULL,
	"difficulty" integer DEFAULT 800 NOT NULL,
	"checker_type" "checker_type" DEFAULT 'STANDARD' NOT NULL,
	"test_case_count" integer NOT NULL,
	"test_case_s3_key" varchar(256) NOT NULL,
	"test_case_version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"checker_script_s3_key" varchar(256),
	CONSTRAINT "uq_problem_version" UNIQUE("problem_id","version_number"),
	CONSTRAINT "checker_stuff" CHECK (("problem_versions"."checker_type" = 'STANDARD' AND "problem_versions"."checker_script_s3_key" IS NULL) OR
         
            ("problem_versions"."checker_type" IN ('INTERACTIVE','SPECIAL') AND "problem_versions"."checker_script_s3_key" IS NOT NULL) 

    ),
	CONSTRAINT "rating_check" CHECK ("problem_versions"."difficulty" >=800 AND "problem_versions"."difficulty" <=3500),
	CONSTRAINT "time_limit_check" CHECK ("problem_versions"."time_limit_ms" >=1000 AND "problem_versions"."time_limit_ms" <=3000),
	CONSTRAINT "memory_limit_check" CHECK ("problem_versions"."memory_limit_mb" >=256 AND "problem_versions"."memory_limit_mb"<=512 AND "problem_versions"."output_limit_mb" >=1 AND 
        "problem_versions"."output_limit_mb" <=64),
	CONSTRAINT "version_number_check" CHECK ("problem_versions"."version_number">0),
	CONSTRAINT "testcase_count_check" CHECK ("problem_versions"."test_case_count" >0),
	CONSTRAINT "testcase_version" CHECK ("problem_versions"."test_case_version" > 0 )
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"created_by" uuid NOT NULL,
	"visibility" boolean DEFAULT false NOT NULL,
	"status" "problem_status" DEFAULT 'DRAFT' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "problems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"problem_version_id" uuid NOT NULL,
	"language" varchar(32) NOT NULL,
	"source_code_key" varchar(256) NOT NULL,
	"verdict" "verdicts" DEFAULT 'PENDING' NOT NULL,
	"time_ms" integer,
	"memory_kb" integer,
	"compiler_output" text,
	"runtime_output" text,
	"judge_version" varchar(64),
	"exit_code" integer,
	"signal" varchar(32),
	"judged_at" timestamp with time zone,
	"test_case_total" integer,
	"test_case_passed" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" varchar(32) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_no" varchar(20),
	"password_hash" varchar(255) NOT NULL,
	"rating" integer,
	"max_rating" integer,
	"avatar_url" varchar(256),
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_name_unique" UNIQUE("user_name"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_no_unique" UNIQUE("phone_no"),
	CONSTRAINT "rating_logic_check" CHECK ((
        "users"."rating" IS NULL AND "users"."max_rating" IS NULL 
    )
    OR 
    (
    "users"."rating" IS NOT NULL 
    AND "users"."max_rating" IS NOT NULL         
    AND "users"."rating" >= 0
    AND 
     "users"."max_rating" >= "users"."rating"
    )
        )
);
--> statement-breakpoint
ALTER TABLE "problem_versions" ADD CONSTRAINT "problem_versions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_versions" ADD CONSTRAINT "problem_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_version_id_problem_versions_id_fk" FOREIGN KEY ("problem_version_id") REFERENCES "public"."problem_versions"("id") ON DELETE restrict ON UPDATE no action;