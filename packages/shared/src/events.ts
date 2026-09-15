
import { type Verdict } from "./verdicts.ts";
import { type LanguageExecutionConfig, type LanguageKeys } from "./language.ts";

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

export interface EventExecutionConfig {
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


    problemVersionId: number;

    language: LanguageKeys;

    sourceCodeKey: string;

    executionConfig: EventExecutionConfig;
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

    language: LanguageKeys;
    problemVersionId: number;

    testCaseTotal: number;
    testCasePassed: number;

    judgeVersion: string;

    exitCode: number | null;
    signal: string | null;
};




export interface RejudgeRequestedEvent extends BaseEvent<"REJUDGE_REQUESTED"> {
    type: "REJUDGE_REQUESTED";
    submissionId: string;
    problemId: string;
    problemVersionId: number;
    requestedBy: string;
    reason: string;
};


export const TOPICS = {
    SUBMISSIONS_PENDING: "submissions.pending",
    SUBMISSIONS_JUDGED: "submissions.judged",
    SUBMISSIONS_REJUDGED: "submissions.rejudge",
    SUBMISSIONS_DLQ: "submissions.dlq",
} as const;

