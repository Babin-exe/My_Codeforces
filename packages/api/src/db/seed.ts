import { db } from "./connection.ts";
import { users, problems, problemVersions } from "./schema.ts";

async function seed() {


    /*
    
    Okay so this is the goal : 

    first of all we need to make a user , then we have to make a problem and then 
    problem version

    */

    const defaultPasswordHash = await Bun.password.hash("random_password123");


    //Lets create a user data first of all 
    console.log("Creating a test user.....");
    const [adminUser] = await db
        .insert(users)
        .values({
            userName: "admin",
            displayName: "System Admin",
            email: "admin@oj.local",
            passwordHash: defaultPasswordHash,
            role: "ADMIN",
        })
        .onConflictDoNothing()
        .returning();

    const [tourist] = await db
        .insert(users)
        .values({
            userName: "tourist",
            displayName: "Gennady Korotkevich",
            email: "tourist@oj.local",
            passwordHash: defaultPasswordHash,
            role: "USER",
            rating: 3800,
            maxRating: 3800,
        })
        .onConflictDoNothing()
        .returning();

    const author = adminUser || (await db.query.users.findFirst({ where: (u, { eq }) => eq(u.userName, "admin") }));

    if (!author) { throw new Error("Cannot insert or get a user"); }


    //Now lets create a problem data also 
    const [twoSumProblem] = await db.insert(problems).values({
        createdAt: new Date(),
        slug: "two_sum",
        createdBy: author.id,
        visibility: true,
        status: "PUBLISHED",
    }).onConflictDoNothing().returning();


    const problem = twoSumProblem || await db.query.problems.findFirst({ where: (p, { eq }) => eq(p.slug, "two_sum") });

    if (!problem) {
        throw new Error("Cannot insert or find any problem");
    }


    if (problem) {

        await db.insert(problemVersions).values({
            problemId: problem.id,
            versionNumber: 1,
            createdBy: author.id,
            createdAt: new Date(),
            title: "Two Sum",
            timeLimitMs: 1000,
            memoryLimitMb: 256,

            statement: `Given an array of integers "nums" and an integer "target",
             return indices of the two numbers such that they add up to "target".`,

            outputLimitMb: 1,
            difficulty: 800,
            checkerType: "STANDARD",
            testCaseCount: 10,
            testCaseS3Key: "s3://problems/two-sum/v1/testcases.zip",
            testCaseVersion: 1,
            isActive: true,

        }).onConflictDoNothing();


    }
    console.log("Problem Version also Created ");
    process.exit(0);

}

seed().catch((error) => {
    console.log(error);
    process.exit(1);
});