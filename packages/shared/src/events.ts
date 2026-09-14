
import { type Verdict } from "./verdicts.ts";

export enum Language {
    CPLUSPLUS = "CPLUSPLUS",
    JAVA = "JAVA",
    PYTHON = "PYTHON"
};

export enum CheckerType {
    STANDARD = "STANDARD",        // Token/diff based comparison
    SPECIAL = "SPECIAL",          // Custom checker script
    INTERACTIVE = "INTERACTIVE"   // Interactive communication
};

export interface BaseEvent<T extends string> {
    eventId: string;
    type: T;
    schemaVersion: number;
    traceId: string;
    createdAt: string;
};

export interface ExecutionConfig {
    timeLimitMs: number;
    memoryLimitMb: number;
    outputLimitMb: number;

    checkerType: CheckerType;

    // Required for SPECIAL / INTERACTIVE checkers
    checkerCustomScriptS3Key?: string;
};

export interface SubmissionCreatedEvent
    extends BaseEvent<"SUBMISSION_CREATED"> {

    type: "SUBMISSION_CREATED";

    submissionId: string;
    userId: string;
    problemId: string;

    // Important for reproducible judging
    problemVersionId: number;

    language: Language;

    // Location where the worker can fetch source code
    sourceCodeKey: string;

    executionConfig: ExecutionConfig;
};


export interface SubmissionJudgedEvent
    extends BaseEvent<"SUBMISSION_JUDGED"> {

    type: "SUBMISSION_JUDGED";

    submissionId: string;

    verdict: Verdict;

    timeMs: number;
    memoryKb: number;

    compilerOutput: string | null;
    runtimeOutput: string | null;

    language: Language;
    problemVersionId: number;

    testCaseTotal: number;
    testCasePassed: number;

    judgeVersion: string;

    exitCode: number | null;
    signal: string | null;
};


//Now lets say i want to re judge a problem on some updated problem statement so what should this look like ???

export interface RejudgeRequestedEvent extends BaseEvent<"REJUDGE_REQUESTED"> {
    type: "REJUDGE_REQUESTED";
    submissionId: string;
    problemId: string;
    problemVersionId: number;
    requestedBy: string;
    reason: string;
};

/*
 Now the last thing remaining is , what are the topics i want in redpanda??

 So here i have created 3 differnt topics , one for normal submission from user , 
 one for the output of the submission and the last one for 
 Rejudgment  , where the request is from system or admin

 1) User -> backend-> RedPanda (Submission_Pending....)

 2) Actual Judge -> Judged output to RedPanda (submission_Judged...)

 3) ReJudge Request (system or admin) -> RedPanda (submission_rejudge...)

*/

export const TOPICS = {
    SUBMISSIONS_PENDING: "submissions.pending",
    SUBMISSIONS_JUDGED: "submissions.judged",
    SUBMISSIONS_REJUDGED: "submissions.rejudge",
    SUBMISSIONS_DLQ: "submissions.dlq",
} as const;

