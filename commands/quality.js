"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerQualityCommands = registerQualityCommands;
const path_1 = __importDefault(require("path"));
const TrustChecker_1 = require("../quality/TrustChecker");
const storage_1 = require("../quality/storage");
function registerQualityCommands(program) {
    program
        .command('quality:check')
        .description('TRUST 5 원칙에 따른 품질 게이트를 검사합니다')
        .option('--only <validators>', 'comma-separated list of validators to run (coverage,readable,unified,secured,trackable)')
        .option('-v, --verbose', '상세 출력')
        .option('--json', 'JSON 형식 출력')
        .option('--save-to-db', 'SQLite에 결과 저장 (로컬 메트릭)')
        .option('--push-to-dashboard', '메트릭을 대시보드로 푸시 (선택사항, --save-to-db 필수)')
        .option('--dashboard-url <url>', '대시보드 URL (예: https://dashboard.example.com)')
        .option('--dashboard-api-key <key>', '대시보드 API Key (환경변수: ZY_DASHBOARD_API_KEY)')
        .action(async (options) => {
        try {
            const projectPath = process.cwd();
            const onlyValidators = options.only
                ? options.only.split(',').map((v) => v.trim())
                : undefined;
            const checker = new TrustChecker_1.TrustChecker(projectPath, {
                onlyValidators,
                reporters: options.json ? ['json'] : ['console'],
            });
            const result = await checker.check();
            let qualityRunId = null;
            if (options.saveToDb || process.env.ZY_PROJECT_ID) {
                try {
                    const projectId = process.env.ZY_PROJECT_ID || path_1.default.basename(projectPath);
                    const storage = (0, storage_1.createSqliteStorage)(projectId);
                    const runId = `run-${Date.now()}`;
                    const savedRun = await storage.saveQualityRun({
                        run_id: runId,
                        project_id: projectId,
                        status: result.status,
                        coverage_percent: result.coverage.percentage,
                        eslint_errors: result.readable.eslintErrors,
                        prettier_errors: result.readable.prettierErrors,
                        secrets_found: result.secured.secretsFound,
                        spec_tracking_ok: result.trackable.passed,
                        report_json: JSON.stringify(result),
                        duration_ms: result.durationMs,
                    });
                    qualityRunId = savedRun.id || null;
                    console.log(`\n💾 Quality 검사 결과를 로컬 저장소에 저장했습니다: ${projectId}`);
                    if (options.pushToDashboard && qualityRunId) {
                        try {
                            const dashboardUrl = options.dashboardUrl || process.env.ZY_DASHBOARD_URL;
                            const apiKey = options.dashboardApiKey || process.env.ZY_DASHBOARD_API_KEY;
                            if (!dashboardUrl || !apiKey) {
                                console.warn(`⚠️  대시보드 푸시 건너뜀: --dashboard-url과 --dashboard-api-key 필수`);
                                console.warn(`   또는 환경변수 설정: ZY_DASHBOARD_URL, ZY_DASHBOARD_API_KEY`);
                            }
                            else {
                                try {
                                    const response = await storage.pushToDashboard(dashboardUrl, apiKey, qualityRunId);
                                    if (response.success) {
                                        console.log(`✅ 대시보드에 메트릭 푸시 성공`);
                                    }
                                    else {
                                        console.warn(`⚠️  대시보드 푸시 실패: ${response.message}`);
                                        await storage.savePushQueue(qualityRunId);
                                        console.log(`💾 오프라인 큐에 저장됨. 나중에 재시도됩니다.`);
                                    }
                                }
                                catch (pushError) {
                                    console.warn(`⚠️  대시보드 푸시 오류: ${pushError instanceof Error ? pushError.message : String(pushError)}`);
                                    await storage.savePushQueue(qualityRunId);
                                    console.log(`💾 오프라인 큐에 저장됨. 네트워크 복구 시 자동 재시도됩니다.`);
                                }
                            }
                        }
                        catch (queueError) {
                            console.warn(`⚠️  대시보드 푸시 중 오류: ${queueError instanceof Error ? queueError.message : String(queueError)}`);
                        }
                    }
                    storage.close();
                }
                catch (storageError) {
                    console.warn(`⚠️  저장소 저장 실패: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
                }
            }
            if (result.status !== 'passed') {
                process.exit(1);
            }
        }
        catch (error) {
            console.error('❌ Quality check 중 오류 발생:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });
    program
        .command('quality:fix')
        .description('자동으로 수정 가능한 코드 스타일 문제를 수정합니다')
        .action(async () => {
        try {
            const projectPath = process.cwd();
            const checker = new TrustChecker_1.TrustChecker(projectPath);
            console.log('🔧 자동 수정 시작...\n');
            const { fixed, unfixable } = await checker.fix();
            console.log(`\n✅ ${fixed}개 문제 자동 수정 완료`);
            if (unfixable > 0) {
                console.log(`⚠️ ${unfixable}개 문제는 수동 수정 필요`);
            }
            const result = await checker.check();
            if (result.status !== 'passed') {
                process.exit(1);
            }
        }
        catch (error) {
            console.error('❌ Quality fix 중 오류 발생:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });
    program
        .command('quality:report')
        .description('품질 검사 결과를 리포트로 생성합니다')
        .option('--format <type>', 'report format (console, json, html)', 'html')
        .option('-o, --output <path>', 'output file path')
        .action(async (options) => {
        try {
            const projectPath = process.cwd();
            const format = options.format || 'html';
            const outputPath = options.output ||
                path_1.default.join(projectPath, format === 'json' ? 'quality-report.json' : `quality-report.${format}`);
            const checker = new TrustChecker_1.TrustChecker(projectPath, {
                reporters: [format],
            });
            const result = await checker.check();
            console.log(`\n📄 Quality report generated: ${outputPath}`);
            if (result.status !== 'passed') {
                process.exit(1);
            }
        }
        catch (error) {
            console.error('❌ Quality report 생성 중 오류 발생:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });
}
//# sourceMappingURL=quality.js.map