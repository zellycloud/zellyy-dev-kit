import { JsonStorage } from './json-storage';
export declare const STORAGE_PATHS: {
    ZY_HOME: string;
    PROJECTS_DIR: string;
    LOGS_DIR: string;
    CACHE_DIR: string;
    CONFIG_FILE: string;
};
export declare function getProjectMetricsPath(projectId: string): string;
export declare function getProjectCoveragePath(projectId: string): string;
export declare function getProjectLintErrorsPath(projectId: string): string;
export declare function getProjectStoragePath(projectId: string): string;
export declare function getProjectLogsPath(projectId: string): string;
export declare function getProjectPushQueuePath(projectId: string): string;
export declare function createJsonStorage(projectId: string): JsonStorage;
export { JsonStorage, type QualityRun, type CoverageReport, type LintError } from './json-storage';
export { JsonStorage as SqliteStorage } from './json-storage';
export declare const createSqliteStorage: typeof createJsonStorage;
declare const _default: {
    STORAGE_PATHS: {
        ZY_HOME: string;
        PROJECTS_DIR: string;
        LOGS_DIR: string;
        CACHE_DIR: string;
        CONFIG_FILE: string;
    };
    getProjectMetricsPath: typeof getProjectMetricsPath;
    getProjectCoveragePath: typeof getProjectCoveragePath;
    getProjectLintErrorsPath: typeof getProjectLintErrorsPath;
    getProjectStoragePath: typeof getProjectStoragePath;
    getProjectLogsPath: typeof getProjectLogsPath;
    getProjectPushQueuePath: typeof getProjectPushQueuePath;
    createJsonStorage: typeof createJsonStorage;
    createSqliteStorage: typeof createJsonStorage;
};
export default _default;
//# sourceMappingURL=index.d.ts.map