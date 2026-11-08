import { db } from "../db/connection.ts";
import { problems, problemVersions } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/app-error.ts";
import type { CreateProblemInput } from "../validators/problem.validators.ts";

/*
=============================================================================
  PHASE 4: The Service Layer
=============================================================================

  WHY A SEPARATE SERVICE LAYER:
  -----------------------------
  The controller handles HTTP concerns (req, res, status codes, cookies).
  The service handles BUSINESS LOGIC (database queries, data rules).
  
  This separation gives you:
  
  1. TESTABILITY: You can unit test createProblem() by passing plain objects.
     No need to mock Express Request/Response objects.
  
  2. REUSABILITY: If you later build a CLI tool, a GraphQL API, or a 
     background job that also creates problems, you just call the same 
     service function. It doesn't know or care about HTTP.
  
  3. CLARITY: The controller is 5 lines. The service is where the real 
     logic lives. Each file has one job.
  
  Compare with your auth code:
    Controller (auth.controllers.ts) → handles req/res, calls service
    Service (auth.services.ts)       → does the actual DB work
  Same pattern here.
  
  
  WHY TRANSACTIONS:
  -----------------
  Creating a problem requires TWO inserts:
    1. Insert into `problems` table (the problem shell: slug, createdBy)
    2. Insert into `problem_versions` table (the actual content: title, statement, etc.)
  
  What if insert #1 succeeds but insert #2 fails? You'd have an orphaned 
  problem row with no version — broken data.
  
  db.transaction() wraps both inserts in a single database transaction:
    - If everything succeeds → COMMIT (both rows are saved)
    - If anything throws    → ROLLBACK (neither row is saved)
  
  Inside the callback, you use `tx` instead of `db` for all queries.
  `tx` is a "transactional db" — same API, but tied to the transaction.
=============================================================================
*/


export async function createProblem(input: CreateProblemInput, userId: string) {

  // Check for duplicate slug before attempting insert.
  // Yes, the database has a UNIQUE constraint on slug too, but checking 
  // here lets us return a clean 409 with a human-readable message,
  // instead of catching a raw Postgres unique violation error.

  const existing = await db.query.problems.findFirst({
    where: eq(problems.slug, input.slug),
  });

  if (existing) {
    throw new AppError(409, `Problem with slug '${input.slug}' already exists`);
  }


  // Transaction: both inserts succeed together or neither does
  const result = await db.transaction(async (tx) => {

    // Step 1: Create the problem shell
    const [problem] = await tx.insert(problems).values({
      slug: input.slug,
      createdBy: userId,
    }).returning();

    if (!problem) {
      throw new AppError(500, "Failed to create problem");
    }

    // Step 2: Create the first version (version 1)
    const [version] = await tx.insert(problemVersions).values({
      problemId: problem.id,
      versionNumber: 1,
      createdBy: userId,
      title: input.title,
      statement: input.statement,
      difficulty: input.difficulty,
      timeLimitMs: input.timeLimitMs,
      memoryLimitMb: input.memoryLimitMb,
      outputLimitMb: input.outputLimitMb,
      checkerType: input.checkerType,
      testCaseCount: input.testCaseCount,
      testCaseS3Key: input.testCaseS3Key,
      testCaseVersion: input.testCaseVersion,
      checkerScriptS3Key: input.checkerScriptS3Key ?? null,
    }).returning();

    if (!version) {
      throw new AppError(500, "Failed to create problem version");
    }

    // Return both — the controller decides what to send to the client
    return { problem, version };
  });

  return result;
};


export async function getProblem(slug: string) {

  const problem = await db.query.problems.findFirst({
    where: eq(problems.slug, slug),
    with: {
      versions: true,
    }
  });

  if (!problem) {
    throw new AppError(404, `Problem with slug '${slug}' not found`);
  }

  return problem;
};
