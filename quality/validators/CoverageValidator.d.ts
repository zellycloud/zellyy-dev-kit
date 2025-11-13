import { CoverageValidationResult } from '../TrustChecker';
export interface CoverageConfig {
    threshold?: number;
    minFileThreshold?: number;
}
export declare class CoverageValidator {
    private projectPath;
    private config;
    constructor(projectPath: string, config?: CoverageConfig);
    validate(): Promise<CoverageValidationResult>;
    private runCoverageTest;
    private countTestFiles;
    private calculateCoverage;
    private analyzeFileDetails;
    autoFix(): Promise<number>;
}
//# sourceMappingURL=CoverageValidator.d.ts.map