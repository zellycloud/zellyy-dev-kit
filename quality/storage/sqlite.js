"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteStorage = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const fs_2 = require("fs");
class SqliteStorage {
    db;
    dbPath;
    constructor(projectId) {
        const zyDir = path_1.default.join(os_1.default.homedir(), '.zy', 'projects', projectId);
        this.dbPath = path_1.default.join(zyDir, 'metrics.db');
        if (!fs_1.default.existsSync(zyDir)) {
            fs_1.default.mkdirSync(zyDir, { recursive: true });
        }
        try {
            this.db = new better_sqlite3_1.default(this.dbPath);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('busy_timeout = 5000');
            console.log(`✅ SQLite database initialized: ${this.dbPath}`);
            this.initializeSchema();
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }
    initializeSchema() {
        try {
            const schemaPath = path_1.default.join(__dirname, 'schema.sql');
            const schema = (0, fs_2.readFileSync)(schemaPath, 'utf-8');
            const statements = schema
                .split(';')
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && !s.startsWith('--'));
            for (const stmt of statements) {
                try {
                    this.db.exec(stmt);
                }
                catch (error) {
                    console.error(`❌ Failed to execute statement: ${error.message}`);
                    throw error;
                }
            }
        }
        catch (error) {
            console.error('❌ Failed to initialize database schema:', error);
            throw error;
        }
    }
    run(sql, params = []) {
        return Promise.resolve().then(() => {
            const stmt = this.db.prepare(sql);
            const result = stmt.run(...params);
            return {
                id: result.lastInsertRowid,
                changes: result.changes,
            };
        });
    }
    get(sql, params = []) {
        return Promise.resolve().then(() => {
            const stmt = this.db.prepare(sql);
            const row = stmt.get(...params);
            return row || null;
        });
    }
    all(sql, params = []) {
        return Promise.resolve().then(() => {
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(...params);
            return rows || [];
        });
    }
    async saveQualityRun(run) {
        try {
            const result = await this.run(`
        INSERT INTO quality_runs (
          run_id, project_id, status, coverage_percent, eslint_errors,
          prettier_errors, secrets_found, spec_tracking_ok, report_json, duration_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                run.run_id,
                run.project_id,
                run.status,
                run.coverage_percent ?? null,
                run.eslint_errors ?? 0,
                run.prettier_errors ?? 0,
                run.secrets_found ?? 0,
                run.spec_tracking_ok ?? true,
                run.report_json ?? null,
                run.duration_ms ?? null,
            ]);
            return {
                ...run,
                id: result.id,
            };
        }
        catch (error) {
            console.error('❌ Failed to save quality run:', error);
            throw error;
        }
    }
    async getQualityRun(id) {
        try {
            return await this.get('SELECT * FROM quality_runs WHERE id = ?', [id]);
        }
        catch (error) {
            console.error('❌ Failed to get quality run:', error);
            return null;
        }
    }
    async getAllQualityRuns(projectId, limit = 100) {
        try {
            return await this.all('SELECT * FROM quality_runs WHERE project_id = ? ORDER BY created_at DESC LIMIT ?', [projectId, limit]);
        }
        catch (error) {
            console.error('❌ Failed to get quality runs:', error);
            return [];
        }
    }
    async saveCoverageReport(report) {
        try {
            const result = await this.run(`
        INSERT INTO coverage_reports (
          quality_run_id, file_path, line_coverage, branch_coverage, function_coverage
        ) VALUES (?, ?, ?, ?, ?)
      `, [
                report.quality_run_id,
                report.file_path,
                report.line_coverage,
                report.branch_coverage,
                report.function_coverage,
            ]);
            return {
                ...report,
                id: result.id,
            };
        }
        catch (error) {
            console.error('❌ Failed to save coverage report:', error);
            throw error;
        }
    }
    async saveLintError(error) {
        try {
            const result = await this.run(`
        INSERT INTO lint_errors (
          quality_run_id, file_path, line_number, column_number, rule, message, severity
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
                error.quality_run_id,
                error.file_path,
                error.line_number,
                error.column_number,
                error.rule,
                error.message,
                error.severity,
            ]);
            return {
                ...error,
                id: result.id,
            };
        }
        catch (error) {
            console.error('❌ Failed to save lint error:', error);
            throw error;
        }
    }
    async getCoverageReports(qualityRunId) {
        try {
            return await this.all('SELECT * FROM coverage_reports WHERE quality_run_id = ?', [qualityRunId]);
        }
        catch (error) {
            console.error('❌ Failed to get coverage reports:', error);
            return [];
        }
    }
    async getLintErrors(qualityRunId) {
        try {
            return await this.all('SELECT * FROM lint_errors WHERE quality_run_id = ?', [qualityRunId]);
        }
        catch (error) {
            console.error('❌ Failed to get lint errors:', error);
            return [];
        }
    }
    async deleteQualityRun(id) {
        try {
            const result = await this.run('DELETE FROM quality_runs WHERE id = ?', [id]);
            return result.changes > 0;
        }
        catch (error) {
            console.error('❌ Failed to delete quality run:', error);
            return false;
        }
    }
    getDbPath() {
        return this.dbPath;
    }
    close() {
        try {
            this.db.close();
            console.log('✅ Database connection closed');
        }
        catch (err) {
            console.error('❌ Error closing database:', err);
        }
    }
    async getStats() {
        try {
            const result = await this.get(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warning,
          AVG(coverage_percent) as avg_coverage
        FROM quality_runs
      `);
            return {
                totalRuns: result?.total || 0,
                passedRuns: result?.passed || 0,
                failedRuns: result?.failed || 0,
                warningRuns: result?.warning || 0,
                averageCoverage: result?.avg_coverage || 0,
            };
        }
        catch (error) {
            console.error('❌ Failed to get stats:', error);
            return {
                totalRuns: 0,
                passedRuns: 0,
                failedRuns: 0,
                warningRuns: 0,
                averageCoverage: 0,
            };
        }
    }
    async pushToDashboard(dashboardUrl, apiKey, qualityRunId) {
        try {
            const run = await this.getQualityRun(qualityRunId);
            if (!run) {
                throw new Error(`Quality run not found: ${qualityRunId}`);
            }
            const coverageReports = await this.getCoverageReports(qualityRunId);
            const lintErrors = await this.getLintErrors(qualityRunId);
            const payload = {
                projectId: run.project_id,
                metrics: {
                    coveragePercent: run.coverage_percent || 0,
                    eslintErrors: run.eslint_errors || 0,
                    prettierErrors: run.prettier_errors || 0,
                    secretsFound: run.secrets_found || 0,
                    specTrackingOk: run.spec_tracking_ok ?? true,
                },
                reportJson: run.report_json || '{}',
                timestamp: run.created_at || new Date().toISOString(),
                durationMs: run.duration_ms || 0,
                metadata: {
                    coverageDetails: coverageReports,
                    lintDetails: lintErrors,
                    runId: run.run_id,
                },
            };
            const { DashboardAPI } = await Promise.resolve().then(() => __importStar(require('./DashboardAPI')));
            const api = new DashboardAPI({
                dashboardUrl,
                apiKey,
                timeout: 10000,
                retries: 3,
            });
            console.log(`\n📤 대시보드로 메트릭 푸시 중...`);
            console.log(`   프로젝트: ${run.project_id}`);
            console.log(`   커버리지: ${run.coverage_percent}%`);
            const response = await api.pushMetrics(payload);
            if (response.success) {
                console.log(`✅ 메트릭 푸시 성공`);
                if (response.metricId) {
                    console.log(`   메트릭 ID: ${response.metricId}`);
                }
            }
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ 메트릭 푸시 실패: ${errorMessage}`);
            throw error;
        }
    }
    async savePushQueue(qualityRunId) {
        try {
            const run = await this.getQualityRun(qualityRunId);
            if (!run) {
                throw new Error(`Quality run not found: ${qualityRunId}`);
            }
            const queuePath = this.getQueuePath(run.project_id);
            let queue = [];
            if (require('fs').existsSync(queuePath)) {
                try {
                    const data = require('fs').readFileSync(queuePath, 'utf-8');
                    queue = JSON.parse(data);
                }
                catch {
                    queue = [];
                }
            }
            queue.push({
                qualityRunId,
                timestamp: new Date().toISOString(),
                retries: 0,
            });
            require('fs').writeFileSync(queuePath, JSON.stringify(queue, null, 2));
            console.log(`💾 오프라인 큐에 저장됨: ${run.project_id} (${qualityRunId})`);
        }
        catch (error) {
            console.warn(`⚠️  오프라인 큐 저장 실패: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getPushQueue(projectId) {
        try {
            const queuePath = this.getQueuePath(projectId);
            if (!require('fs').existsSync(queuePath)) {
                return [];
            }
            const data = require('fs').readFileSync(queuePath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    async removePushQueueItem(projectId, qualityRunId) {
        try {
            const queuePath = this.getQueuePath(projectId);
            if (!require('fs').existsSync(queuePath)) {
                return;
            }
            const data = require('fs').readFileSync(queuePath, 'utf-8');
            let queue = JSON.parse(data);
            queue = queue.filter((item) => item.qualityRunId !== qualityRunId);
            require('fs').writeFileSync(queuePath, JSON.stringify(queue, null, 2));
        }
        catch (error) {
            console.warn(`⚠️  오프라인 큐 항목 제거 실패: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getQueuePath(projectId) {
        const path = require('path');
        const os = require('os');
        const zyDir = path.join(os.homedir(), '.zy', 'projects', projectId);
        return path.join(zyDir, 'push-queue.json');
    }
}
exports.SqliteStorage = SqliteStorage;
exports.default = SqliteStorage;
//# sourceMappingURL=sqlite.js.map