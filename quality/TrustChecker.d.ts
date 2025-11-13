export interface QualityCheckResult {
    status: 'passed' | 'failed' | 'warning';
    timestamp: string;
    durationMs: number;
    coverage: CoverageValidationResult;
    readable: ReadableValidationResult;
    unified: UnifiedValidationResult;
    secured: SecuredValidationResult;
    trackable: TrackableValidationResult;
    score: number;
    summary: string;
}
export interface CoverageValidationResult {
    passed: boolean;
    percentage: number;
    threshold: number;
    message: string;
    fileDetails?: Array<{
        path: string;
        coverage: number;
        status: 'pass' | 'fail' | 'warning';
    }>;
}
export interface ReadableValidationResult {
    passed: boolean;
    eslintErrors: number;
    prettierErrors: number;
    message: string;
    errors?: Array<{
        file: string;
        line: number;
        column: number;
        rule: string;
        message: string;
        severity: 'error' | 'warning';
    }>;
}
export interface UnifiedValidationResult {
    passed: boolean;
    violations: number;
    message: string;
    details?: Array<{
        file: string;
        type: string;
        pattern: string;
        actual: string;
    }>;
}
export interface SecuredValidationResult {
    passed: boolean;
    secretsFound: number;
    message: string;
    details?: Array<{
        file: string;
        line: number;
        type: string;
        severity: 'error' | 'warning';
    }>;
}
export interface TrackableValidationResult {
    passed: boolean;
    missingTags: number;
    invalidChains: number;
    message: string;
    details?: Array<{
        file: string;
        type: string;
        id?: string;
        suggestion?: string;
    }>;
}
export interface TrustCheckerOptions {
    projectPath?: string;
    coverage?: {
        threshold?: number;
        minFileThreshold?: number;
    };
    eslint?: {
        enabled?: boolean;
        configPath?: string;
    };
    prettier?: {
        enabled?: boolean;
        configPath?: string;
    };
    reporters?: Array<'console' | 'json' | 'html'>;
    onlyValidators?: Array<'coverage' | 'readable' | 'unified' | 'secured' | 'trackable'>;
}
export declare class TrustChecker {
    private projectPath;
    private options;
    private coverageValidator;
    private readableValidator;
    private unifiedValidator;
    private securedValidator;
    private trackableValidator;
    private consoleReporter;
    private jsonReporter;
    private htmlReporter;
    constructor(projectPath?: string, options?: TrustCheckerOptions);
    check(): Promise<QualityCheckResult>;
    checkTests(): Promise<CoverageValidationResult>;
    checkReadable(): Promise<ReadableValidationResult>;
    checkUnified(): Promise<UnifiedValidationResult>;
    checkSecured(): Promise<SecuredValidationResult>;
    checkTrackable(): Promise<TrackableValidationResult>;
    fix(): Promise<{
        fixed: number;
        unfixable: number;
    }>;
    private report;
    private generateSummary;
    private createPassedCoverageResult;
    private createPassedReadableResult;
    private createPassedUnifiedResult;
    private createPassedSecuredResult;
    private createPassedTrackableResult;
}
//# sourceMappingURL=TrustChecker.d.ts.map