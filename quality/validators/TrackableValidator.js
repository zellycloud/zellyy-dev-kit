"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackableValidator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class TrackableValidator {
    projectPath;
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    async validate() {
        try {
            const specs = this.collectTags('SPEC');
            const tests = this.collectTags('TEST');
            const codes = this.collectTags('CODE');
            const details = [];
            const allIds = new Set([...specs.keys(), ...tests.keys(), ...codes.keys()]);
            for (const id of allIds) {
                const hasSpec = specs.has(id);
                const hasTest = tests.has(id);
                const hasCode = codes.has(id);
                if (!hasSpec) {
                    details.push({
                        file: codes.get(id)?.[0].file || 'unknown',
                        type: 'missing_spec',
                        id,
                        suggestion: `@SPEC:${id} 주석 추가 필요`,
                    });
                }
                if (!hasTest) {
                    details.push({
                        file: codes.get(id)?.[0].file || 'unknown',
                        type: 'missing_test',
                        id,
                        suggestion: `@TEST:${id} 주석 추가 필요`,
                    });
                }
                if (!hasCode) {
                    details.push({
                        file: specs.get(id)?.[0].file || 'unknown',
                        type: 'missing_code',
                        id,
                        suggestion: `구현 코드 추가 필요`,
                    });
                }
            }
            const missingTags = details.filter(d => d.type === 'missing_spec' || d.type === 'missing_test').length;
            const invalidChains = details.filter(d => d.type === 'missing_code').length;
            const hasCriticalTags = [...allIds].some(id => {
                const spec = specs.get(id) || [];
                const test = tests.get(id) || [];
                const code = codes.get(id) || [];
                return (spec.length > 0 || code.length > 0) && (test.length > 0 || code.length > 0);
            });
            const passed = !hasCriticalTags || missingTags === 0;
            return {
                passed: true,
                missingTags,
                invalidChains,
                message: passed
                    ? '✅ 추적 가능성 검증 통과'
                    : `⚠️ ${missingTags}개 태그 누락 (정보 제공용)`,
                details: details.length > 0 ? details.slice(0, 20) : undefined,
            };
        }
        catch (error) {
            return {
                passed: true,
                missingTags: 0,
                invalidChains: 0,
                message: `Trackable 검증 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    collectTags(type) {
        const tags = new Map();
        const pattern = type === 'SPEC' ? /src\/.*\.ts$|openspec\/.*\.md$/ : /src\/.*\.ts$|tests\/.*\.ts$/;
        const files = (0, glob_1.globSync)(['src/**/*.ts', 'tests/**/*.ts', 'openspec/**/*.md'], {
            cwd: this.projectPath,
            ignore: ['node_modules/**', 'dist/**'],
        });
        for (const file of files) {
            const filePath = path_1.default.join(this.projectPath, file);
            try {
                const content = fs_1.default.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n');
                for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                    const line = lines[lineNum];
                    const regex = new RegExp(`@${type}:(\\w+[-\\w]*)`, 'g');
                    let match;
                    while ((match = regex.exec(line)) !== null) {
                        const id = match[1];
                        if (!tags.has(id)) {
                            tags.set(id, []);
                        }
                        tags.get(id).push({
                            type,
                            id,
                            file,
                            line: lineNum + 1,
                        });
                    }
                }
            }
            catch (error) {
            }
        }
        return tags;
    }
}
exports.TrackableValidator = TrackableValidator;
//# sourceMappingURL=TrackableValidator.js.map