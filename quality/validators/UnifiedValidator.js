"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedValidator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class UnifiedValidator {
    projectPath;
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    async validate() {
        try {
            const violations = [];
            const tsFiles = (0, glob_1.globSync)('src/**/*.ts', { cwd: this.projectPath });
            for (const file of tsFiles) {
                const content = fs_1.default.readFileSync(path_1.default.join(this.projectPath, file), 'utf-8');
                const classMatches = content.matchAll(/class\s+(\w+)/g);
                for (const match of classMatches) {
                    const name = match[1];
                    if (!this.isPascalCase(name)) {
                        violations.push({
                            file,
                            type: 'PascalCase',
                            pattern: 'class',
                            actual: name,
                        });
                    }
                }
                const funcMatches = content.matchAll(/(?:function|const|let|var)\s+(\w+)/g);
                for (const match of funcMatches) {
                    const name = match[1];
                    if (!this.isCamelCase(name) && !this.isUpperSnakeCase(name)) {
                        violations.push({
                            file,
                            type: 'camelCase or UPPER_SNAKE_CASE',
                            pattern: 'function/const/let/var',
                            actual: name,
                        });
                    }
                }
                const fileName = path_1.default.basename(file, '.ts');
                if (!this.isKebabCase(fileName) && !this.isPascalCase(fileName)) {
                    violations.push({
                        file,
                        type: 'kebab-case or PascalCase',
                        pattern: 'filename',
                        actual: fileName,
                    });
                }
            }
            const passed = violations.length === 0;
            return {
                passed,
                violations: violations.length,
                message: passed
                    ? '✅ Naming Convention 모두 통과'
                    : `❌ ${violations.length}개의 Naming Convention 위반`,
                details: violations.length > 0 ? violations.slice(0, 10) : undefined,
            };
        }
        catch (error) {
            return {
                passed: false,
                violations: 0,
                message: `Unified 검증 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    isPascalCase(str) {
        return /^[A-Z][a-zA-Z0-9]*$/.test(str);
    }
    isCamelCase(str) {
        return /^[a-z][a-zA-Z0-9]*$/.test(str);
    }
    isKebabCase(str) {
        return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
    }
    isUpperSnakeCase(str) {
        return /^[A-Z][A-Z0-9_]*$/.test(str);
    }
}
exports.UnifiedValidator = UnifiedValidator;
//# sourceMappingURL=UnifiedValidator.js.map