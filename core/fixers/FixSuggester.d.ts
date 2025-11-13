import { ParsedError, FixIntent } from '../../types/analyzer';
export interface FixSuggestion {
    error: ParsedError;
    intent: FixIntent;
    code: string;
    suggestion: string;
    replacementCode: string;
}
export declare class FixSuggester {
    constructor();
    suggestFixes(errors: ParsedError[]): FixSuggestion[];
    private suggestFix;
    private suggestAssertionFix;
    private suggestTypeFix;
    private suggestImportFix;
    private suggestSignatureFix;
    private suggestAsyncFix;
    private suggestMockFix;
    filterByConfidence(suggestions: FixSuggestion[], minConfidence?: number): FixSuggestion[];
    groupByConfidenceLevel(suggestions: FixSuggestion[]): {
        high: FixSuggestion[];
        medium: FixSuggestion[];
        low: FixSuggestion[];
    };
    groupBySeverity(suggestions: FixSuggestion[]): {
        critical: FixSuggestion[];
        major: FixSuggestion[];
        minor: FixSuggestion[];
    };
    summarizeFixes(suggestions: FixSuggestion[]): string;
}
//# sourceMappingURL=FixSuggester.d.ts.map