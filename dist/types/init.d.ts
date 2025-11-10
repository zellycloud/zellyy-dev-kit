export type ProjectType = 'react' | 'vue' | 'node';
export interface InitConfig {
    projectName: string;
    projectType: ProjectType;
    enableOpenSpec: boolean;
    enableBacklog: boolean;
    tdd: {
        enableVitest: boolean;
        coverageThreshold: number;
        enableUI: boolean;
    };
    qualityGates: {
        enablePreCommitHook: boolean;
        enableCommitMsgValidation: boolean;
        autoFixLint: boolean;
        autoFormatCode: boolean;
    };
}
export interface InitResult {
    success: boolean;
    filesCreated: string[];
    dependenciesInstalled: string[];
    scriptsExecuted: string[];
    skipped: string[];
    errors?: string[];
    nextSteps: string[];
}
//# sourceMappingURL=init.d.ts.map