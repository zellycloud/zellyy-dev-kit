"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLitePerformanceOptimizer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class SQLitePerformanceOptimizer {
    db;
    metrics = [];
    constructor(db) {
        this.db = db;
    }
    collectMetrics(queryName, executionTime, rowsAffected = 0) {
        this.metrics.push({
            queryName,
            executionTime,
            rowsAffected,
            timestamp: Date.now(),
        });
    }
    benchmarkQuery(queryName, query, iterations = 5) {
        const times = [];
        for (let i = 0; i < iterations; i++) {
            const start = Date.now();
            try {
                if (typeof query === 'string') {
                    this.db.prepare(query).all();
                }
                else {
                    query.all();
                }
            }
            catch (e) {
            }
            const elapsed = Date.now() - start;
            times.push(elapsed);
        }
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        this.collectMetrics(queryName, avgTime);
        return { avgTime, minTime, maxTime };
    }
    getIndexInfo() {
        const indexQuery = `
      SELECT
        m.name,
        m.tbl_name as table_name,
        GROUP_CONCAT(p.name, ', ') as columns,
        m.unique
      FROM sqlite_master m
      LEFT JOIN pragma_index_info(m.name) p ON m.name = p.name
      WHERE m.type = 'index'
      GROUP BY m.name
    `;
        try {
            const indexes = this.db.prepare(indexQuery).all();
            return indexes.map(idx => ({
                name: idx.name,
                table: idx.table_name,
                columns: idx.columns ? idx.columns.split(', ') : [],
                isUnique: idx.unique === 1,
            }));
        }
        catch (e) {
            return [];
        }
    }
    recommendIndexes() {
        const recommendations = [];
        const existingIndexes = new Set(this.getIndexInfo().flatMap(idx => idx.columns));
        const qualityIndexes = [
            { table: 'quality_runs', column: 'project_id' },
            { table: 'quality_runs', column: 'run_id' },
            { table: 'quality_runs', column: 'created_at' },
        ];
        for (const idx of qualityIndexes) {
            if (!existingIndexes.has(idx.column)) {
                recommendations.push(`CREATE INDEX IF NOT EXISTS idx_${idx.table}_${idx.column} ON ${idx.table}(${idx.column});`);
            }
        }
        return recommendations;
    }
    optimizeIndexes() {
        this.db.prepare('ANALYZE').run();
        const recommendations = this.recommendIndexes();
        for (const sql of recommendations) {
            try {
                this.db.prepare(sql).run();
            }
            catch (e) {
            }
        }
    }
    getStats() {
        const pageCount = this.db.prepare('PRAGMA page_count').get().page_count;
        const pageSize = this.db.prepare('PRAGMA page_size').get().page_size;
        const freePageCount = this.db.prepare('PRAGMA freelist_count').get().freelist_count;
        const tableCount = this.db
            .prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'")
            .get().count;
        const indexCount = this.db
            .prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='index'")
            .get().count;
        const walInfo = this.db.pragma('journal_mode');
        const autoVacuum = this.db.prepare('PRAGMA auto_vacuum').get().auto_vacuum;
        const fileSizeKb = (pageCount * pageSize) / 1024;
        return {
            fileSizeKb,
            pageCount,
            pageSize,
            freePageCount,
            tableCount,
            indexCount,
            walEnabled: walInfo === 'wal',
            autoVacuumEnabled: autoVacuum !== 0,
        };
    }
    vacuum() {
        this.db.prepare('VACUUM').run();
    }
    enableWalMode() {
        try {
            this.db.pragma('journal_mode = WAL');
        }
        catch (e) {
        }
    }
    enableAutoVacuum() {
        try {
            this.db.prepare('PRAGMA auto_vacuum = FULL').run();
        }
        catch (e) {
        }
    }
    backup(backupPath) {
        const dbPath = this.db.name;
        const backupDir = path_1.default.dirname(backupPath);
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        fs_1.default.copyFileSync(dbPath, backupPath);
        const walFile = dbPath + '-wal';
        const shmFile = dbPath + '-shm';
        if (fs_1.default.existsSync(walFile)) {
            fs_1.default.copyFileSync(walFile, backupPath + '-wal');
        }
        if (fs_1.default.existsSync(shmFile)) {
            fs_1.default.copyFileSync(shmFile, backupPath + '-shm');
        }
    }
    getMetricsReport() {
        if (this.metrics.length === 0) {
            return {
                totalQueries: 0,
                avgExecutionTime: 0,
                slowestQuery: null,
                fastestQuery: null,
            };
        }
        const avgExecutionTime = this.metrics.reduce((sum, m) => sum + m.executionTime, 0) /
            this.metrics.length;
        const slowestQuery = this.metrics.reduce((prev, current) => prev.executionTime > current.executionTime ? prev : current);
        const fastestQuery = this.metrics.reduce((prev, current) => prev.executionTime < current.executionTime ? prev : current);
        return {
            totalQueries: this.metrics.length,
            avgExecutionTime,
            slowestQuery,
            fastestQuery,
        };
    }
    getOptimizationRecommendations() {
        const recommendations = [];
        const stats = this.getStats();
        const metrics = this.getMetricsReport();
        if (stats.fileSizeKb > 10240) {
            recommendations.push('큰 데이터베이스 파일 (>10MB). VACUUM 실행을 권장합니다.');
        }
        if (!stats.walEnabled) {
            recommendations.push('WAL 모드를 활성화하면 동시성과 성능이 향상됩니다.');
        }
        if (this.recommendIndexes().length > 0) {
            recommendations.push(`${this.recommendIndexes().length}개의 추천 인덱스가 있습니다. optimizeIndexes() 실행을 권장합니다.`);
        }
        if (metrics.avgExecutionTime > 50) {
            recommendations.push(`평균 쿼리 실행 시간이 50ms를 초과합니다. (${metrics.avgExecutionTime.toFixed(2)}ms)`);
        }
        if (stats.freePageCount > stats.pageCount * 0.1) {
            recommendations.push('여유 공간이 10% 이상입니다. VACUUM으로 정리를 권장합니다.');
        }
        if (recommendations.length === 0) {
            recommendations.push('최적화 권장사항 없음 - 현재 상태가 양호합니다.');
        }
        return recommendations;
    }
    printReport() {
        const stats = this.getStats();
        const metrics = this.getMetricsReport();
        const recommendations = this.getOptimizationRecommendations();
        console.log('\n📊 SQLite 성능 리포트');
        console.log('='.repeat(50));
        console.log('\n📈 데이터베이스 통계:');
        console.log(`  파일 크기: ${stats.fileSizeKb.toFixed(2)} KB`);
        console.log(`  페이지 수: ${stats.pageCount}`);
        console.log(`  여유 페이지: ${stats.freePageCount}`);
        console.log(`  테이블 수: ${stats.tableCount}`);
        console.log(`  인덱스 수: ${stats.indexCount}`);
        console.log(`  WAL 모드: ${stats.walEnabled ? '✅ 활성화' : '❌ 비활성화'}`);
        console.log(`  Auto-VACUUM: ${stats.autoVacuumEnabled ? '✅ 활성화' : '❌ 비활성화'}`);
        console.log('\n⏱️  쿼리 성능:');
        console.log(`  총 쿼리 수: ${metrics.totalQueries}`);
        console.log(`  평균 실행 시간: ${metrics.avgExecutionTime.toFixed(2)}ms`);
        if (metrics.slowestQuery) {
            console.log(`  가장 느린 쿼리: ${metrics.slowestQuery.queryName} (${metrics.slowestQuery.executionTime.toFixed(2)}ms)`);
        }
        if (metrics.fastestQuery) {
            console.log(`  가장 빠른 쿼리: ${metrics.fastestQuery.queryName} (${metrics.fastestQuery.executionTime.toFixed(2)}ms)`);
        }
        console.log('\n💡 최적화 권장사항:');
        for (const rec of recommendations) {
            console.log(`  - ${rec}`);
        }
        console.log('\n' + '='.repeat(50));
    }
}
exports.SQLitePerformanceOptimizer = SQLitePerformanceOptimizer;
exports.default = SQLitePerformanceOptimizer;
//# sourceMappingURL=performance.js.map