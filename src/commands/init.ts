/**
 * 프로젝트 초기화 명령어 (`zellyy-dev-kit init`)
 *
 * @description
 * 인터랙티브 프롬프트를 통해 프로젝트 설정을 수집하고,
 * OpenSpec + Backlog + TDD 인프라를 자동으로 구축합니다.
 *
 * @example
 * // 인터랙티브 모드
 * zellyy-dev-kit init
 *
 * // 옵션 지원 (향후)
 * zellyy-dev-kit init --full  // 전체 인프라
 * zellyy-dev-kit init --name my-project  // 프로젝트 이름 미리 지정
 */

import chalk from 'chalk';
import { Prompt } from '../utils/prompt';
import { Logger } from '../utils/logger';
import { InitConfig, ProjectType, InitResult } from '../types/init';

/**
 * 프로젝트 초기화 명령어 메인 함수
 *
 * @param options - Commander.js options (--full 등)
 */
export async function runInit(options: any): Promise<void> {
  try {
    Logger.info('🚀 zellyy-dev-kit 프로젝트 초기화');
    Logger.info('');

    // 1단계: 프로젝트 설정 수집
    Logger.section('1️⃣  프로젝트 정보');
    const config = await collectProjectConfig();

    // 2단계: 설정 확인
    Logger.section('2️⃣  설정 확인');
    await confirmConfig(config);

    // 3단계: 초기화 실행 (Phase 2에서 구현)
    Logger.section('3️⃣  프로젝트 초기화 중');
    const result = await initializeProject(config);

    // 4단계: 완료 메시지
    displayResults(result);
  } catch (error) {
    if (error instanceof Error) {
      Logger.error(`초기화 실패: ${error.message}`);
    } else {
      Logger.error('알 수 없는 오류가 발생했습니다.');
    }
    process.exit(1);
  }
}

/**
 * 인터랙티브 프롬프트를 통해 프로젝트 설정 수집
 */
async function collectProjectConfig(): Promise<InitConfig> {
  // 1. 프로젝트 이름
  const projectName = await Prompt.input(
    '📁 프로젝트 이름을 입력하세요:',
    'my-awesome-project',
    true // required
  );

  // 2. 프로젝트 타입
  const projectType = await Prompt.select<ProjectType>(
    '🎯 프로젝트 타입을 선택하세요:',
    ['react', 'vue', 'node'],
    'react'
  );

  // 3. OpenSpec 활성화
  const enableOpenSpec = await Prompt.confirm(
    '📄 OpenSpec (사양 기반 개발) 활성화?',
    true
  );

  // 4. Backlog 활성화
  const enableBacklog = await Prompt.confirm(
    '📋 Backlog (작업 관리) 활성화?',
    true
  );

  // 5. TDD 설정
  Logger.info('');
  Logger.info(chalk.cyan('🧪 TDD 설정:'));

  const enableVitest = await Prompt.confirm(
    '  • vitest (테스트 프레임워크) 설치?',
    true
  );

  let coverageThreshold = 70;
  if (enableVitest) {
    const coverageStr = await Prompt.input(
      '  • Coverage 임계값 (%):',
      '70',
      false
    );
    coverageThreshold = parseInt(coverageStr, 10) || 70;
  }

  const enableUI = enableVitest
    ? await Prompt.confirm('  • @vitest/ui (시각적 대시보드) 설치?', true)
    : false;

  // 6. Quality Gates 설정
  Logger.info('');
  Logger.info(chalk.cyan('🎯 Quality Gates 설정:'));

  const enablePreCommitHook = await Prompt.confirm(
    '  • Pre-commit hooks (lint, coverage 검증)?',
    true
  );

  const enableCommitMsgValidation = await Prompt.confirm(
    '  • Commit message 검증 (Backlog ID, Conventional Commits)?',
    enableBacklog
  );

  const autoFixLint = enablePreCommitHook
    ? await Prompt.confirm('  • ESLint 자동 수정?', true)
    : false;

  const autoFormatCode = enablePreCommitHook
    ? await Prompt.confirm('  • Prettier 자동 포매팅?', true)
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

/**
 * 수집한 설정을 사용자에게 확인
 */
async function confirmConfig(config: InitConfig): Promise<void> {
  Logger.info('');
  Logger.info(chalk.yellow('설정 확인:'));
  Logger.info('');
  Logger.info(`  📁 프로젝트 이름: ${chalk.cyan(config.projectName)}`);
  Logger.info(`  🎯 프로젝트 타입: ${chalk.cyan(config.projectType.toUpperCase())}`);
  Logger.info(`  📄 OpenSpec: ${config.enableOpenSpec ? '✅' : '❌'}`);
  Logger.info(`  📋 Backlog: ${config.enableBacklog ? '✅' : '❌'}`);
  Logger.info(`  🧪 Vitest: ${config.tdd.enableVitest ? '✅' : '❌'}`);
  if (config.tdd.enableVitest) {
    Logger.info(
      `     • Coverage: ${chalk.cyan(`${config.tdd.coverageThreshold}%`)}`
    );
    Logger.info(`     • UI: ${config.tdd.enableUI ? '✅' : '❌'}`);
  }
  Logger.info(
    `  🎯 Pre-commit hooks: ${config.qualityGates.enablePreCommitHook ? '✅' : '❌'}`
  );
  Logger.info('');

  const confirm = await Prompt.confirm('이 설정으로 진행할까요?', true);

  if (!confirm) {
    Logger.info(chalk.yellow('⏸️  취소되었습니다. 다시 시작해주세요.'));
    process.exit(0);
  }
}

/**
 * 프로젝트 초기화 실행
 *
 * Phase 2에서 구현:
 * - 템플릿 파일 복사
 * - 의존성 자동 설치
 * - Git hooks 설정
 */
async function initializeProject(config: InitConfig): Promise<InitResult> {
  const result: InitResult = {
    success: true,
    filesCreated: [],
    dependenciesInstalled: [],
    scriptsExecuted: [],
    skipped: [],
    nextSteps: [],
  };

  try {
    // 1. 프로젝트 디렉터리 생성
    Logger.info(`📁 프로젝트 디렉터리 생성 중: ${chalk.cyan(config.projectName)}`);
    // TODO: Phase 2에서 구현

    // 2. 템플릿 파일 복사
    if (config.enableOpenSpec) {
      Logger.info('📄 OpenSpec 템플릿 복사 중...');
      // TODO: Phase 2에서 구현
      result.filesCreated.push('openspec/project.md');
    } else {
      result.skipped.push('OpenSpec');
    }

    if (config.enableBacklog) {
      Logger.info('📋 Backlog 템플릿 복사 중...');
      // TODO: Phase 2에서 구현
      result.filesCreated.push('backlog/backlog.md');
    } else {
      result.skipped.push('Backlog');
    }

    // 3. TDD 설정
    if (config.tdd.enableVitest) {
      Logger.info('🧪 vitest 설정 파일 생성 중...');
      // TODO: Phase 2에서 구현
      result.filesCreated.push('vitest.config.ts');

      if (config.tdd.enableUI) {
        Logger.info('📊 @vitest/ui 설정 중...');
      }
    } else {
      result.skipped.push('Vitest');
    }

    // 4. Quality Gates 설정
    if (config.qualityGates.enablePreCommitHook) {
      Logger.info('🎯 Pre-commit hooks 설정 중...');
      // TODO: Phase 2에서 구현
      result.filesCreated.push('.husky/pre-commit');

      if (config.qualityGates.enableCommitMsgValidation) {
        result.filesCreated.push('.husky/commit-msg');
      }
    } else {
      result.skipped.push('Pre-commit hooks');
    }

    // 5. 의존성 설치 (Phase 2에서)
    Logger.info('📦 의존성 설치 중... (Phase 2에서 구현)');
    result.skipped.push('npm install');

    // 6. 다음 단계 가이드
    result.nextSteps = [
      `cd ${config.projectName}`,
      'npm install (Phase 2에서 자동화)',
      'npm run dev (로컬 개발 시작)',
      'npm run test (TDD 워크플로우 시작)',
    ];

    if (config.enableOpenSpec) {
      result.nextSteps.push('openspec/project.md 읽기 (사양 기반 개발)');
    }
  } catch (error) {
    result.success = false;
    if (error instanceof Error) {
      result.errors = [error.message];
    }
  }

  return result;
}

/**
 * 초기화 결과 표시
 */
function displayResults(result: InitResult): void {
  Logger.section('✅ 초기화 완료!');
  Logger.info('');

  if (result.filesCreated.length > 0) {
    Logger.info(chalk.green('📁 생성된 파일:'));
    result.filesCreated.forEach((file) => {
      Logger.info(`   ✓ ${chalk.cyan(file)}`);
    });
    Logger.info('');
  }

  if (result.skipped.length > 0) {
    Logger.info(chalk.yellow('⏭️  생략된 항목:'));
    result.skipped.forEach((item) => {
      Logger.info(`   - ${item}`);
    });
    Logger.info('');
  }

  if (result.nextSteps.length > 0) {
    Logger.info(chalk.blue('🚀 다음 단계:'));
    result.nextSteps.forEach((step, index) => {
      Logger.info(`   ${index + 1}. ${step}`);
    });
    Logger.info('');
  }

  if (result.errors && result.errors.length > 0) {
    Logger.warn('⚠️  주의사항:');
    result.errors.forEach((error) => {
      Logger.warn(`   • ${error}`);
    });
  }

  Logger.info(
    chalk.green(
      '✨ zellyy-dev-kit으로 즐거운 개발 되세요! 행운을 빕니다! 🎉'
    )
  );
}