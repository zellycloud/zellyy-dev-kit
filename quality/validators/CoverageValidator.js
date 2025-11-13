"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageValidator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
class CoverageValidator {
    projectPath;
    config;
    constructor(projectPath, config = {}) {
        this.projectPath = projectPath;
        this.config = {
            threshold: config.threshold || 80,
            minFileThreshold: config.minFileThreshold || 70,
        };
    }
    async validate() {
        try {
            const coverageData = await this.runCoverageTest();
            if (!coverageData) {
                return {
                    passed: false,
                    percentage: 0,
                    threshold: this.config.threshold,
                    message: '커버리지 데이터를 찾을 수 없습니다. npm run test:coverage를 실행하세요.',
                };
            }
            const linesCoverage = coverageData.lines.percentage;
            const threshold = this.config.threshold;
            const passed = linesCoverage >= threshold;
            const fileDetails = this.analyzeFileDetails(coverageData.files);
            return {
                passed,
                percentage: linesCoverage,
                threshold,
                message: passed
                    ? `✅ 커버리지 ${linesCoverage}% >= 목표 ${threshold}%`
                    : `❌ 커버리지 ${linesCoverage}% < 목표 ${threshold}% (${threshold - linesCoverage}% 부족)`,
                fileDetails,
            };
        }
        catch (error) {
            return {
                passed: false,
                percentage: 0,
                threshold: this.config.threshold,
                message: `커버리지 검증 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    async runCoverageTest() {
        try {
            const coverageDir = path_1.default.join(this.projectPath, 'coverage');
            const coverageJsonPath = path_1.default.join(coverageDir, 'coverage-final.json');
            const vitestPath = path_1.default.join(this.projectPath, 'node_modules/.bin/vitest');
            if (!fs_1.default.existsSync(vitestPath)) {
                return null;
            }
            if (fs_1.default.existsSync(coverageJsonPath)) {
                const stats = fs_1.default.statSync(coverageJsonPath);
                const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;
                if (ageMinutes < 5) {
                    console.log(`✅ 기존 coverage 데이터 재사용 (${Math.round(ageMinutes)}분 전 생성)`);
                    const coverageJson = JSON.parse(fs_1.default.readFileSync(coverageJsonPath, 'utf-8'));
                    return this.calculateCoverage(coverageJson);
                }
            }
            const testFiles = this.countTestFiles();
            console.log(`📊 프로젝트 크기: ${testFiles}개 테스트 파일`);
            let maxWorkers = 4;
            let timeout = 300000;
            if (testFiles > 100) {
                console.log(`⚠️  대규모 프로젝트 감지 (${testFiles}개 파일)`);
                console.log(`   안전장치 활성화: 워커 수 제한 (2개), 타임아웃 연장 (10분)`);
                maxWorkers = 2;
                timeout = 600000;
            }
            try {
                const command = `npm run test:coverage -- --run --maxWorkers=${maxWorkers}`;
                console.log(`🔍 Coverage 생성 중... (최대 ${timeout / 60000}분)`);
                (0, child_process_1.execSync)(command, {
                    cwd: this.projectPath,
                    stdio: 'pipe',
                    timeout: timeout,
                    maxBuffer: 50 * 1024 * 1024,
                    killSignal: 'SIGKILL',
                });
                console.log(`✅ Coverage 생성 완료`);
            }
            catch (e) {
                if (e.killed) {
                    console.error(`❌ Coverage 생성 타임아웃 (${timeout / 60000}분 초과)`);
                    console.error(`   프로젝트가 너무 큽니다. 수동으로 'npm run test:coverage'를 실행하세요.`);
                    return null;
                }
            }
            if (!fs_1.default.existsSync(coverageJsonPath)) {
                console.error(`❌ coverage-final.json을 찾을 수 없습니다.`);
                console.error(`   'npm run test:coverage'를 먼저 실행하세요.`);
                return null;
            }
            const coverageJson = JSON.parse(fs_1.default.readFileSync(coverageJsonPath, 'utf-8'));
            return this.calculateCoverage(coverageJson);
        }
        catch (error) {
            console.error(`❌ Coverage 검증 오류:`, error instanceof Error ? error.message : String(error));
            return null;
        }
    }
    countTestFiles() {
        try {
            const { execSync } = require('child_process');
            const result = execSync('find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | wc -l', {
                cwd: this.projectPath,
                stdio: 'pipe',
                encoding: 'utf-8',
            });
            return parseInt(result.trim()) || 0;
        }
        catch {
            return 0;
        }
    }
    calculateCoverage(coverageJson) {
        const filesList = Object.entries(coverageJson);
        let totalLines = 0;
        let coveredLines = 0;
        let totalStatements = 0;
        let coveredStatements = 0;
        let totalFunctions = 0;
        let coveredFunctions = 0;
        let totalBranches = 0;
        let coveredBranches = 0;
        const files = {};
        for (const [filePath, coverage] of filesList) {
            const fileData = coverage;
            const lineData = fileData.l || {};
            const fnData = fileData.f || {};
            const branchData = fileData.b || {};
            const statementData = fileData.s || {};
            const fileTotalLines = Object.keys(lineData).length;
            const fileCoveredLines = Object.values(lineData).filter((v) => v > 0).length;
            const fileTotalFns = Object.keys(fnData).length;
            const fileCoveredFns = Object.values(fnData).filter((v) => v > 0).length;
            const fileTotalBranches = Object.keys(branchData).length;
            const fileCoveredBranches = Object.values(branchData).filter((v) => v.some(b => b > 0))
                .length;
            const fileTotalStatements = Object.keys(statementData).length;
            const fileCoveredStatements = Object.values(statementData).filter((v) => v > 0).length;
            totalLines += fileTotalLines;
            coveredLines += fileCoveredLines;
            totalStatements += fileTotalStatements;
            coveredStatements += fileCoveredStatements;
            totalFunctions += fileTotalFns;
            coveredFunctions += fileCoveredFns;
            totalBranches += fileTotalBranches;
            coveredBranches += fileCoveredBranches;
            files[filePath] = {
                lines: { total: fileTotalLines, covered: fileCoveredLines, percentage: fileTotalLines > 0 ? (fileCoveredLines / fileTotalLines) * 100 : 100 },
                statements: { total: fileTotalStatements, covered: fileCoveredStatements, percentage: fileTotalStatements > 0 ? (fileCoveredStatements / fileTotalStatements) * 100 : 100 },
                functions: { total: fileTotalFns, covered: fileCoveredFns, percentage: fileTotalFns > 0 ? (fileCoveredFns / fileTotalFns) * 100 : 100 },
                branches: { total: fileTotalBranches, covered: fileCoveredBranches, percentage: fileTotalBranches > 0 ? (fileCoveredBranches / fileTotalBranches) * 100 : 100 },
            };
        }
        return {
            lines: { total: totalLines, covered: coveredLines, percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 100 },
            statements: { total: totalStatements, covered: coveredStatements, percentage: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 100 },
            functions: { total: totalFunctions, covered: coveredFunctions, percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 100 },
            branches: { total: totalBranches, covered: coveredBranches, percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 100 },
            files,
        };
    }
    analyzeFileDetails(files) {
        const minFileThreshold = this.config.minFileThreshold || 70;
        const details = [];
        for (const [filePath, coverage] of Object.entries(files)) {
            const percentage = coverage.lines.percentage;
            const status = percentage >= 100 ? 'pass' : percentage >= minFileThreshold ? 'warning' : 'fail';
            details.push({
                path: filePath,
                coverage: Math.round(percentage * 100) / 100,
                status,
            });
        }
        return details.sort((a, b) => a.coverage - b.coverage).slice(0, 10);
    }
    async autoFix() {
        return 0;
    }
}
exports.CoverageValidator = CoverageValidator;
//# sourceMappingURL=CoverageValidator.js.map