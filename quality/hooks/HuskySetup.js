"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuskySetup = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class HuskySetup {
    projectPath;
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    async install() {
        try {
            const huskyDir = path_1.default.join(this.projectPath, '.husky');
            const preCommitFile = path_1.default.join(huskyDir, 'pre-commit');
            if (!fs_1.default.existsSync(huskyDir)) {
                fs_1.default.mkdirSync(huskyDir, { recursive: true });
            }
            const preCommitScript = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run Quality Gates before commit
echo "🎯 Running Quality Gates check..."
npx zellyy-dev-kit quality:check

# Check result
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Quality Gates 검사 실패"
  echo "다음 명령어로 자동 수정을 시도하세요:"
  echo "  npx zellyy-dev-kit quality:fix"
  exit 1
fi

echo "✅ Quality Gates 통과"
`;
            fs_1.default.writeFileSync(preCommitFile, preCommitScript, { mode: 0o755 });
            console.log('✅ Pre-commit hook 설치 완료');
            console.log(`   파일: ${preCommitFile}`);
        }
        catch (error) {
            console.error('❌ Pre-commit hook 설치 실패:', error instanceof Error ? error.message : String(error));
        }
    }
    async uninstall() {
        try {
            const preCommitFile = path_1.default.join(this.projectPath, '.husky', 'pre-commit');
            if (fs_1.default.existsSync(preCommitFile)) {
                fs_1.default.unlinkSync(preCommitFile);
                console.log('✅ Pre-commit hook 제거 완료');
            }
        }
        catch (error) {
            console.error('❌ Pre-commit hook 제거 실패:', error instanceof Error ? error.message : String(error));
        }
    }
    async status() {
        const preCommitFile = path_1.default.join(this.projectPath, '.husky', 'pre-commit');
        return fs_1.default.existsSync(preCommitFile);
    }
}
exports.HuskySetup = HuskySetup;
//# sourceMappingURL=HuskySetup.js.map