"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAnalyzer = void 0;
class ErrorAnalyzer {
    patterns = [
        {
            name: 'assertion-expected',
            regex: /expected\s*\(\s*(.+?)\s*\)\s*\.to(?:Equal|Be)\s*\(\s*(.+?)\s*\)/i,
            type: 'assertion',
            extractValues: (match) => ({
                actual: match[1]?.trim(),
                expected: match[2]?.trim(),
            }),
        },
        {
            name: 'assertion-received',
            regex: /received:\s*(.+?)\s+expected:\s*(.+?)(?:\n|$)/i,
            type: 'assertion',
            extractValues: (match) => ({
                actual: match[1]?.trim(),
                expected: match[2]?.trim(),
            }),
        },
        {
            name: 'property-not-exist',
            regex: /Property\s+['"](.+?)['"]\s+does\s+not\s+exist/i,
            type: 'type',
            extractValues: (match) => ({
                expected: `Property '${match[1]}' exists`,
                actual: `Property '${match[1]}' not found`,
            }),
        },
        {
            name: 'cannot-find-module',
            regex: /Cannot find module\s+['"](.+?)['"]/i,
            type: 'import',
            extractValues: (match) => ({
                expected: `Module '${match[1]}' imported`,
                actual: `Module '${match[1]}' not found`,
            }),
        },
        {
            name: 'expected-arguments',
            regex: /Expected\s+(\d+)\s+argument[s]?,\s+got\s+(\d+)/i,
            type: 'signature',
            extractValues: (match) => ({
                expected: `${match[1]} arguments`,
                actual: `${match[2]} arguments`,
            }),
        },
        {
            name: 'promise-not-awaited',
            regex: /Promise\s+(?:is\s+)?not\s+awaited/i,
            type: 'async',
            extractValues: () => ({
                expected: 'Promise is awaited',
                actual: 'Promise not awaited',
            }),
        },
        {
            name: 'mock-called-with',
            regex: /toHaveBeenCalledWith(?:Error)?[\s\S]*?not\s+satisfied/i,
            type: 'mock',
            extractValues: () => ({
                expected: 'Mock called with expected arguments',
                actual: 'Mock call assertions not satisfied',
            }),
        },
        {
            name: 'type-mismatch',
            regex: /Type\s+['"](.+?)['"]\s+is\s+not\s+assignable\s+to\s+type\s+['"](.+?)['"]/i,
            type: 'type',
            extractValues: (match) => ({
                actual: match[1]?.trim(),
                expected: match[2]?.trim(),
            }),
        },
    ];
    parseErrors(errorOutput) {
        const errors = [];
        const errorBlocks = this.splitErrorBlocks(errorOutput);
        for (const block of errorBlocks) {
            const parsed = this.parseErrorBlock(block);
            if (parsed) {
                errors.push(parsed);
            }
        }
        return errors;
    }
    splitErrorBlocks(output) {
        let blocks = [];
        const markerBlocks = output.split(/\n(?=\s*❌|(?:\s*\w+\s+FAIL))/);
        if (markerBlocks.length > 1) {
            blocks = markerBlocks;
        }
        else {
            blocks = output.split(/(?=\s*at\s+.+?:\d+:\d+)/);
        }
        blocks = blocks.filter(block => block.trim().length > 0);
        return blocks;
    }
    parseErrorBlock(block) {
        const fileMatch = block.match(/(?:at\s+)?(.+?\.(?:ts|tsx|js|jsx)):(\d+):(\d+)/);
        if (!fileMatch) {
            return this.parseFallbackError(block);
        }
        const file = fileMatch[1];
        const line = parseInt(fileMatch[2], 10);
        const column = parseInt(fileMatch[3], 10);
        const message = this.extractMessage(block);
        const code = this.extractCodeLine(block);
        const { type, expected, actual } = this.classifyError(block);
        return {
            type,
            message,
            file,
            line,
            column,
            context: {
                code,
                expected,
                actual,
            },
        };
    }
    parseFallbackError(block) {
        const message = this.extractMessage(block);
        const { type, expected, actual } = this.classifyError(block);
        return {
            type,
            message,
            file: 'unknown',
            line: 0,
            column: 0,
            context: {
                code: message,
                expected,
                actual,
            },
        };
    }
    extractMessage(block) {
        const lines = block.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 5 &&
                !trimmed.startsWith('❌') &&
                !trimmed.startsWith('at ') &&
                !trimmed.includes('.ts:') &&
                !trimmed.includes('.js:')) {
                return trimmed.substring(0, 200);
            }
        }
        return 'Test failed';
    }
    extractCodeLine(block) {
        const lines = block.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (/^\s+(?:expect|\.(?:to|assert)|new|const|let|var|return)/.test(line) ||
                /[\.()=]/.test(line)) {
                return line.trim().substring(0, 150);
            }
        }
        return '';
    }
    classifyError(block) {
        const lowerBlock = block.toLowerCase();
        for (const pattern of this.patterns) {
            const regex = new RegExp(pattern.regex.source, 'i');
            const match = block.match(regex);
            if (match) {
                const values = pattern.extractValues(match);
                return {
                    type: pattern.type,
                    ...values,
                };
            }
        }
        if (lowerBlock.includes('cannot find module') || lowerBlock.includes('module not found')) {
            return { type: 'import' };
        }
        if (lowerBlock.includes('mock') || lowerBlock.includes('tohavebeencalledwith')) {
            return {
                type: 'mock',
                expected: 'mock called',
                actual: 'not called or wrong args',
            };
        }
        if (lowerBlock.includes('property') || lowerBlock.includes('does not exist')) {
            return { type: 'type' };
        }
        if (lowerBlock.includes('argument') || lowerBlock.includes('expected') && lowerBlock.includes('got')) {
            return { type: 'signature' };
        }
        if (lowerBlock.includes('promise') || lowerBlock.includes('await')) {
            return { type: 'async' };
        }
        if (lowerBlock.includes('expected') || lowerBlock.includes('received')) {
            return { type: 'assertion' };
        }
        return { type: 'other' };
    }
    calculateConfidence(error) {
        let score = 50;
        let fieldScore = 0;
        if (error.file && error.file !== 'unknown')
            fieldScore += 10;
        if (error.line > 0)
            fieldScore += 10;
        if (error.context.expected && error.context.actual)
            fieldScore += 10;
        score += fieldScore;
        if (error.type !== 'other') {
            score += 20;
        }
        if (error.message.length > 20) {
            score += Math.min(10, Math.floor(error.message.length / 20));
        }
        return Math.min(100, score);
    }
    calculateAverageConfidence(errors) {
        if (errors.length === 0)
            return 0;
        const total = errors.reduce((sum, err) => sum + this.calculateConfidence(err), 0);
        return Math.round(total / errors.length);
    }
    calculateConfidenceForAll(errors) {
        return errors.map(error => ({
            ...error,
            confidence: this.calculateConfidence(error),
        }));
    }
}
exports.ErrorAnalyzer = ErrorAnalyzer;
//# sourceMappingURL=ErrorAnalyzer.js.map