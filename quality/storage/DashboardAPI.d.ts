export interface DashboardConfig {
    dashboardUrl: string;
    apiKey: string;
    timeout?: number;
    retries?: number;
}
export interface MetricsPayload {
    projectId: string;
    metrics: {
        coveragePercent: number;
        eslintErrors: number;
        prettierErrors: number;
        secretsFound: number;
        specTrackingOk: boolean;
    };
    reportJson: string;
    timestamp: string;
    durationMs: number;
}
export interface ApiResponse {
    success: boolean;
    metricId?: string;
    message: string;
    error?: string;
}
export declare class DashboardAPI {
    private config;
    constructor(config: DashboardConfig);
    pushMetrics(payload: MetricsPayload): Promise<ApiResponse>;
    private callApi;
    private nodeFetch;
    private createTimeout;
    private sleep;
    testConnection(): Promise<boolean>;
}
export default DashboardAPI;
//# sourceMappingURL=DashboardAPI.d.ts.map