export interface QualityRun {
    id?: number;
    run_id: string;
    project_id: string;
    status: 'passed' | 'failed' | 'warning';
    coverage_percent?: number;
    eslint_errors?: number;
    prettier_errors?: number;
    secrets_found?: number;
    spec_tracking_ok?: boolean;
    report_json?: string;
    created_at?: string;
    duration_ms?: number;
}
export interface CoverageReport {
    id?: number;
    quality_run_id: number;
    file_path: string;
    line_coverage: number;
    branch_coverage: number;
    function_coverage: number;
}
export interface LintError {
    id?: number;
    quality_run_id: number;
    file_path: string;
    line_number: number;
    column_number: number;
    rule: string;
    message: string;
    severity: 'error' | 'warning';
}
export declare class JsonStorage {
    private projectDir;
    private metricsPath;
    private coveragePath;
    private lintErrorsPath;
    constructor(projectId: string);
    private initializeFiles;
    private readJSON;
    private writeJSON;
    saveQualityRun(run: QualityRun): Promise<QualityRun>;
    getQualityRun(id: number): Promise<QualityRun | null>;
    getAllQualityRuns(projectId: string, limit?: number): Promise<QualityRun[]>;
    saveCoverageReport(report: CoverageReport): Promise<CoverageReport>;
    saveLintError(error: LintError): Promise<LintError>;
    getCoverageReports(qualityRunId: number): Promise<CoverageReport[]>;
    getLintErrors(qualityRunId: number): Promise<LintError[]>;
    deleteQualityRun(id: number): Promise<boolean>;
    getDbPath(): string;
    close(): void;
    getStats(): Promise<{
        totalRuns: number;
        passedRuns: number;
        failedRuns: number;
        warningRuns: number;
        averageCoverage: number;
    }>;
    pushToDashboard(dashboardUrl: string, apiKey: string, qualityRunId: number): Promise<{
        success: boolean;
        metricId?: string;
        message: string;
    }>;
    savePushQueue(qualityRunId: number): Promise<void>;
    getPushQueue(projectId: string): Promise<any[]>;
    removePushQueueItem(projectId: string, qualityRunId: number): Promise<void>;
    private getQueuePath;
}
export default JsonStorage;
//# sourceMappingURL=json-storage.d.ts.map