#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
program
    .name('zellyy-dev-kit')
    .description('moai-adk 스타일 전체 개발 프로세스 자동화 CLI 도구')
    .version('0.1.0');
program
    .command('init')
    .description('프로젝트 초기화 (OpenSpec + Backlog + TDD 인프라)')
    .option('--full', '전체 인프라 구축 (OpenSpec + Backlog + TDD + CI/CD)')
    .action((options) => {
    console.log(chalk_1.default.blue('🚀 zellyy-dev-kit 프로젝트 초기화'));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (1주)'));
    if (options.full) {
        console.log(chalk_1.default.green('✓ 전체 인프라 모드'));
    }
});
const testCmd = program
    .command('test')
    .description('테스트 관련 명령어');
testCmd
    .command('fix <file>')
    .description('실패한 테스트 자동 수정 (Precision test fixing)')
    .action((file) => {
    console.log(chalk_1.default.blue(`🔧 테스트 수정: ${file}`));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (2일)'));
});
testCmd
    .command('generate')
    .description('사양 기반 테스트 자동 생성')
    .option('--spec <file>', 'OpenSpec 사양 파일 경로')
    .action((options) => {
    console.log(chalk_1.default.blue('📝 테스트 자동 생성'));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 2 (1주)'));
});
testCmd
    .command('watch')
    .description('TDD 워크플로우 (RED → GREEN → REFACTOR)')
    .action(() => {
    console.log(chalk_1.default.blue('👀 TDD Watch 모드'));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 2 (1주)'));
});
const openspecCmd = program
    .command('openspec')
    .alias('os')
    .description('OpenSpec 관련 명령어');
openspecCmd
    .command('proposal <change-id>')
    .description('OpenSpec 제안 생성')
    .action((changeId) => {
    console.log(chalk_1.default.blue(`📄 OpenSpec 제안 생성: ${changeId}`));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (1일)'));
});
openspecCmd
    .command('validate <change-id>')
    .description('OpenSpec 사양 검증')
    .option('--strict', '엄격한 검증 모드')
    .action((changeId, options) => {
    console.log(chalk_1.default.blue(`✅ OpenSpec 검증: ${changeId}`));
    if (options.strict) {
        console.log(chalk_1.default.green('✓ Strict 모드'));
    }
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (1일)'));
});
openspecCmd
    .command('review <change-id>')
    .description('Multi-Agent Debate 실행')
    .action((changeId) => {
    console.log(chalk_1.default.blue(`🤖 Multi-Agent Debate: ${changeId}`));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 2 (1주)'));
});
openspecCmd
    .command('archive <change-id>')
    .description('OpenSpec 제안 아카이브')
    .action((changeId) => {
    console.log(chalk_1.default.blue(`📦 OpenSpec 아카이브: ${changeId}`));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (1일)'));
});
const taskCmd = program
    .command('task')
    .description('Backlog 작업 관리 명령어');
taskCmd
    .command('create <title>')
    .description('Backlog 작업 생성 + OpenSpec 제안 자동 링크')
    .option('--openspec <change-id>', 'OpenSpec 제안 ID')
    .action((title, options) => {
    console.log(chalk_1.default.blue(`📋 Backlog 작업 생성: ${title}`));
    if (options.openspec) {
        console.log(chalk_1.default.green(`✓ OpenSpec 링크: ${options.openspec}`));
    }
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (1일)'));
});
taskCmd
    .command('sync')
    .description('Backlog ↔ OpenSpec ↔ Git 추적 체인 검증')
    .action(() => {
    console.log(chalk_1.default.blue('🔄 추적 체인 검증'));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (1일)'));
});
program
    .command('quality:check')
    .alias('qc')
    .description('TRUST 5 Quality Gates 검증')
    .action(() => {
    console.log(chalk_1.default.blue('🎯 Quality Gates 검증'));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 2 (1주)'));
});
program
    .command('commit <message>')
    .description('Git 커밋 (Backlog ID 자동 추가)')
    .action((message) => {
    console.log(chalk_1.default.blue(`💾 Git 커밋: ${message}`));
    console.log(chalk_1.default.yellow('⚠️  구현 중: Phase 1 (1일)'));
});
program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ zellyy-dev-kit init');
    console.log('  $ zellyy-dev-kit test:fix SmartCategoryService.test.ts');
    console.log('  $ zellyy-dev-kit openspec:proposal new-feature');
    console.log('  $ zellyy-dev-kit task:create "새 기능 추가" --openspec new-feature');
    console.log('');
    console.log('Documentation:');
    console.log('  https://github.com/zellycloud/zellyy-dev-kit');
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=cli.js.map