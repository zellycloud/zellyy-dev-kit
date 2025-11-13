import { SecuredValidationResult } from '../TrustChecker';
export declare class SecuredValidator {
    private projectPath;
    private secretPatterns;
    constructor(projectPath: string);
    validate(): Promise<SecuredValidationResult>;
}
//# sourceMappingURL=SecuredValidator.d.ts.map