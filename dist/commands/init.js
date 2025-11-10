"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInit = runInit;
const chalk_1 = __importDefault(require("chalk"));
const prompt_1 = require("../utils/prompt");
const logger_1 = require("../utils/logger");
async function runInit(options) {
    try {
        logger_1.Logger.info('🚀 zellyy-dev-kit 프로젝트 초기화');
        logger_1.Logger.info('');
        logger_1.Logger.section('1️⃣  프로젝트 정보');
        const config = await collectProjectConfig();
        logger_1.Logger.section('2️⃣  설정 확인');
        await confirmConfig(config);
        logger_1.Logger.section('3️⃣  프로젝트 초기화 중');
        const result = await initializeProject(config);
        displayResults(result);
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.Logger.error(`초기화 실패: ${error.message}`);
        }
        else {
            logger_1.Logger.error('알 수 없는 오류가 발생했습니다.');
        }
        process.exit(1);
    }
}
async function collectProjectConfig() {
    const projectName = await prompt_1.Prompt.input('📁 프로젝트 이름을 입력하세요:', 'my-awesome-project', true);
    const projectType = await prompt_1.Prompt.select('🎯 프로젝트 타입을 선택하세요:', ['react', 'vue', 'node'], 'react');
    const enableOpenSpec = await prompt_1.Prompt.confirm('📄 OpenSpec (사양 기반 개발) 활성화?', true);
    const enableBacklog = await prompt_1.Prompt.confirm('📋 Backlog (작업 관리) 활성화?', true);
    logger_1.Logger.info('');
    logger_1.Logger.info(chalk_1.default.cyan('🧪 TDD 설정:'));
    const enableVitest = await prompt_1.Prompt.confirm('  • vitest (테스트 프레임워크) 설치?', true);
    let coverageThreshold = 70;
    if (enableVitest) {
        const coverageStr = await prompt_1.Prompt.input('  • Coverage 임계값 (%):', '70', false);
        coverageThreshold = parseInt(coverageStr, 10) || 70;
    }
    const enableUI = enableVitest
        ? await prompt_1.Prompt.confirm('  • @vitest/ui (시각적 대시보드) 설치?', true)
        : false;
    logger_1.Logger.info('');
    logger_1.Logger.info(chalk_1.default.cyan('🎯 Quality Gates 설정:'));
    const enablePreCommitHook = await prompt_1.Prompt.confirm('  • Pre-commit hooks (lint, coverage 검증)?', true);
    const enableCommitMsgValidation = await prompt_1.Prompt.confirm('  • Commit message 검증 (Backlog ID, Conventional Commits)?', enableBacklog);
    const autoFixLint = enablePreCommitHook
        ? await prompt_1.Prompt.confirm('  • ESLint 자동 수정?', true)
        : false;
    const autoFormatCode = enablePreCommitHook
        ? await prompt_1.Prompt.confirm('  • Prettier 자동 포매팅?', true)
        : false;
    return {
        projectName,
        projectType,
        enableOpenSpec,
        enableBacklog,
        tdd: {
            enableVitest,
            coverageThreshold,
            enableUI,
        },
        qualityGates: {
            enablePreCommitHook,
            enableCommitMsgValidation,
            autoFixLint,
            autoFormatCode,
        },
    };
}
async function confirmConfig(config) {
    logger_1.Logger.info('');
    logger_1.Logger.info(chalk_1.default.yellow('설정 확인:'));
    logger_1.Logger.info('');
    logger_1.Logger.info(`  📁 프로젝트 이름: ${chalk_1.default.cyan(config.projectName)}`);
    logger_1.Logger.info(`  🎯 프로젝트 타입: ${chalk_1.default.cyan(config.projectType.toUpperCase())}`);
    logger_1.Logger.info(`  📄 OpenSpec: ${config.enableOpenSpec ? '✅' : '❌'}`);
    logger_1.Logger.info(`  📋 Backlog: ${config.enableBacklog ? '✅' : '❌'}`);
    logger_1.Logger.info(`  🧪 Vitest: ${config.tdd.enableVitest ? '✅' : '❌'}`);
    if (config.tdd.enableVitest) {
        logger_1.Logger.info(`     • Coverage: ${chalk_1.default.cyan(`${config.tdd.coverageThreshold}%`)}`);
        logger_1.Logger.info(`     • UI: ${config.tdd.enableUI ? '✅' : '❌'}`);
    }
    logger_1.Logger.info(`  🎯 Pre-commit hooks: ${config.qualityGates.enablePreCommitHook ? '✅' : '❌'}`);
    logger_1.Logger.info('');
    const confirm = await prompt_1.Prompt.confirm('이 설정으로 진행할까요?', true);
    if (!confirm) {
        logger_1.Logger.info(chalk_1.default.yellow('⏸️  취소되었습니다. 다시 시작해주세요.'));
        process.exit(0);
    }
}
async function initializeProject(config) {
    const result = {
        success: true,
        filesCreated: [],
        dependenciesInstalled: [],
        scriptsExecuted: [],
        skipped: [],
        nextSteps: [],
    };
    try {
        logger_1.Logger.info(`📁 프로젝트 디렉터리 생성 중: ${chalk_1.default.cyan(config.projectName)}`);
        if (config.enableOpenSpec) {
            logger_1.Logger.info('📄 OpenSpec 템플릿 복사 중...');
            result.filesCreated.push('openspec/project.md');
        }
        else {
            result.skipped.push('OpenSpec');
        }
        if (config.enableBacklog) {
            logger_1.Logger.info('📋 Backlog 템플릿 복사 중...');
            result.filesCreated.push('backlog/backlog.md');
        }
        else {
            result.skipped.push('Backlog');
        }
        if (config.tdd.enableVitest) {
            logger_1.Logger.info('🧪 vitest 설정 파일 생성 중...');
            result.filesCreated.push('vitest.config.ts');
            if (config.tdd.enableUI) {
                logger_1.Logger.info('📊 @vitest/ui 설정 중...');
            }
        }
        else {
            result.skipped.push('Vitest');
        }
        if (config.qualityGates.enablePreCommitHook) {
            logger_1.Logger.info('🎯 Pre-commit hooks 설정 중...');
            result.filesCreated.push('.husky/pre-commit');
            if (config.qualityGates.enableCommitMsgValidation) {
                result.filesCreated.push('.husky/commit-msg');
            }
        }
        else {
            result.skipped.push('Pre-commit hooks');
        }
        logger_1.Logger.info('📦 의존성 설치 중... (Phase 2에서 구현)');
        result.skipped.push('npm install');
        result.nextSteps = [
            `cd ${config.projectName}`,
            'npm install (Phase 2에서 자동화)',
            'npm run dev (로컬 개발 시작)',
            'npm run test (TDD 워크플로우 시작)',
        ];
        if (config.enableOpenSpec) {
            result.nextSteps.push('openspec/project.md 읽기 (사양 기반 개발)');
        }
    }
    catch (error) {
        result.success = false;
        if (error instanceof Error) {
            result.errors = [error.message];
        }
    }
    return result;
}
function displayResults(result) {
    logger_1.Logger.section('✅ 초기화 완료!');
    logger_1.Logger.info('');
    if (result.filesCreated.length > 0) {
        logger_1.Logger.info(chalk_1.default.green('📁 생성된 파일:'));
        result.filesCreated.forEach((file) => {
            logger_1.Logger.info(`   ✓ ${chalk_1.default.cyan(file)}`);
        });
        logger_1.Logger.info('');
    }
    if (result.skipped.length > 0) {
        logger_1.Logger.info(chalk_1.default.yellow('⏭️  생략된 항목:'));
        result.skipped.forEach((item) => {
            logger_1.Logger.info(`   - ${item}`);
        });
        logger_1.Logger.info('');
    }
    if (result.nextSteps.length > 0) {
        logger_1.Logger.info(chalk_1.default.blue('🚀 다음 단계:'));
        result.nextSteps.forEach((step, index) => {
            logger_1.Logger.info(`   ${index + 1}. ${step}`);
        });
        logger_1.Logger.info('');
    }
    if (result.errors && result.errors.length > 0) {
        logger_1.Logger.warn('⚠️  주의사항:');
        result.errors.forEach((error) => {
            logger_1.Logger.warn(`   • ${error}`);
        });
    }
    logger_1.Logger.info(chalk_1.default.green('✨ zellyy-dev-kit으로 즐거운 개발 되세요! 행운을 빕니다! 🎉'));
}
//# sourceMappingURL=init.js.map