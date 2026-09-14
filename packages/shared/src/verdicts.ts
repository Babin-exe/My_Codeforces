/* 
This is the verdict that i will be using everywhere , api , workers , frotend etc etc 
*/

export const VERDICTS = {
    ACCEPTED: "ACCEPTED",
    RUNNING: "RUNNING",
    PENDING: "PENDING",
    CANCELLED: "CANCELLED",
    COMPILATION_ERROR: "COMPILATION_ERROR",
    TIME_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
    MEMORY_LIMIT_EXCEEDED: "MEMORY_LIMIT_EXCEEDED",
    WRONG_ANSWER: "WRONG_ANSWER",
    COMPILING: "COMPILING",
    RUNTIME_ERROR: "RUNTIME_ERROR",
    INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;


export type Verdict = (typeof VERDICTS)[keyof typeof VERDICTS];



/* 
Now there can be multiple transition between verdicts 
like user clicks submit : pending -> compiling -> accepted 
or pending -> compiling -> Time limit exceed  so lets define some valid transitions 
*/

export const VALID_TRANSITIONS: Record<Verdict, Verdict[]> = {
    PENDING: [VERDICTS.COMPILING, VERDICTS.CANCELLED],
    COMPILING: [VERDICTS.COMPILATION_ERROR, VERDICTS.RUNNING, VERDICTS.INTERNAL_ERROR, VERDICTS.CANCELLED],
    RUNNING: [VERDICTS.ACCEPTED, VERDICTS.WRONG_ANSWER, VERDICTS.TIME_LIMIT_EXCEEDED, VERDICTS.MEMORY_LIMIT_EXCEEDED,
    VERDICTS.CANCELLED, VERDICTS.RUNTIME_ERROR, VERDICTS.INTERNAL_ERROR],
    ACCEPTED: [VERDICTS.PENDING],
    CANCELLED: [VERDICTS.PENDING],
    COMPILATION_ERROR: [VERDICTS.PENDING],
    TIME_LIMIT_EXCEEDED: [VERDICTS.PENDING],
    MEMORY_LIMIT_EXCEEDED: [VERDICTS.PENDING],
    WRONG_ANSWER: [VERDICTS.PENDING],
    RUNTIME_ERROR: [VERDICTS.PENDING],
    INTERNAL_ERROR: [VERDICTS.PENDING],
};



/* Check whether `to` is a valid immediate next state after `from`. */
export function isValidTransition(from: Verdict, to: Verdict): boolean {
    return (VALID_TRANSITIONS[from]?.includes(to)) ?? false;
};



/* Pending -> compilation -> Running -> all other stuffs  */
/*  we in the last state now   */

const activeVerdicts: Verdict[] = [
    VERDICTS.PENDING,
    VERDICTS.COMPILING,
    VERDICTS.RUNNING
];

export function isExecutionFinishedVerdict(verdict: Verdict): boolean {
    return !activeVerdicts.includes(verdict);
}

