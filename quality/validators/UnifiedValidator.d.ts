import { UnifiedValidationResult } from '../TrustChecker';
export declare class UnifiedValidator {
    private projectPath;
    constructor(projectPath: string);
    validate(): Promise<UnifiedValidationResult>;
    private isPascalCase;
    private isCamelCase;
    private isKebabCase;
    private isUpperSnakeCase;
}
//# sourceMappingURL=UnifiedValidator.d.ts.map