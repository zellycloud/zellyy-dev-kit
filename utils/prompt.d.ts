export declare class PromptError extends Error {
    constructor(message: string);
}
export declare class Prompt {
    static input(message: string, defaultValue?: string, required?: boolean): Promise<string>;
    static select<T extends string>(message: string, choices: T[], defaultChoice?: T): Promise<T>;
    static confirm(message: string, defaultValue?: boolean): Promise<boolean>;
    static multiSelect<T extends string>(message: string, choices: T[]): Promise<T[]>;
}
//# sourceMappingURL=prompt.d.ts.map