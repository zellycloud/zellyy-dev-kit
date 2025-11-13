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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInit = runInit;
exports.setupInitCommand = setupInitCommand;
const chalk_1 = __importDefault(require("chalk"));
const prompt_1 = require("../utils/prompt");
const logger_1 = require("../utils/logger");
const file_system_1 = require("../utils/file-system");
const path = __importStar(require("path"));
const child_process = __importStar(require("child_process"));
const storage_1 = require("../quality/storage");
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
        const projectDir = path.resolve(process.cwd(), config.projectName);
        logger_1.Logger.info(`📁 프로젝트 디렉터리 생성 중: ${chalk_1.default.cyan(config.projectName)}`);
        await file_system_1.FileSystem.ensureDir(projectDir);
        logger_1.Logger.info('💾 SQLite 로컬 저장소 초기화 중...');
        const storage = (0, storage_1.createSqliteStorage)(config.projectName);
        storage.close();
        result.filesCreated.push(`~/.zy/projects/${config.projectName}/metrics.db`);
        if (config.enableOpenSpec) {
            logger_1.Logger.info('📄 OpenSpec 템플릿 복사 중...');
            await createOpenSpecTemplate(projectDir);
            result.filesCreated.push('openspec/project.md');
        }
        else {
            result.skipped.push('OpenSpec');
        }
        if (config.enableBacklog) {
            logger_1.Logger.info('📋 Backlog 템플릿 복사 중...');
            await createBacklogTemplate(projectDir);
            result.filesCreated.push('backlog/backlog.md');
        }
        else {
            result.skipped.push('Backlog');
        }
        if (config.tdd.enableVitest) {
            logger_1.Logger.info('🧪 vitest 설정 파일 생성 중...');
            await createVitestConfig(projectDir, config.tdd.coverageThreshold);
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
            await createPreCommitHook(projectDir, config);
            result.filesCreated.push('.husky/pre-commit');
            if (config.qualityGates.enableCommitMsgValidation) {
                await createCommitMsgHook(projectDir);
                result.filesCreated.push('.husky/commit-msg');
            }
        }
        else {
            result.skipped.push('Pre-commit hooks');
        }
        logger_1.Logger.info('📦 package.json 생성 중...');
        await createPackageJson(projectDir, config);
        result.filesCreated.push('package.json');
        await createGitignore(projectDir);
        result.filesCreated.push('.gitignore');
        result.nextSteps = [
            `cd ${config.projectName}`,
            'npm install (의존성 설치)',
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
async function createOpenSpecTemplate(projectDir) {
    const openspecDir = path.join(projectDir, 'openspec');
    await file_system_1.FileSystem.ensureDir(openspecDir);
    const projectMdContent = `# ${path.basename(projectDir)} Project Specification

## 프로젝트 개요

이 프로젝트는 \`zellyy-dev-kit\`로 초기화되었습니다.

## 기술 스택

- TypeScript
- Vitest
- ESLint + Prettier

## OpenSpec 사용법

OpenSpec은 사양 기반 개발(Specification-First Development)을 지원합니다.

1. \`openspec/changes/\` 디렉터리에 변경 제안 작성
2. \`npm run openspec:validate\` 로 검증
3. \`npm run openspec:apply\` 로 적용
4. \`npm run openspec:archive\` 로 아카이브

더 자세한 정보는 [zellyy-dev-kit](https://github.com/zellycloud/zellyy-dev-kit)을 참고하세요.
`;
    await file_system_1.FileSystem.writeFile(path.join(openspecDir, 'project.md'), projectMdContent);
}
async function createBacklogTemplate(projectDir) {
    const backlogDir = path.join(projectDir, 'backlog');
    await file_system_1.FileSystem.ensureDir(backlogDir);
    const backlogMdContent = `# Backlog - ${path.basename(projectDir)}

프로젝트의 작업 목록을 관리합니다.

## 작업 생성

\`\`\`bash
backlog task create "작업 제목"
  --description "상세 설명"
  --priority "high|medium|low"
  --status "To Do|In Progress|Done"
\`\`\`

## 작업 보기

\`\`\`bash
backlog task list
backlog task view [task-id]
\`\`\`

더 자세한 정보는 [backlog CLI](https://github.com/zellycloud/backlog)을 참고하세요.
`;
    await file_system_1.FileSystem.writeFile(path.join(backlogDir, 'backlog.md'), backlogMdContent);
}
async function createVitestConfig(projectDir, coverageThreshold) {
    const vitestConfigContent = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: ${coverageThreshold},
      functions: ${coverageThreshold},
      branches: ${coverageThreshold},
      statements: ${coverageThreshold},
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
      ],
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
`;
    await file_system_1.FileSystem.writeFile(path.join(projectDir, 'vitest.config.ts'), vitestConfigContent);
}
async function createPreCommitHook(projectDir, config) {
    const huskyDir = path.join(projectDir, '.husky');
    await file_system_1.FileSystem.ensureDir(huskyDir);
    let hookContent = '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\n';
    if (config.qualityGates.autoFixLint) {
        hookContent += 'npm run lint:fix\n';
    }
    else {
        hookContent += 'npm run lint\n';
    }
    if (config.qualityGates.autoFormatCode) {
        hookContent += 'npm run format:fix\n';
    }
    hookContent += 'npm run test:coverage\n';
    const preCommitPath = path.join(huskyDir, 'pre-commit');
    await file_system_1.FileSystem.writeFile(preCommitPath, hookContent);
    try {
        child_process.execSync(`chmod +x "${preCommitPath}"`);
    }
    catch {
    }
}
async function createCommitMsgHook(projectDir) {
    const huskyDir = path.join(projectDir, '.husky');
    await file_system_1.FileSystem.ensureDir(huskyDir);
    const hookContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Commit message format validation
# Format: type(scope): description
# Example: feat(auth): add login functionality

MSG_FILE=$1
COMMIT_MSG=$(cat $MSG_FILE)

# Check for Backlog ID (optional)
if ! echo "$COMMIT_MSG" | grep -qE '(refs|closes|fixes)\\s+#[0-9]+|^[a-z]+\\([a-z-]*\\):|^Merge'; then
  if ! echo "$COMMIT_MSG" | grep -qE '^(Merge|chore|docs|style): '; then
    echo "❌ Commit message must follow format: type(scope): description"
    echo "   Example: feat(auth): add login (refs #123)"
    exit 1
  fi
fi

exit 0
`;
    const commitMsgPath = path.join(huskyDir, 'commit-msg');
    await file_system_1.FileSystem.writeFile(commitMsgPath, hookContent);
    try {
        child_process.execSync(`chmod +x "${commitMsgPath}"`);
    }
    catch {
    }
}
async function createPackageJson(projectDir, config) {
    const packageJson = {
        name: config.projectName,
        version: '0.1.0',
        description: `Project initialized with zellyy-dev-kit (${config.projectType})`,
        type: 'module',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview',
            test: 'vitest',
            'test:watch': 'vitest --watch',
            'test:coverage': 'vitest --coverage',
            lint: 'eslint src/**/*.ts',
            'lint:fix': 'eslint src/**/*.ts --fix',
            format: 'prettier --check src',
            'format:fix': 'prettier --write src',
        },
        devDependencies: {
            '@types/node': '^20.0.0',
            '@typescript-eslint/eslint-plugin': '^6.0.0',
            '@typescript-eslint/parser': '^6.0.0',
            eslint: '^8.0.0',
            prettier: '^3.0.0',
            typescript: '^5.0.0',
            vite: '^5.0.0',
            vitest: '^1.0.0',
            ...(config.tdd.enableUI && { '@vitest/ui': '^1.0.0' }),
        },
        dependencies: {},
    };
    await file_system_1.FileSystem.writeFile(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}
async function createGitignore(projectDir) {
    const gitignoreContent = `# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build output
dist/
build/
*.tsbuildinfo

# Test coverage
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Temporary files
.tmp/
tmp/
`;
    await file_system_1.FileSystem.writeFile(path.join(projectDir, '.gitignore'), gitignoreContent);
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
function setupInitCommand(program) {
    program
        .command('init')
        .description('프로젝트 초기화 (OpenSpec + Backlog + TDD 인프라)')
        .option('--full', '전체 인프라 구축')
        .action(async (options) => {
        await runInit(options);
    });
}
//# sourceMappingURL=init.js.map