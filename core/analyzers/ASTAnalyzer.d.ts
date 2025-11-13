import { AnalysisResult, CircularDependency } from '../../types/analyzer';
export declare class ASTAnalyzer {
    private project;
    constructor();
    analyzeFile(filePath: string): AnalysisResult;
    private extractFunctions;
    private extractFunctionSignature;
    private extractParameters;
    private extractClasses;
    private extractInterfaces;
    private extractTypeAliases;
    private extractEnums;
    private extractImports;
    private extractJsDoc;
    detectCircularDependencies(filePaths: string[]): CircularDependency[];
}
//# sourceMappingURL=ASTAnalyzer.d.ts.map