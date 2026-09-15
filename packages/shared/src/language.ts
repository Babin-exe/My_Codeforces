export interface LanguageConfig {
    id: string;
    displayName: string;
    extension: string;
    monacoLanguage: string;
    version: string;
};

export interface LanguageExecutionConfig {
    runCommand: string;
    compileCommand: string | null;
    compileTimeLimitMs: number;
    memoryLimitMb: number;
    outputLimitMb: number;
    timeLimitMultiplier: number;
    memoryLimitMultiplier: number;
};


export type LanguageInfo = LanguageConfig & LanguageExecutionConfig;

export const Languages = {
    cpp20: {

        id: "cpp20",
        displayName: "C++20 (G++ 13)",
        extension: ".cpp",
        monacoLanguage: "cpp",
        version: "cpp20",
        compileCommand: 'g++ -std=c++20 -O2 -DONLINE_JUDGE -o solution solution.cpp',
        runCommand: "./solution",
        compileTimeLimitMs: 5000,
        memoryLimitMb: 512,
        outputLimitMb: 64,
        timeLimitMultiplier: 1.0,
        memoryLimitMultiplier: 1.0,
    },

    python3: {
        id: "python3",
        displayName: "Python 3.11",
        extension: ".py",
        monacoLanguage: "python",
        version: "3.11",
        compileCommand: null,
        runCommand: "python3 solution.py",
        compileTimeLimitMs: 0,
        memoryLimitMb: 256,
        outputLimitMb: 64,
        timeLimitMultiplier: 2.0,
        memoryLimitMultiplier: 1.5,
    }
} as const satisfies Record<string, LanguageInfo>;


export type LanguageKeys = keyof typeof Languages;

export function getLanguage(id: string): LanguageInfo | undefined {
    return (Languages as Record<string, LanguageInfo>)[id];
};

export function getSupportedLanguageIds(): LanguageKeys[] {
    return Object.keys(Languages) as LanguageKeys[];
};