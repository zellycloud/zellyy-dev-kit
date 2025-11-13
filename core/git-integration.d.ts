export interface GitStatus {
    modified: string[];
    staged: string[];
    untracked: string[];
}
export interface GitCommit {
    hash: string;
    message: string;
    author: string;
    date: string;
}
export declare class GitIntegration {
    static isGitRepository(cwd?: string): Promise<boolean>;
    static getCurrentBranch(cwd?: string): Promise<string>;
    static getGitStatus(cwd?: string): Promise<GitStatus>;
    static addBacklogId(message: string, taskId: string): string;
    static getLastCommit(cwd?: string): Promise<GitCommit | null>;
    static validateCommitMessage(message: string): void;
    static extractTaskIdFromBranch(branchName: string): string | null;
    static createCommit(message: string, cwd?: string): Promise<void>;
    static isGitConfigured(cwd?: string): Promise<boolean>;
    static configureGit(name: string, email: string, cwd?: string): Promise<void>;
}
//# sourceMappingURL=git-integration.d.ts.map