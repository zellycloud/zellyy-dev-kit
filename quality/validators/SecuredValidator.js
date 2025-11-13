"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecuredValidator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class SecuredValidator {
    projectPath;
    secretPatterns = [
        {
            type: 'API_KEY',
            pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/gi,
            severity: 'error',
        },
        {
            type: 'PASSWORD',
            pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi,
            severity: 'error',
        },
        {
            type: 'TOKEN',
            pattern: /(?:access_token|refresh_token|auth[_-]?token)\s*[:=]\s*['"][^'"]+['"]/gi,
            severity: 'error',
        },
        {
            type: 'PRIVATE_KEY',
            pattern: /(?:private[_-]?key|rsa[_-]?key)\s*[:=]\s*['"][^'"]+['"]/gi,
            severity: 'error',
        },
        {
            type: 'DATABASE_URL',
            pattern: /database[_-]?url\s*[:=]\s*['"][^'"]*(?:user|password)[^'"]*['"]/gi,
            severity: 'warning',
        },
        {
            type: 'AWS_KEY',
            pattern: /aws[_-]?(?:access[_-])?key(?:id)?\s*[:=]\s*['"][^'"]{20,}['"]/gi,
            severity: 'error',
        },
    ];
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    async validate() {
        try {
            const details = [];
            let secretsFound = 0;
            const filePatterns = ['src/**/*.ts', 'src/**/*.js', '*.json', '.env*'];
            const filesToCheck = new Set();
            for (const pattern of filePatterns) {
                const files = (0, glob_1.globSync)(pattern, {
                    cwd: this.projectPath,
                    ignore: ['node_modules/**', 'dist/**', 'coverage/**', '.git/**'],
                });
                files.forEach(f => filesToCheck.add(f));
            }
            for (const file of filesToCheck) {
                const filePath = path_1.default.join(this.projectPath, file);
                try {
                    const content = fs_1.default.readFileSync(filePath, 'utf-8');
                    const lines = content.split('\n');
                    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                        const line = lines[lineNum];
                        if (line.trim().startsWith('//') || line.includes('example') || line.includes('demo')) {
                            continue;
                        }
                        for (const secretPattern of this.secretPatterns) {
                            const matches = [...line.matchAll(secretPattern.pattern)];
                            for (const match of matches) {
                                secretsFound++;
                                details.push({
                                    file,
                                    line: lineNum + 1,
                                    type: secretPattern.type,
                                    severity: secretPattern.severity,
                                });
                            }
                        }
                    }
                }
                catch (error) {
                }
            }
            const passed = secretsFound === 0;
            return {
                passed,
                secretsFound,
                message: passed
                    ? '✅ 하드코딩된 시크릿 없음'
                    : `❌ ${secretsFound}개의 잠재적 시크릿 발견 (수동 검증 필요)`,
                details: details.length > 0 ? details.slice(0, 10) : undefined,
            };
        }
        catch (error) {
            return {
                passed: false,
                secretsFound: 0,
                message: `Secured 검증 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
}
exports.SecuredValidator = SecuredValidator;
//# sourceMappingURL=SecuredValidator.js.map