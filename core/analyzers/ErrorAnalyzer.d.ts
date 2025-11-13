import { ParsedError } from '../../types/analyzer';
export declare class ErrorAnalyzer {
    private patterns;
    parseErrors(errorOutput: string): ParsedError[];
    private splitErrorBlocks;
    private parseErrorBlock;
    private parseFallbackError;
    private extractMessage;
    private extractCodeLine;
    private classifyError;
    calculateConfidence(error: ParsedError): number;
    calculateAverageConfidence(errors: ParsedError[]): number;
    calculateConfidenceForAll(errors: ParsedError[]): Array<ParsedError & {
        confidence: number;
    }>;
}
//# sourceMappingURL=ErrorAnalyzer.d.ts.map