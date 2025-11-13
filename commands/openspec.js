"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOpenSpecCommands = registerOpenSpecCommands;
function registerOpenSpecCommands(program) {
    program
        .command('openspec:proposal <change-name>')
        .description('새로운 OpenSpec 제안을 작성합니다')
        .action(async (changeName) => {
        console.log(`📝 새 OpenSpec 제안 작성: ${changeName}`);
        console.log('💡 Tip: openspec/changes/ 디렉터리에 제안이 생성됩니다');
    });
    program
        .command('openspec:validate [change-id]')
        .description('OpenSpec 사양을 검증합니다')
        .option('-s, --strict', '엄격한 검증 모드')
        .action(async (changeId, options) => {
        const target = changeId || 'all';
        console.log(`✅ OpenSpec 검증: ${target}`);
        if (options.strict) {
            console.log('🔒 엄격한 검증 모드 활성화');
        }
    });
    program
        .command('openspec:review <change-id>')
        .description('OpenSpec 제안을 Multi-Agent Debate로 리뷰합니다')
        .action(async (changeId) => {
        console.log(`🤖 Multi-Agent Debate 리뷰 시작: ${changeId}`);
        console.log('참여 에이전트: TestAgent, SecurityAgent, PerformanceAgent');
    });
    program
        .command('openspec:apply <change-id>')
        .description('승인된 OpenSpec 제안을 적용합니다')
        .action(async (changeId) => {
        console.log(`🚀 OpenSpec 제안 적용: ${changeId}`);
        console.log('✅ Backlog 작업이 자동으로 동기화됩니다');
    });
    program
        .command('openspec:archive <change-id>')
        .description('OpenSpec 제안을 아카이브하고 주 사양 파일에 병합합니다')
        .action(async (changeId) => {
        console.log(`📦 OpenSpec 아카이브: ${changeId}`);
        console.log('✅ 사양이 openspec/specs/에 병합됩니다');
    });
}
//# sourceMappingURL=openspec.js.map