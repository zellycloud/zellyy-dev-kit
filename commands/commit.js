"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommitCommand = registerCommitCommand;
const chalk_1 = __importDefault(require("chalk"));
function registerCommitCommand(program) {
    program
        .command('commit')
        .description('Conventional Commit 형식으로 안내합니다')
        .action(async () => {
        console.log(chalk_1.default.cyan('\n📝 Conventional Commit Helper\n'));
        console.log(chalk_1.default.yellow('커밋 형식:'));
        console.log('  <type>(<scope>): <subject>');
        console.log('');
        console.log(chalk_1.default.yellow('타입 (type):'));
        console.log('  ✨ feat:     새 기능');
        console.log('  🐛 fix:      버그 수정');
        console.log('  📚 docs:     문서 수정');
        console.log('  🎨 style:    코드 스타일 변경');
        console.log('  ♻️  refactor: 리팩터링');
        console.log('  ⚡ perf:     성능 개선');
        console.log('  🧪 test:     테스트 추가');
        console.log('  🔧 chore:    빌드, 패키지 관리');
        console.log('');
        console.log(chalk_1.default.yellow('예시:'));
        console.log('  feat(auth): 로그인 기능 추가 (refs #100)');
        console.log('  fix(api): 타입 에러 수정 (refs #101)');
        console.log('  docs: README 업데이트');
        console.log('');
        console.log(chalk_1.default.green('💡 팁: Backlog ID를 포함하면 작업 추적이 더 쉬워집니다!'));
        console.log('');
    });
}
//# sourceMappingURL=commit.js.map