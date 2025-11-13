"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadableValidator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
class ReadableValidator {
    projectPath;
    config;
    constructor(projectPath, config = {}) {
        this.projectPath = projectPath;
        this.config = {
            eslint: { enabled: true, ...config.eslint },
            prettier: { enabled: true, ...config.prettier },
            ...config,
        };
    }
    async validate() {
        try {
            let eslintErrors = 0;
            let prettierErrors = 0;
            const errors = [];
            if (this.config.eslint?.enabled !== false) {
                const eslintResult = this.runESLint();
                eslintErrors = eslintResult.errorCount;
                errors.push(...eslintResult.errors);
            }
            if (this.config.prettier?.enabled !== false) {
                const prettierResult = this.checkPrettier();
                prettierErrors = prettierResult.fileCount;
                errors.push(...prettierResult.errors);
            }
            const passed = eslintErrors === 0 && prettierErrors === 0;
            return {
                passed,
                eslintErrors,
                prettierErrors,
                message: passed
                    ? '✅ ESLint과 Prettier 모두 통과'
                    : `❌ ESLint ${eslintErrors}개 오류, Prettier ${prettierErrors}개 파일`,
                errors: errors.length > 0 ? errors : undefined,
            };
        }
        catch (error) {
            return {
                passed: false,
                eslintErrors: 0,
                prettierErrors: 0,
                message: `Readable 검증 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    runESLint() {
        const eslintPath = path_1.default.join(this.projectPath, 'node_modules/.bin/eslint');
        if (!fs_1.default.existsSync(eslintPath)) {
            return { errorCount: 0, errors: [] };
        }
        try {
            const output = (0, child_process_1.execSync)(`${eslintPath} src/**/*.ts --format=json`, {
                cwd: this.projectPath,
                stdio: 'pipe',
                encoding: 'utf-8',
            });
            const results = JSON.parse(output);
            let totalErrors = 0;
            const errors = [];
            for (const file of results) {
                for (const message of file.messages) {
                    totalErrors++;
                    errors.push({
                        file: file.filePath,
                        line: message.line,
                        column: message.column,
                        rule: message.ruleId || 'unknown',
                        message: message.message,
                        severity: message.severity === 2 ? 'error' : 'warning',
                    });
                }
            }
            return { errorCount: totalErrors, errors };
        }
        catch (error) {
            return { errorCount: 0, errors: [] };
        }
    }
    checkPrettier() {
        const prettierPath = path_1.default.join(this.projectPath, 'node_modules/.bin/prettier');
        if (!fs_1.default.existsSync(prettierPath)) {
            return { fileCount: 0, errors: [] };
        }
        try {
            const output = (0, child_process_1.execSync)(`${prettierPath} src/**/*.ts --check --list-different`, {
                cwd: this.projectPath,
                stdio: 'pipe',
                encoding: 'utf-8',
            });
            const files = output
                .trim()
                .split('\n')
                .filter(f => f.length > 0);
            const errors = files.map(filePath => ({
                file: filePath,
                line: 1,
                column: 1,
                rule: 'prettier/prettier',
                message: 'File is not formatted according to prettier rules',
                severity: 'warning',
            }));
            return { fileCount: files.length, errors };
        }
        catch (error) {
            if (error.stdout) {
                const files = error.stdout.toString().trim().split('\n').filter((f) => f.length > 0);
                return { fileCount: files.length, errors: [] };
            }
            return { fileCount: 0, errors: [] };
        }
    }
    async autoFix() {
        const prettierPath = path_1.default.join(this.projectPath, 'node_modules/.bin/prettier');
        if (!fs_1.default.existsSync(prettierPath)) {
            return 0;
        }
        try {
            (0, child_process_1.execSync)(`${prettierPath} src/**/*.ts --write`, {
                cwd: this.projectPath,
                stdio: 'pipe',
            });
            return 1;
        }
        catch (error) {
            return 0;
        }
    }
}
exports.ReadableValidator = ReadableValidator;
//# sourceMappingURL=ReadableValidator.js.map