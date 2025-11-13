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
exports.JsonStorage = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
class JsonStorage {
    projectDir;
    metricsPath;
    coveragePath;
    lintErrorsPath;
    constructor(projectId) {
        this.projectDir = path_1.default.join(os_1.default.homedir(), '.zy', 'projects', projectId);
        this.metricsPath = path_1.default.join(this.projectDir, 'metrics.json');
        this.coveragePath = path_1.default.join(this.projectDir, 'coverage.json');
        this.lintErrorsPath = path_1.default.join(this.projectDir, 'lint-errors.json');
        if (!fs_1.default.existsSync(this.projectDir)) {
            fs_1.default.mkdirSync(this.projectDir, { recursive: true });
        }
        this.initializeFiles();
        console.log(`✅ JSON storage initialized: ${this.projectDir}`);
    }
    initializeFiles() {
        if (!fs_1.default.existsSync(this.metricsPath)) {
            fs_1.default.writeFileSync(this.metricsPath, JSON.stringify({ runs: [] }, null, 2));
        }
        if (!fs_1.default.existsSync(this.coveragePath)) {
            fs_1.default.writeFileSync(this.coveragePath, JSON.stringify({ reports: [] }, null, 2));
        }
        if (!fs_1.default.existsSync(this.lintErrorsPath)) {
            fs_1.default.writeFileSync(this.lintErrorsPath, JSON.stringify({ errors: [] }, null, 2));
        }
    }
    readJSON(filePath, defaultValue) {
        try {
            const data = fs_1.default.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.warn(`⚠️  Failed to read ${filePath}, using default:`, error);
            return defaultValue;
        }
    }
    writeJSON(filePath, data) {
        fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    async saveQualityRun(run) {
        try {
            const data = this.readJSON(this.metricsPath, { runs: [] });
            const maxId = data.runs.reduce((max, r) => Math.max(max, r.id || 0), 0);
            const newRun = {
                ...run,
                id: maxId + 1,
                created_at: run.created_at || new Date().toISOString(),
            };
            data.runs.push(newRun);
            this.writeJSON(this.metricsPath, data);
            return newRun;
        }
        catch (error) {
            console.error('❌ Failed to save quality run:', error);
            throw error;
        }
    }
    async getQualityRun(id) {
        try {
            const data = this.readJSON(this.metricsPath, { runs: [] });
            return data.runs.find((r) => r.id === id) || null;
        }
        catch (error) {
            console.error('❌ Failed to get quality run:', error);
            return null;
        }
    }
    async getAllQualityRuns(projectId, limit = 100) {
        try {
            const data = this.readJSON(this.metricsPath, { runs: [] });
            return data.runs
                .filter((r) => r.project_id === projectId)
                .sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            })
                .slice(0, limit);
        }
        catch (error) {
            console.error('❌ Failed to get quality runs:', error);
            return [];
        }
    }
    async saveCoverageReport(report) {
        try {
            const data = this.readJSON(this.coveragePath, { reports: [] });
            const maxId = data.reports.reduce((max, r) => Math.max(max, r.id || 0), 0);
            const newReport = {
                ...report,
                id: maxId + 1,
            };
            data.reports.push(newReport);
            this.writeJSON(this.coveragePath, data);
            return newReport;
        }
        catch (error) {
            console.error('❌ Failed to save coverage report:', error);
            throw error;
        }
    }
    async saveLintError(error) {
        try {
            const data = this.readJSON(this.lintErrorsPath, { errors: [] });
            const maxId = data.errors.reduce((max, e) => Math.max(max, e.id || 0), 0);
            const newError = {
                ...error,
                id: maxId + 1,
            };
            data.errors.push(newError);
            this.writeJSON(this.lintErrorsPath, data);
            return newError;
        }
        catch (error) {
            console.error('❌ Failed to save lint error:', error);
            throw error;
        }
    }
    async getCoverageReports(qualityRunId) {
        try {
            const data = this.readJSON(this.coveragePath, { reports: [] });
            return data.reports.filter((r) => r.quality_run_id === qualityRunId);
        }
        catch (error) {
            console.error('❌ Failed to get coverage reports:', error);
            return [];
        }
    }
    async getLintErrors(qualityRunId) {
        try {
            const data = this.readJSON(this.lintErrorsPath, { errors: [] });
            return data.errors.filter((e) => e.quality_run_id === qualityRunId);
        }
        catch (error) {
            console.error('❌ Failed to get lint errors:', error);
            return [];
        }
    }
    async deleteQualityRun(id) {
        try {
            const metricsData = this.readJSON(this.metricsPath, { runs: [] });
            const filteredRuns = metricsData.runs.filter((r) => r.id !== id);
            if (filteredRuns.length === metricsData.runs.length) {
                return false;
            }
            this.writeJSON(this.metricsPath, { runs: filteredRuns });
            const coverageData = this.readJSON(this.coveragePath, { reports: [] });
            this.writeJSON(this.coveragePath, {
                reports: coverageData.reports.filter((r) => r.quality_run_id !== id),
            });
            const lintData = this.readJSON(this.lintErrorsPath, { errors: [] });
            this.writeJSON(this.lintErrorsPath, {
                errors: lintData.errors.filter((e) => e.quality_run_id !== id),
            });
            return true;
        }
        catch (error) {
            console.error('❌ Failed to delete quality run:', error);
            return false;
        }
    }
    getDbPath() {
        return this.projectDir;
    }
    close() {
        console.log('✅ JSON storage closed (no cleanup needed)');
    }
    async getStats() {
        try {
            const data = this.readJSON(this.metricsPath, { runs: [] });
            const totalRuns = data.runs.length;
            const passedRuns = data.runs.filter((r) => r.status === 'passed').length;
            const failedRuns = data.runs.filter((r) => r.status === 'failed').length;
            const warningRuns = data.runs.filter((r) => r.status === 'warning').length;
            const coverages = data.runs
                .map((r) => r.coverage_percent || 0)
                .filter((c) => c > 0);
            const averageCoverage = coverages.length > 0
                ? coverages.reduce((sum, c) => sum + c, 0) / coverages.length
                : 0;
            return {
                totalRuns,
                passedRuns,
                failedRuns,
                warningRuns,
                averageCoverage,
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
            if (fs_1.default.existsSync(queuePath)) {
                try {
                    const data = fs_1.default.readFileSync(queuePath, 'utf-8');
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
            fs_1.default.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
            console.log(`💾 오프라인 큐에 저장됨: ${run.project_id} (${qualityRunId})`);
        }
        catch (error) {
            console.warn(`⚠️  오프라인 큐 저장 실패: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getPushQueue(projectId) {
        try {
            const queuePath = this.getQueuePath(projectId);
            if (!fs_1.default.existsSync(queuePath)) {
                return [];
            }
            const data = fs_1.default.readFileSync(queuePath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    async removePushQueueItem(projectId, qualityRunId) {
        try {
            const queuePath = this.getQueuePath(projectId);
            if (!fs_1.default.existsSync(queuePath)) {
                return;
            }
            const data = fs_1.default.readFileSync(queuePath, 'utf-8');
            let queue = JSON.parse(data);
            queue = queue.filter((item) => item.qualityRunId !== qualityRunId);
            fs_1.default.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
        }
        catch (error) {
            console.warn(`⚠️  오프라인 큐 항목 제거 실패: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getQueuePath(projectId) {
        const zyDir = path_1.default.join(os_1.default.homedir(), '.zy', 'projects', projectId);
        return path_1.default.join(zyDir, 'push-queue.json');
    }
}
exports.JsonStorage = JsonStorage;
exports.default = JsonStorage;
//# sourceMappingURL=json-storage.js.map