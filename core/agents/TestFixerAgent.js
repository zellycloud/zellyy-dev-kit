"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFixerAgent = void 0;
const child_process_1 = require("child_process");
const ErrorAnalyzer_1 = require("../analyzers/ErrorAnalyzer");
const FixSuggester_1 = require("../fixers/FixSuggester");
class TestFixerAgent {
    errorAnalyzer;
    fixSuggester;
    constructor() {
        this.errorAnalyzer = new ErrorAnalyzer_1.ErrorAnalyzer();
        this.fixSuggester = new FixSuggester_1.FixSuggester();
    }
    runTests(pattern) {
        try {
            const command = pattern
                ? `npm test -- ${pattern} 2>&1`
                : 'npm test 2>&1';
            const output = (0, child_process_1.execSync)(command, {
                encoding: 'utf-8',
                stdio: 'pipe',
                maxBuffer: 10 * 1024 * 1024,
            });
            return output;
        }
        catch (error) {
            return error.stdout || error.stderr || '';
        }
    }
    extractTestStats(output) {
        const failMatch = output.match(/(\d+)\s+(?:failed|FAIL)/i);
        const passMatch = output.match(/(\d+)\s+(?:passed|PASS)/i);
        const summaryMatch = output.match(/Test Files\s+(\d+)\s+failed.*Tests\s+(\d+)\s+failed\s+(\d+)\s+passed/);
        if (summaryMatch) {
            const failedTests = parseInt(summaryMatch[2], 10);
            const passedTests = parseInt(summaryMatch[3], 10);
            return {
                totalTests: failedTests + passedTests,
                passedTests,
                failedTests,
            };
        }
        const failedCount = failMatch ? parseInt(failMatch[1], 10) : 0;
        const passedCount = passMatch ? parseInt(passMatch[1], 10) : 0;
        return {
            totalTests: failedCount + passedCount,
            passedTests: passedCount,
            failedTests: failedCount,
        };
    }
    async execute(options = {}) {
        const { pattern, verbose = false, autoApply = false, report = false, minConfidence = 50, } = options;
        console.log('🔍 테스트 실행 중...\n');
        const testOutput = this.runTests(pattern);
        const stats = this.extractTestStats(testOutput);
        if (verbose) {
            console.log(`📊 테스트 결과: ${stats.passedTests}/${stats.totalTests} 통과\n`);
        }
        const errors = this.errorAnalyzer.parseErrors(testOutput);
        if (verbose && errors.length > 0) {
            console.log(`🔴 ${errors.length}개의 에러 감지됨\n`);
        }
        let suggestions = this.fixSuggester.suggestFixes(errors);
        if (minConfidence > 0) {
            suggestions = this.fixSuggester.filterByConfidence(suggestions, minConfidence);
        }
        const summary = this.fixSuggester.summarizeFixes(suggestions);
        const result = {
            totalTests: stats.totalTests,
            passedTests: stats.passedTests,
            failedTests: stats.failedTests,
            errors,
            suggestions,
            summary,
        };
        if (!report) {
            this.printResults(result, verbose);
        }
        return result;
    }
    printResults(result, verbose = false) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 테스트 실패 분석 결과');
        console.log('='.repeat(60) + '\n');
        const passRate = result.totalTests > 0
            ? ((result.passedTests / result.totalTests) * 100).toFixed(1)
            : '0.0';
        console.log(`✅ 성공: ${result.passedTests}/${result.totalTests} (${passRate}%)`);
        console.log(`❌ 실패: ${result.failedTests}개\n`);
        if (verbose && result.errors.length > 0) {
            console.log('🔍 감지된 에러:');
            result.errors.forEach((error, idx) => {
                console.log(`  ${idx + 1}. [${error.file}:${error.line}] ${error.type} - ${error.message}`);
            });
            console.log();
        }
        if (result.suggestions.length > 0) {
            console.log(result.summary);
        }
        else {
            console.log('💡 수정 제안: 가능한 제안이 없습니다. 수동 검토가 필요합니다.\n');
        }
        console.log('='.repeat(60) + '\n');
    }
    getHighConfidenceSuggestions(suggestions) {
        return suggestions.filter(s => s.intent.confidence >= 80);
    }
    getCriticalSuggestions(suggestions) {
        return suggestions.filter(s => s.intent.severity === 'critical');
    }
    getAutoAppliableSuggestions(suggestions) {
        return this.getHighConfidenceSuggestions(suggestions).filter(s => s.intent.severity !== 'minor');
    }
    generateDetailedReport(result) {
        let report = '# 테스트 실패 분석 리포트\n\n';
        report += '## 📊 요약\n\n';
        report += `- 총 테스트: ${result.totalTests}개\n`;
        report += `- 통과: ${result.passedTests}개\n`;
        report += `- 실패: ${result.failedTests}개\n`;
        report += `- 감지된 에러: ${result.errors.length}개\n`;
        report += `- 수정 제안: ${result.suggestions.length}개\n\n`;
        if (result.errors.length > 0) {
            report += '## 🔴 감지된 에러\n\n';
            result.errors.forEach((error, idx) => {
                report += `### ${idx + 1}. ${error.type.toUpperCase()}\n`;
                report += `- **파일**: ${error.file}:${error.line}:${error.column}\n`;
                report += `- **메시지**: ${error.message}\n`;
                report += `- **코드**: \`${error.context.code}\`\n`;
                if (error.context.expected) {
                    report += `- **기대값**: ${error.context.expected}\n`;
                }
                if (error.context.actual) {
                    report += `- **실제값**: ${error.context.actual}\n`;
                }
                report += '\n';
            });
        }
        if (result.suggestions.length > 0) {
            report += '## ✨ 수정 제안\n\n';
            const grouped = this.fixSuggester.groupByConfidenceLevel(result.suggestions);
            if (grouped.high.length > 0) {
                report += '### 자동 수정 가능 (신뢰도 80%+)\n\n';
                grouped.high.forEach((fix, idx) => {
                    report += `${idx + 1}. **${fix.intent.suggestion}**\n`;
                    report += `   - 신뢰도: ${fix.intent.confidence}%\n`;
                    report += `   - 심각도: ${fix.intent.severity}\n`;
                    report += `   - 현재: \`${fix.code}\`\n`;
                    report += `   - 변경: \`${fix.replacementCode}\`\n\n`;
                });
            }
            if (grouped.medium.length > 0) {
                report += '### 사용자 확인 필요 (신뢰도 50-79%)\n\n';
                grouped.medium.forEach((fix, idx) => {
                    report += `${idx + 1}. ${fix.intent.suggestion}\n`;
                    report += `   - 신뢰도: ${fix.intent.confidence}%\n\n`;
                });
            }
            if (grouped.low.length > 0) {
                report += '### 수동 수정 권장 (신뢰도 < 50%)\n\n';
                grouped.low.forEach((fix, idx) => {
                    report += `${idx + 1}. ${fix.suggestion}\n`;
                    report += `   - 신뢰도: ${fix.intent.confidence}%\n\n`;
                });
            }
        }
        return report;
    }
}
exports.TestFixerAgent = TestFixerAgent;
//# sourceMappingURL=TestFixerAgent.js.map