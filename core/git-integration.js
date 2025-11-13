"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitIntegration = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const file_system_1 = require("../utils/file-system");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GitIntegration {
    static async isGitRepository(cwd = process.cwd()) {
        try {
            const gitDir = path.join(cwd, '.git');
            return await file_system_1.FileSystem.fileExists(gitDir);
        }
        catch {
            return false;
        }
    }
    static async getCurrentBranch(cwd = process.cwd()) {
        try {
            const { stdout } = await execAsync('git branch --show-current', { cwd });
            return stdout.trim();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`현재 브랜치를 가져올 수 없습니다: ${error.message}`);
            }
            throw error;
        }
    }
    static async getGitStatus(cwd = process.cwd()) {
        try {
            const { stdout } = await execAsync('git status --porcelain', { cwd });
            const lines = stdout.split('\n').filter(line => line.trim());
            const status = {
                modified: [],
                staged: [],
                untracked: []
            };
            for (const line of lines) {
                const statusCode = line.substring(0, 2);
                const filePath = line.substring(3).trim();
                const indexStatus = statusCode[0];
                const worktreeStatus = statusCode[1];
                if (indexStatus !== ' ' && indexStatus !== '?') {
                    status.staged.push(filePath);
                }
                if (worktreeStatus === 'M') {
                    status.modified.push(filePath);
                }
                if (statusCode === '??') {
                    status.untracked.push(filePath);
                }
            }
            return status;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Git 상태를 가져올 수 없습니다: ${error.message}`);
            }
            throw error;
        }
    }
    static addBacklogId(message, taskId) {
        if (message.includes('refs #')) {
            return message;
        }
        const match = taskId.match(/task-(\d+)/);
        if (!match) {
            throw new Error(`잘못된 task ID 형식: ${taskId}`);
        }
        const taskNumber = match[1];
        return `${message} (refs #${taskNumber})`;
    }
    static async getLastCommit(cwd = process.cwd()) {
        try {
            const { stdout: revList } = await execAsync('git rev-list -n 1 HEAD', { cwd });
            if (!revList.trim()) {
                return null;
            }
            const format = '%H%n%s%n%an%n%ai';
            const { stdout } = await execAsync(`git log -1 --format="${format}"`, { cwd });
            const lines = stdout.trim().split('\n');
            if (lines.length < 4) {
                return null;
            }
            return {
                hash: lines[0],
                message: lines[1],
                author: lines[2],
                date: lines[3]
            };
        }
        catch {
            return null;
        }
    }
    static validateCommitMessage(message) {
        if (!message || message.trim() === '') {
            throw new Error('커밋 메시지가 비어있습니다');
        }
        const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/;
        if (!conventionalCommitPattern.test(message)) {
            throw new Error('커밋 메시지는 Conventional Commits 형식을 따라야 합니다.\n' +
                '예시: feat: Add new feature, fix(scope): Fix bug');
        }
    }
    static extractTaskIdFromBranch(branchName) {
        const match = branchName.match(/task-\d+/);
        return match ? match[0] : null;
    }
    static async createCommit(message, cwd = process.cwd()) {
        try {
            this.validateCommitMessage(message);
            await execAsync(`git commit -m "${message}"`, { cwd });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`커밋 생성 실패: ${error.message}`);
            }
            throw error;
        }
    }
    static async isGitConfigured(cwd = process.cwd()) {
        try {
            const { stdout: userName } = await execAsync('git config user.name', { cwd });
            const { stdout: userEmail } = await execAsync('git config user.email', { cwd });
            return userName.trim() !== '' && userEmail.trim() !== '';
        }
        catch {
            return false;
        }
    }
    static async configureGit(name, email, cwd = process.cwd()) {
        try {
            await execAsync(`git config user.name "${name}"`, { cwd });
            await execAsync(`git config user.email "${email}"`, { cwd });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Git 설정 실패: ${error.message}`);
            }
            throw error;
        }
    }
}
exports.GitIntegration = GitIntegration;
//# sourceMappingURL=git-integration.js.map