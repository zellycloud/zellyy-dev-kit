"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONReporter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class JSONReporter {
    async write(result, filePath) {
        try {
            const dir = path_1.default.dirname(filePath);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            const output = {
                status: result.status,
                timestamp: result.timestamp,
                durationMs: result.durationMs,
                score: result.score,
                summary: result.summary,
                trust5: {
                    tests: {
                        passed: result.coverage.passed,
                        percentage: result.coverage.percentage,
                        threshold: result.coverage.threshold,
                        message: result.coverage.message,
                    },
                    readable: {
                        passed: result.readable.passed,
                        eslintErrors: result.readable.eslintErrors,
                        prettierErrors: result.readable.prettierErrors,
                        message: result.readable.message,
                    },
                    unified: {
                        passed: result.unified.passed,
                        violations: result.unified.violations,
                        message: result.unified.message,
                    },
                    secured: {
                        passed: result.secured.passed,
                        secretsFound: result.secured.secretsFound,
                        message: result.secured.message,
                    },
                    trackable: {
                        passed: result.trackable.passed,
                        missingTags: result.trackable.missingTags,
                        invalidChains: result.trackable.invalidChains,
                        message: result.trackable.message,
                    },
                },
                details: {
                    coverage: result.coverage.fileDetails?.slice(0, 20),
                    readable: result.readable.errors?.slice(0, 20),
                    unified: result.unified.details?.slice(0, 20),
                    secured: result.secured.details?.slice(0, 20),
                    trackable: result.trackable.details?.slice(0, 20),
                },
            };
            fs_1.default.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
            console.log(`\n✅ Quality report saved: ${filePath}`);
        }
        catch (error) {
            console.error(`Error writing JSON report: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.JSONReporter = JSONReporter;
//# sourceMappingURL=JSONReporter.js.map