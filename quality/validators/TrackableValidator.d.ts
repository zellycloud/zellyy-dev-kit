import { TrackableValidationResult } from '../TrustChecker';
export declare class TrackableValidator {
    private projectPath;
    constructor(projectPath: string);
    validate(): Promise<TrackableValidationResult>;
    private collectTags;
}
//# sourceMappingURL=TrackableValidator.d.ts.map