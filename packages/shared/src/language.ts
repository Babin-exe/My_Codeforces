
/* 

Okay now what are the things that we can have in the language config???

id of the programming language  ( _1cpp1_ ),
maybe the compiler name ( gcc ),
string representation of the language ( Cpp__ ),
maybe the version of the language itself (26),

what extension can i have for this language  (.cpp, .c++)

how much time would i allow for the file to be compiled (Ms)
how much max memory i would i allow for the file (Kb)

how big of output can the code generate (Kb)

*/

export interface LanguageConfig {

    id: string;
    displayName: string;
    version: number;
    extension: string;
    monacoLanguage: string;

    max_Size_Limit_Kb: number;
    max_Run_Time_Ms: number;


    runCommand: string;
    compileCommand: string | null;
    timeLimitMultiplier: number | null;
    memoryLimitMultiplier: number | null;
    
};


export interface Language extends Record<string, LanguageConfig> {

};