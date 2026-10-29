import { z } from "zod";


export enum CheckerType {
    STANDARD = "STANDARD",
    INTERACTIVE = "INTERACTIVE",
    SPECIAL = "SPECIAL"
}






export const createProblemSchema = z.object({

    slug: z.string()
        .min(3, "Slug must be at least 3 characters")
        .max(100, "Slug must be at most 100 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (e.g. 'two-sum')"),



    title: z.string()
        .min(1, "Title is required")
        .max(255, "Title must be at most 255 characters"),

    statement: z.string()
        .min(1, "Problem statement is required"),

    // Mirrors: check('rating_check', sql`difficulty >= 800 AND difficulty <= 3500`)
    difficulty: z.number()
        .int("Difficulty must be a whole number")
        .min(800, "Difficulty must be at least 800")
        .max(3500, "Difficulty must be at most 3500"),

    // Mirrors: check('time_limit_check', sql`timeLimitMs >= 1000 AND timeLimitMs <= 3000`)
    timeLimitMs: z.number()
        .int()
        .min(1000, "Time limit must be at least 1000ms")
        .max(3000, "Time limit must be at most 3000ms"),

    // Mirrors: check('memory_limit_check', sql`memoryLimitMb >= 256 AND memoryLimitMb <= 512`)
    memoryLimitMb: z.number()
        .int()
        .min(256, "Memory limit must be at least 256MB")
        .max(512, "Memory limit must be at most 512MB"),

    // Mirrors: check('memory_limit_check', sql`outputLimitMb >= 1 AND outputLimitMb <= 64`)
    outputLimitMb: z.number()
        .int()
        .min(1, "Output limit must be at least 1MB")
        .max(64, "Output limit must be at most 64MB"),

    checkerType: z.nativeEnum(CheckerType),

    // Mirrors: check('testcase_count_check', sql`testCaseCount > 0`)
    testCaseCount: z.number()
        .int()
        .positive("Test case count must be positive"),

    testCaseS3Key: z.string()
        .min(1, "Test case S3 key is required"),

    // Mirrors: check('testcase_version', sql`testCaseVersion > 0`)
    testCaseVersion: z.number()
        .int()
        .positive("Test case version must be positive"),

    // Optional: only required when checkerType is INTERACTIVE or SPECIAL
    // (mirrors the checker_stuff CHECK constraint in your schema)
    checkerScriptS3Key: z.string().min(1).optional(),

}).refine((data) => {
    /*
        This is a cross-field validation — it checks relationships BETWEEN fields.
        
        Your schema.ts has this CHECK constraint:
          (checkerType = 'STANDARD' AND checkerScriptS3Key IS NULL)
          OR
          (checkerType IN ('INTERACTIVE','SPECIAL') AND checkerScriptS3Key IS NOT NULL)
        
        We replicate that same logic here so the user gets a 400 with a clear 
        message instead of hitting a Postgres CHECK violation (which returns a 500).
    */
    if (data.checkerType === CheckerType.STANDARD) {
        return data.checkerScriptS3Key === undefined;
    }
    // INTERACTIVE or SPECIAL → must provide a checker script
    return data.checkerScriptS3Key !== undefined;
}, {
    message: "STANDARD checker must not have a script; INTERACTIVE/SPECIAL checkers require checkerScriptS3Key",
    path: ["checkerScriptS3Key"],
});


/*
  z.infer<typeof schema> extracts the TypeScript type from the Zod schema.
  
  This means you write your validation rules ONCE in the schema above, 
  and TypeScript automatically knows the shape. No duplication.
  
  Before (manual duplication):
    type createProblemInput = { slug: string, title: string, ... }  ← TypeScript type
    // + manual if/else validation somewhere else                   ← runtime checks
  
  After (single source of truth):
    const createProblemSchema = z.object({ ... })   ← defines BOTH type AND validation
    type CreateProblemInput = z.infer<...>           ← type extracted automatically
*/
export type CreateProblemInput = z.infer<typeof createProblemSchema>;


