"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BacklogService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
class BacklogService {
    projectRoot;
    backlogDir;
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.backlogDir = path_1.default.join(projectRoot, 'backlog', 'tasks');
    }
    async createTask(options) {
        this.ensureBacklogDir();
        const taskId = this.getNextTaskId();
        const filePath = this.createBacklogFile(taskId, options);
        console.log(`✅ Backlog 작업 생성 완료: ${taskId}`);
        console.log(`   파일: ${filePath}`);
        let openspecPath;
        if (options.linkOpenSpec) {
            openspecPath = this.createOpenSpecDirectory(taskId, options.title);
            console.log(`   OpenSpec: ${openspecPath}`);
        }
        this.createTraceMetadata(taskId, filePath, openspecPath);
        return {
            taskId,
            filePath,
            openspecPath,
        };
    }
    async linkTaskToGit(taskId) {
        try {
            const hookContent = `#!/bin/sh
# Backlog task ID auto-inject
# 커밋 메시지에 자동으로 refs #\${TASK_ID}를 추가합니다

TASK_ID="${taskId}"
MSG_FILE="\$1"

# 커밋 메시지 읽기
MSG=\$(cat "\$MSG_FILE")

# 이미 task ID가 있으면 추가하지 않음
if echo "\$MSG" | grep -q "refs #\${TASK_ID}"; then
  exit 0
fi

# 커밋 메시지 끝에 refs #\${TASK_ID} 추가
echo "" >> "\$MSG_FILE"
echo "refs #\${TASK_ID}" >> "\$MSG_FILE"

exit 0
`;
            const hookPath = path_1.default.join(this.projectRoot, '.git', 'hooks', 'prepare-commit-msg');
            const hooksDir = path_1.default.dirname(hookPath);
            if (!fs_1.default.existsSync(hooksDir)) {
                fs_1.default.mkdirSync(hooksDir, { recursive: true });
            }
            fs_1.default.writeFileSync(hookPath, hookContent, { mode: 0o755 });
            console.log(`✅ Git hook 설정 완료`);
            console.log(`   다음 커밋부터 "refs #${taskId}"가 자동으로 추가됩니다`);
            return true;
        }
        catch (error) {
            console.error(`❌ Git hook 설정 실패:`, error);
            return false;
        }
    }
    async syncAndValidate() {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            summary: {
                backlogTasksFound: 0,
                openspecProposalsFound: 0,
                gitCommitsFound: 0,
                tracingIssues: 0,
            },
        };
        try {
            const backlogTasks = this.getBacklogTasks();
            result.summary.backlogTasksFound = backlogTasks.length;
            const openspecProposals = this.getOpenSpecProposals();
            result.summary.openspecProposalsFound = openspecProposals.length;
            const gitCommits = this.getGitCommitsWithTaskIds();
            result.summary.gitCommitsFound = gitCommits.length;
            for (const task of backlogTasks) {
                const taskId = task.id;
                if (!fs_1.default.existsSync(task.filePath)) {
                    result.errors.push(`Backlog 파일 없음: ${taskId} (${task.filePath})`);
                    result.isValid = false;
                    result.summary.tracingIssues++;
                    continue;
                }
                const openspecPath = path_1.default.join(this.projectRoot, 'openspec', 'changes', `task-${taskId}-*`);
                const hasOpenSpec = this.pathExists(openspecPath);
                if (!hasOpenSpec) {
                    result.warnings.push(`OpenSpec 링크 없음: ${taskId}`);
                    result.summary.tracingIssues++;
                }
                const hasGitRef = gitCommits.some(c => c.includes(`refs #${taskId}`));
                if (!hasGitRef) {
                    result.warnings.push(`Git 참조 없음: ${taskId}`);
                }
            }
            for (const proposal of openspecProposals) {
                const hasBacklogLink = backlogTasks.some(t => proposal.includes(`task-${t.id}`) ||
                    proposal.includes(`refs #${t.id}`));
                if (!hasBacklogLink) {
                    result.warnings.push(`OpenSpec이 Backlog와 링크되지 않음: ${proposal}`);
                }
            }
            console.log(`\n📊 추적 체인 검증 결과:`);
            console.log(`   Backlog 작업: ${result.summary.backlogTasksFound}개`);
            console.log(`   OpenSpec 제안: ${result.summary.openspecProposalsFound}개`);
            console.log(`   Git 커밋: ${result.summary.gitCommitsFound}개`);
            console.log(`   추적 이슈: ${result.summary.tracingIssues}개`);
            if (result.isValid) {
                console.log(`\n✅ 추적 체인 검증 완료: 모든 링크가 정상입니다`);
            }
            else {
                console.log(`\n⚠️  추적 체인 검증 완료: ${result.errors.length}개 오류 발견`);
            }
        }
        catch (error) {
            result.isValid = false;
            result.errors.push(`검증 중 오류 발생: ${error}`);
        }
        return result;
    }
    ensureBacklogDir() {
        if (!fs_1.default.existsSync(this.backlogDir)) {
            fs_1.default.mkdirSync(this.backlogDir, { recursive: true });
            console.log(`📁 Backlog 디렉터리 생성: ${this.backlogDir}`);
        }
    }
    getNextTaskId() {
        const files = fs_1.default.readdirSync(this.backlogDir);
        const taskIds = files
            .map(f => {
            const match = f.match(/task-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        })
            .filter(id => id > 0);
        const nextId = Math.max(...taskIds, 0) + 1;
        return `task-${nextId}`;
    }
    createBacklogFile(taskId, options) {
        const timestamp = new Date().toISOString().split('T')[0];
        const sanitizedTitle = options.title
            .replace(/[\/\\:*?"<>|]/g, '-')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
        const fileName = `${taskId}-${sanitizedTitle}.md`;
        const filePath = path_1.default.join(this.backlogDir, fileName);
        const content = `# ${taskId}: ${options.title}

**Status**: ${options.status || 'To Do'}
**Priority**: ${options.priority || 'medium'}
**Created**: ${timestamp}
${options.assignee ? `**Assignee**: ${options.assignee}` : ''}
${options.labels ? `**Labels**: ${options.labels.join(', ')}` : ''}

## Description

${options.description || '(설명 없음)'}

## Acceptance Criteria

- [ ]

## Implementation Notes

(구현 중 기록)

## Related Links

- OpenSpec: (생성 시 자동 추가)
- Git commits: (커밋 메시지에 refs #${taskId} 포함)
`;
        fs_1.default.writeFileSync(filePath, content);
        return filePath;
    }
    createOpenSpecDirectory(taskId, title) {
        const sanitizedTitle = title
            .replace(/[\/\\:*?"<>|]/g, '-')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
        const dirName = `${taskId}-${sanitizedTitle}`;
        const dirPath = path_1.default.join(this.projectRoot, 'openspec', 'changes', dirName);
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
            const proposalPath = path_1.default.join(dirPath, 'proposal.md');
            const proposalContent = `# ${taskId}: ${title}

## 제안 ID
\`${taskId}\`

## 상태
Draft (Backlog에서 생성됨)

## 목적 (Why)

(목적 작성)

## 제안 내용 (What)

(제안 내용 작성)

## 영향도 (Impact)

(영향도 작성)

---

**생성일**: ${new Date().toISOString().split('T')[0]}
**Backlog 링크**: ./../../backlog/tasks/${dirName}.md
`;
            fs_1.default.writeFileSync(proposalPath, proposalContent);
            const designPath = path_1.default.join(dirPath, 'design.md');
            const designContent = `# ${taskId} 설계

(설계 작성)
`;
            fs_1.default.writeFileSync(designPath, designContent);
        }
        return dirPath;
    }
    createTraceMetadata(taskId, backlogPath, openspecPath) {
        const metaPath = path_1.default.join(this.projectRoot, '.zellyy-dev-kit', 'tracing', `${taskId}.json`);
        const metaDir = path_1.default.dirname(metaPath);
        if (!fs_1.default.existsSync(metaDir)) {
            fs_1.default.mkdirSync(metaDir, { recursive: true });
        }
        const metadata = {
            taskId,
            backlogPath,
            openspecPath,
            createdAt: new Date().toISOString(),
            gitHook: {
                enabled: true,
                message: `refs #${taskId}`,
            },
        };
        fs_1.default.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
    }
    getBacklogTasks() {
        if (!fs_1.default.existsSync(this.backlogDir)) {
            return [];
        }
        return fs_1.default.readdirSync(this.backlogDir)
            .filter(f => f.startsWith('task-'))
            .map(f => ({
            id: f.split('-')[1],
            filePath: path_1.default.join(this.backlogDir, f),
        }));
    }
    getOpenSpecProposals() {
        const changesDir = path_1.default.join(this.projectRoot, 'openspec', 'changes');
        if (!fs_1.default.existsSync(changesDir)) {
            return [];
        }
        return fs_1.default.readdirSync(changesDir)
            .filter(f => fs_1.default.statSync(path_1.default.join(changesDir, f)).isDirectory())
            .filter(f => f !== 'archive');
    }
    getGitCommitsWithTaskIds() {
        try {
            const log = (0, child_process_1.execSync)('git log --oneline -20', {
                cwd: this.projectRoot,
                encoding: 'utf-8',
            });
            return log.split('\n').filter(line => /refs\s#task-\d+|#\d+/.test(line));
        }
        catch {
            return [];
        }
    }
    pathExists(pattern) {
        try {
            const dir = path_1.default.dirname(pattern);
            const filePattern = path_1.default.basename(pattern);
            if (!fs_1.default.existsSync(dir)) {
                return false;
            }
            const files = fs_1.default.readdirSync(dir);
            return files.some(f => f.match(new RegExp(`^${filePattern.replace(/\*/g, '.*')}$`)));
        }
        catch {
            return false;
        }
    }
}
exports.BacklogService = BacklogService;
//# sourceMappingURL=BacklogService.js.map