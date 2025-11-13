import Database from 'better-sqlite3';
export interface PerformanceMetrics {
    queryName: string;
    executionTime: number;
    rowsAffected: number;
    timestamp: number;
}
export interface IndexInfo {
    name: string;
    table: string;
    columns: string[];
    isUnique: boolean;
}
export interface DatabaseStats {
    fileSizeKb: number;
    pageCount: number;
    pageSize: number;
    freePageCount: number;
    tableCount: number;
    indexCount: number;
    walEnabled: boolean;
    autoVacuumEnabled: boolean;
}
export declare class SQLitePerformanceOptimizer {
    private db;
    private metrics;
    constructor(db: Database.Database);
    collectMetrics(queryName: string, executionTime: number, rowsAffected?: number): void;
    benchmarkQuery(queryName: string, query: string | Database.Statement, iterations?: number): {
        avgTime: number;
        minTime: number;
        maxTime: number;
    };
    getIndexInfo(): IndexInfo[];
    recommendIndexes(): string[];
    optimizeIndexes(): void;
    getStats(): DatabaseStats;
    vacuum(): void;
    enableWalMode(): void;
    enableAutoVacuum(): void;
    backup(backupPath: string): void;
    getMetricsReport(): {
        totalQueries: number;
        avgExecutionTime: number;
        slowestQuery: PerformanceMetrics | null;
        fastestQuery: PerformanceMetrics | null;
    };
    getOptimizationRecommendations(): string[];
    printReport(): void;
}
export default SQLitePerformanceOptimizer;
//# sourceMappingURL=performance.d.ts.map