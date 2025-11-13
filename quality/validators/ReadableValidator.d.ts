import { ReadableValidationResult } from '../TrustChecker';
interface ReadableConfig {
    eslint?: {
        enabled?: boolean;
        configPath?: string;
    };
    prettier?: {
        enabled?: boolean;
        configPath?: string;
    };
}
export declare class ReadableValidator {
    private projectPath;
    private config;
    constructor(projectPath: string, config?: ReadableConfig);
    validate(): Promise<ReadableValidationResult>;
    private runESLint;
    private checkPrettier;
    autoFix(): Promise<number>;
}
export {};
//# sourceMappingURL=ReadableValidator.d.ts.map