"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaskCommands = registerTaskCommands;
const BacklogService_1 = require("../core/services/BacklogService");
function registerTaskCommands(program) {
    const backlogService = new BacklogService_1.BacklogService(process.cwd());
    program
        .command('task:create <title>')
        .description('새로운 Backlog 작업을 생성합니다')
        .option('-d, --description <text>', '작업 설명')
        .option('-p, --priority <level>', '우선도 (high|medium|low)', 'medium')
        .option('-s, --status <status>', '상태 (To Do|In Progress|Done)', 'To Do')
        .option('--link-openspec', 'OpenSpec 디렉터리도 함께 생성', false)
        .option('-a, --assignee <name>', '담당자')
        .option('-l, --labels <labels>', '레이블 (쉼표로 구분)')
        .action(async (title, options) => {
        try {
            const labels = options.labels ? options.labels.split(',').map((l) => l.trim()) : [];
            const result = await backlogService.createTask({
                title,
                description: options.description,
                priority: options.priority,
                status: options.status,
                labels,
                assignee: options.assignee,
                linkOpenSpec: options.linkOpenspec,
            });
            console.log(`\n✨ Task 생성 완료!`);
            console.log(`\n📋 Backlog:`);
            console.log(`   ID: ${result.taskId}`);
            console.log(`   파일: ${result.filePath}`);
            if (result.openspecPath) {
                console.log(`\n📝 OpenSpec:`);
                console.log(`   디렉터리: ${result.openspecPath}`);
                console.log(`   생성된 파일:`);
                console.log(`     - proposal.md`);
                console.log(`     - design.md`);
            }
            console.log(`\n💡 다음 단계:`);
            console.log(`   1. Backlog 파일 편집: ${result.taskId}-${title.replace(/\s+/g, '-')}.md`);
            if (result.openspecPath) {
                console.log(`   2. OpenSpec proposal.md 작성`);
                console.log(`   3. OpenSpec 검증: zellyy-dev-kit openspec:validate`);
            }
            console.log(`   ${result.openspecPath ? '4' : '2'}. Git commit에 자동으로 refs #${result.taskId} 추가됨`);
        }
        catch (error) {
            console.error('❌ Task 생성 실패:', error);
            process.exit(1);
        }
    });
    program
        .command('task:link <task-id>')
        .description('Backlog 작업을 Git commit 메시지에 자동 추가합니다')
        .action(async (taskId) => {
        try {
            const success = await backlogService.linkTaskToGit(taskId);
            if (success) {
                console.log(`\n✨ Git 링크 설정 완료!`);
                console.log(`\n🔗 설정 내용:`);
                console.log(`   - Task ID: ${taskId}`);
                console.log(`   - Git Hook: prepare-commit-msg`);
                console.log(`   - 자동 추가 메시지: refs #${taskId}`);
                console.log(`\n💡 사용 방법:`);
                console.log(`   다음 커밋부터 자동으로 "refs #${taskId}"가 커밋 메시지에 추가됩니다`);
                console.log(`\n📝 예시:`);
                console.log(`   $ git commit -m "feat: 새 기능 추가"`);
                console.log(`   # 커밋 메시지는 자동으로 다음과 같이 변환됩니다:`);
                console.log(`   # feat: 새 기능 추가`);
                console.log(`   # refs #${taskId}`);
            }
            else {
                console.error('❌ Git 링크 설정 실패');
                process.exit(1);
            }
        }
        catch (error) {
            console.error('❌ Git 링크 설정 중 오류:', error);
            process.exit(1);
        }
    });
    program
        .command('task:sync')
        .description('Backlog ↔ OpenSpec ↔ Git 작업 추적 체인을 동기화합니다')
        .option('--validate', '동기화 검증 모드')
        .action(async () => {
        try {
            const result = await backlogService.syncAndValidate();
            console.log(`\n📊 동기화 결과:`);
            console.log(`\n통계:`);
            console.log(`   - Backlog 작업: ${result.summary.backlogTasksFound}개`);
            console.log(`   - OpenSpec 제안: ${result.summary.openspecProposalsFound}개`);
            console.log(`   - Git 커밋: ${result.summary.gitCommitsFound}개`);
            console.log(`   - 추적 이슈: ${result.summary.tracingIssues}개`);
            if (result.errors.length > 0) {
                console.log(`\n❌ 오류 (${result.errors.length}개):`);
                result.errors.forEach(err => console.log(`   - ${err}`));
            }
            if (result.warnings.length > 0) {
                console.log(`\n⚠️  경고 (${result.warnings.length}개):`);
                result.warnings.forEach(warn => console.log(`   - ${warn}`));
            }
            if (result.isValid) {
                console.log(`\n✅ 추적 체인이 정상입니다! 모든 Task가 올바르게 연결되어 있습니다.`);
            }
            else {
                console.log(`\n❌ 추적 체인에 문제가 있습니다. 위의 오류를 해결하세요.`);
                process.exit(1);
            }
        }
        catch (error) {
            console.error('❌ 동기화 중 오류:', error);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=task.js.map