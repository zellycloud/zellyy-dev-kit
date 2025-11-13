export interface TaskCreateOptions {
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    status?: 'To Do' | 'In Progress' | 'Done';
    labels?: string[];
    assignee?: string;
    linkOpenSpec?: boolean;
}
export interface TaskSyncResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    summary: {
        backlogTasksFound: number;
        openspecProposalsFound: number;
        gitCommitsFound: number;
        tracingIssues: number;
    };
}
export declare class BacklogService {
    private projectRoot;
    private backlogDir;
    constructor(projectRoot?: string);
    createTask(options: TaskCreateOptions): Promise<{
        taskId: string;
        filePath: string;
        openspecPath?: string;
    }>;
    linkTaskToGit(taskId: string): Promise<boolean>;
    syncAndValidate(): Promise<TaskSyncResult>;
    private ensureBacklogDir;
    private getNextTaskId;
    private createBacklogFile;
    private createOpenSpecDirectory;
    private createTraceMetadata;
    private getBacklogTasks;
    private getOpenSpecProposals;
    private getGitCommitsWithTaskIds;
    private pathExists;
}
//# sourceMappingURL=BacklogService.d.ts.map