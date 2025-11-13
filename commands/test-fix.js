"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTestFixCommand = registerTestFixCommand;
exports.setupTestFixCommand = setupTestFixCommand;
const TestFixerAgent_1 = require("../core/agents/TestFixerAgent");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function registerTestFixCommand(program) {
    program
        .command('test:fix [pattern]')
        .description('실패한 테스트를 자동으로 분석하고 수정 제안을 생성합니다')
        .option('-v, --verbose', '상세 출력')
        .option('-a, --auto-apply', '신뢰도 80% 이상의 제안만 자동 적용 (확인 없이)')
        .option('-r, --report', '리포트 파일만 생성 (콘솔 출력 안 함)')
        .option('-m, --min-confidence <number>', '최소 신뢰도 점수 (기본: 50)', '50')
        .action(async (pattern, options) => {
        try {
            await executeTestFix(pattern, options);
        }
        catch (error) {
            console.error('❌ 에러 발생:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });
}
async function executeTestFix(pattern, options) {
    const agent = new TestFixerAgent_1.TestFixerAgent();
    const testFixOptions = {
        pattern,
        verbose: options.verbose || false,
        autoApply: options.autoApply || false,
        report: options.report || false,
        minConfidence: parseInt(options.minConfidence || '50', 10),
    };
    const result = await agent.execute(testFixOptions);
    if (options.report || options.autoApply) {
        const reportPath = path.join(process.cwd(), 'test-fix-report.md');
        const report = agent.generateDetailedReport(result);
        fs.writeFileSync(reportPath, report, 'utf-8');
        console.log(`📄 리포트가 저장되었습니다: ${reportPath}\n`);
    }
    if (options.autoApply && result.suggestions.length > 0) {
        const autoAppliable = agent.getAutoAppliableSuggestions(result.suggestions);
        if (autoAppliable.length > 0) {
            console.log(`\n💾 ${autoAppliable.length}개의 제안을 자동으로 적용합니다...\n`);
            autoAppliable.forEach((suggestion, idx) => {
                console.log(`  ${idx + 1}. [${suggestion.error.file}] ${suggestion.intent.suggestion}`);
            });
            console.log('\n✅ 자동 적용 완료! 변경 사항을 확인하세요.\n');
        }
    }
    if (!options.report) {
        printSummary(result);
    }
}
function printSummary(result) {
    console.log('\n' + '='.repeat(60));
    console.log('📈 최종 요약');
    console.log('='.repeat(60) + '\n');
    const grouped = {
        high: result.suggestions.filter((s) => s.intent.confidence >= 80),
        medium: result.suggestions.filter((s) => s.intent.confidence >= 50 && s.intent.confidence < 80),
        low: result.suggestions.filter((s) => s.intent.confidence < 50),
    };
    console.log(`🎯 신뢰도별 분류:\n`);
    console.log(`  ✅ 자동 수정 가능: ${grouped.high.length}개 (80%+)`);
    console.log(`  ⚠️ 확인 필요: ${grouped.medium.length}개 (50-79%)`);
    console.log(`  ❌ 수동 수정: ${grouped.low.length}개 (< 50%)\n`);
    if (grouped.high.length > 0) {
        console.log(`💡 다음 명령어로 자동 적용할 수 있습니다:`);
        console.log(`   zellyy-dev-kit test:fix ${result.suggestions.length > 0 ? '--auto-apply' : ''}\n`);
    }
    console.log('='.repeat(60) + '\n');
}
function setupTestFixCommand(program) {
    registerTestFixCommand(program);
}
//# sourceMappingURL=test-fix.js.map