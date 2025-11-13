import { FixSuggestion } from '../fixers/FixSuggester';
import { ParsedError } from '../../types/analyzer';
export interface TestFixerResult {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    errors: ParsedError[];
    suggestions: FixSuggestion[];
    summary: string;
}
export interface TestFixerOptions {
    pattern?: string;
    verbose?: boolean;
    autoApply?: boolean;
    report?: boolean;
    minConfidence?: number;
}
export declare class TestFixerAgent {
    private errorAnalyzer;
    private fixSuggester;
    constructor();
    private runTests;
    private extractTestStats;
    execute(options?: TestFixerOptions): Promise<TestFixerResult>;
    private printResults;
    getHighConfidenceSuggestions(suggestions: FixSuggestion[]): FixSuggestion[];
    getCriticalSuggestions(suggestions: FixSuggestion[]): FixSuggestion[];
    getAutoAppliableSuggestions(suggestions: FixSuggestion[]): FixSuggestion[];
    generateDetailedReport(result: TestFixerResult): string;
}
//# sourceMappingURL=TestFixerAgent.d.ts.map