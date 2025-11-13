"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixSuggester = void 0;
class FixSuggester {
    constructor() { }
    suggestFixes(errors) {
        return errors
            .map(error => this.suggestFix(error))
            .filter((fix) => fix !== null);
    }
    suggestFix(error) {
        try {
            switch (error.type) {
                case 'assertion':
                    return this.suggestAssertionFix(error);
                case 'type':
                    return this.suggestTypeFix(error);
                case 'import':
                    return this.suggestImportFix(error);
                case 'signature':
                    return this.suggestSignatureFix(error);
                case 'async':
                    return this.suggestAsyncFix(error);
                case 'mock':
                    return this.suggestMockFix(error);
                default:
                    return null;
            }
        }
        catch {
            return null;
        }
    }
    suggestAssertionFix(error) {
        const { code, expected, actual } = error.context;
        const message = error.message;
        if (expected && actual) {
            if (!isNaN(Number(expected))) {
                const replacementCode = code.replace(/\.toBe\s*\([^)]*\)/g, `.toBe(${expected})`);
                return {
                    error,
                    intent: {
                        type: 'modify',
                        target: 'assertion',
                        severity: 'major',
                        confidence: 75,
                        suggestion: `기대값을 ${expected}로 수정`,
                    },
                    code,
                    suggestion: `실제 값(${actual})이 기대값(${expected})과 일치하지 않습니다. 코드를 검토하세요.`,
                    replacementCode,
                };
            }
            if (typeof expected === 'string' && expected.includes("'")) {
                const replacementCode = code.replace(/\.toBe\s*\([^)]*\)/g, `.toBe(${expected})`);
                return {
                    error,
                    intent: {
                        type: 'modify',
                        target: 'assertion',
                        severity: 'major',
                        confidence: 70,
                        suggestion: `예상 값을 ${expected}로 수정`,
                    },
                    code,
                    suggestion: `문자열 비교 실패. 기대값: ${expected}, 실제값: ${actual}`,
                    replacementCode,
                };
            }
        }
        const assertMatch = message.match(/expected\s*\(([^)]+)\).*?\.toBe\s*\(([^)]+)\)/i);
        if (assertMatch) {
            const [, actual, expected] = assertMatch;
            const replacementCode = code.replace(/\.toBe\s*\([^)]*\)/g, `.toBe(${expected})`);
            return {
                error,
                intent: {
                    type: 'modify',
                    target: 'assertion',
                    severity: 'major',
                    confidence: 70,
                    suggestion: `기대값을 ${expected}로 수정`,
                },
                code,
                suggestion: `실제 값(${actual})이 기대값(${expected})과 일치하지 않습니다.`,
                replacementCode,
            };
        }
        return null;
    }
    suggestTypeFix(error) {
        const { code } = error.context;
        const message = error.message;
        const propMatch = message.match(/Property\s+['"]([^'"]+)['"]\s+does\s+not\s+exist/i);
        if (propMatch) {
            const propertyName = propMatch[1];
            return {
                error,
                intent: {
                    type: 'add',
                    target: 'type',
                    severity: 'critical',
                    confidence: 80,
                    suggestion: `인터페이스/타입에 '${propertyName}' 속성 추가`,
                },
                code,
                suggestion: `속성 '${propertyName}'이(가) 존재하지 않습니다. 타입 정의에 추가하세요.`,
                replacementCode: `${propertyName}: unknown;`,
            };
        }
        const typeMatch = message.match(/Type\s+['"]([^'"]+)['"]\s+is\s+not\s+assignable\s+to\s+type\s+['"]([^'"]+)['"]/i);
        if (typeMatch) {
            const [, actual, expected] = typeMatch;
            return {
                error,
                intent: {
                    type: 'modify',
                    target: 'type',
                    severity: 'major',
                    confidence: 75,
                    suggestion: `타입을 ${expected}로 변경`,
                },
                code,
                suggestion: `타입 불일치: ${actual}을(를) ${expected}로 변환해야 합니다.`,
                replacementCode: `as ${expected}`,
            };
        }
        return null;
    }
    suggestImportFix(error) {
        const { code } = error.context;
        const message = error.message;
        const moduleMatch = message.match(/Cannot find module\s+['"]([^'"]+)['"]/i);
        if (!moduleMatch) {
            return null;
        }
        const modulePath = moduleMatch[1];
        const pathMappings = {
            '@/utils': './utils',
            '@/services': './services',
            '@/types': './types',
            '@/lib': './lib',
            '@/hooks': './hooks',
        };
        let suggestedPath = modulePath;
        for (const [alias, realPath] of Object.entries(pathMappings)) {
            if (modulePath.startsWith(alias)) {
                suggestedPath = modulePath.replace(alias, realPath);
                break;
            }
        }
        const replacementCode = code.replace(new RegExp(`['"]${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'), `'${suggestedPath}'`);
        return {
            error,
            intent: {
                type: 'modify',
                target: 'import',
                severity: 'critical',
                confidence: 85,
                suggestion: `import 경로를 '${suggestedPath}'로 수정`,
            },
            code,
            suggestion: `모듈 '${modulePath}'을(를) 찾을 수 없습니다. 경로를 '${suggestedPath}'로 수정하세요.`,
            replacementCode,
        };
    }
    suggestSignatureFix(error) {
        const { code } = error.context;
        const message = error.message;
        const sigMatch = message.match(/Expected\s+(\d+)\s+argument[s]?,\s+got\s+(\d+)/i);
        if (!sigMatch) {
            return null;
        }
        const [, expected, actual] = sigMatch;
        const expectedCount = parseInt(expected, 10);
        const actualCount = parseInt(actual, 10);
        if (expectedCount > actualCount) {
            const missingCount = expectedCount - actualCount;
            const placeholders = Array(missingCount)
                .fill(null)
                .map((_, i) => `param${actualCount + i + 1}`)
                .join(', ');
            return {
                error,
                intent: {
                    type: 'modify',
                    target: 'call',
                    severity: 'critical',
                    confidence: 80,
                    suggestion: `${missingCount}개의 매개변수 추가`,
                },
                code,
                suggestion: `${expectedCount}개의 인자가 필요하지만 ${actualCount}개만 제공되었습니다.`,
                replacementCode: `${placeholders}`,
            };
        }
        else {
            return {
                error,
                intent: {
                    type: 'remove',
                    target: 'param',
                    severity: 'major',
                    confidence: 75,
                    suggestion: `${actualCount - expectedCount}개의 불필요한 매개변수 제거`,
                },
                code,
                suggestion: `${expectedCount}개의 인자만 필요하지만 ${actualCount}개가 제공되었습니다.`,
                replacementCode: '',
            };
        }
    }
    suggestAsyncFix(error) {
        const { code } = error.context;
        const asyncCallMatch = code.match(/(\w+)\s*\(/);
        if (!asyncCallMatch) {
            return null;
        }
        const replacementCode = code.replace(/^(\s*)/, '$1await ');
        return {
            error,
            intent: {
                type: 'add',
                target: 'call',
                severity: 'critical',
                confidence: 90,
                suggestion: 'await 키워드 추가',
            },
            code,
            suggestion: 'Promise가 await 없이 반환됩니다. await 키워드를 추가하세요.',
            replacementCode,
        };
    }
    suggestMockFix(error) {
        const { code } = error.context;
        const message = error.message;
        if (!message.includes('toHaveBeenCalledWith') && !message.includes('Mock')) {
            return null;
        }
        if (message.includes('not been called')) {
            return {
                error,
                intent: {
                    type: 'modify',
                    target: 'call',
                    severity: 'major',
                    confidence: 70,
                    suggestion: 'Mock 호출 확인 - 함수가 실제로 호출되는지 검증',
                },
                code,
                suggestion: 'Mock이 예상대로 호출되지 않았습니다. 테스트 코드 또는 구현을 검토하세요.',
                replacementCode: code,
            };
        }
        return {
            error,
            intent: {
                type: 'modify',
                target: 'call',
                severity: 'major',
                confidence: 65,
                suggestion: 'Mock 호출 인자 검증',
            },
            code,
            suggestion: 'Mock이 예상한 인자로 호출되지 않았습니다. 테스트 기대값을 조정하세요.',
            replacementCode: code,
        };
    }
    filterByConfidence(suggestions, minConfidence = 50) {
        return suggestions.filter(s => s.intent.confidence >= minConfidence);
    }
    groupByConfidenceLevel(suggestions) {
        return {
            high: suggestions.filter(s => s.intent.confidence >= 80),
            medium: suggestions.filter(s => s.intent.confidence >= 50 && s.intent.confidence < 80),
            low: suggestions.filter(s => s.intent.confidence < 50),
        };
    }
    groupBySeverity(suggestions) {
        return {
            critical: suggestions.filter(s => s.intent.severity === 'critical'),
            major: suggestions.filter(s => s.intent.severity === 'major'),
            minor: suggestions.filter(s => s.intent.severity === 'minor'),
        };
    }
    summarizeFixes(suggestions) {
        const grouped = this.groupByConfidenceLevel(suggestions);
        let summary = `📊 수정 제안 결과:\n`;
        summary += `  ├─ 완벽 자동 수정 가능 (신뢰도 80%+): ${grouped.high.length}개\n`;
        summary += `  ├─ 부분 수정 (신뢰도 50-79%): ${grouped.medium.length}개\n`;
        summary += `  └─ 수동 수정 필요 (신뢰도 < 50%): ${grouped.low.length}개\n\n`;
        if (grouped.high.length > 0) {
            summary += `✅ 자동 수정 가능:\n`;
            grouped.high.forEach((fix, idx) => {
                summary += `  ${idx + 1}. [${fix.error.file}:${fix.error.line}] ${fix.intent.suggestion}\n`;
            });
        }
        if (grouped.medium.length > 0) {
            summary += `\n⚠️ 사용자 확인 필요:\n`;
            grouped.medium.forEach((fix, idx) => {
                summary += `  ${idx + 1}. [${fix.error.file}:${fix.error.line}] ${fix.intent.suggestion}\n`;
            });
        }
        if (grouped.low.length > 0) {
            summary += `\n❌ 수동 수정 권장:\n`;
            grouped.low.forEach((fix, idx) => {
                summary += `  ${idx + 1}. [${fix.error.file}:${fix.error.line}] ${fix.suggestion}\n`;
            });
        }
        return summary;
    }
}
exports.FixSuggester = FixSuggester;
//# sourceMappingURL=FixSuggester.js.map