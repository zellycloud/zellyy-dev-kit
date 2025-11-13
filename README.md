# zellyy-dev-kit

[English](#english) | [한국어](#korean)

---

<a id="english"></a>

## English

> **Unified Spec-Driven & Test-Driven Development Automation CLI**
>
> Seamlessly integrate OpenSpec, Backlog, and Quality Gates into your development workflow

**Key Differentiator**: Brownfield Support - Gradual adoption to existing projects 🚀

[![npm version](https://img.shields.io/npm/v/zellyy-dev-kit.svg)](https://www.npmjs.com/package/zellyy-dev-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### 📊 Current Status: Phase 2 Complete ✅

**v0.3.0** (2025-11-13):
- ✅ **Quality Gates** (TRUST 5 principles) - Automatic validation
- ✅ **JSON Local Storage** (~/.zy/) - Offline-first metrics, zero-dependency
- ✅ **Dashboard API Integration** (optional) - Push to dashboard
- ✅ **Large Project Safety** - Support 300+ test files, 90% coverage
- ✅ **96+ Test Scenarios** - Comprehensive coverage
- ✅ **3 Documentation Guides** - Complete user guides

**Previous Phase 1** (v0.2.0):
- ✅ Precision Test Fixing (task-150 pattern)
- ✅ OpenSpec Integration (Spec-Driven Development)
- ✅ Backlog Integration (Task Management)

---

### 🎯 Core Features

#### 1. **Quality Gates** (TRUST 5) - NEW in v0.3.0
Auto-validate code quality with 5 validators:

```bash
zy quality:check
# Checks: Coverage (80%), ESLint, Prettier, Secrets, @SPEC/@TEST/@CODE tags
# Coverage: 85% ✅
# ESLint: 0 errors ✅
# Secrets: No API keys found ✅
# Trackability: 100% ✅
```

#### 2. **JSON Local Storage** - NEW in v0.3.0
Store quality metrics locally with offline support (zero-dependency):

```bash
zy quality:check --save-to-db
# Stored at: ~/.zy/projects/my-project/
#   - metrics.json (quality metrics history)
#   - coverage.json (file-level coverage details)
#   - lint-errors.json (lint error tracking)
#   - push-queue.json (offline dashboard queue)

# Push to dashboard (optional)
export ZY_DASHBOARD_URL="https://dashboard.example.com"
export ZY_DASHBOARD_API_KEY="sk-xxx"
zy quality:check --push-to-dashboard
```

#### 3. **Precision Test Fixing** (task-150 pattern)
Automatically fix failing tests in 3-5 minutes using AI

```bash
zy test:fix SmartCategoryService.test.ts
# Before: 6/18 tests passing
# After:  18/18 tests passing ✅
```

#### 4. **OpenSpec Integration**
Spec-driven development workflow automation

```bash
zy openspec:proposal new-feature
zy openspec:validate new-feature --strict
zy openspec:review new-feature  # Multi-Agent Debate
```

#### 5. **Backlog Integration**
Automatically link task management + OpenSpec + Git

```bash
zy task:create "new-feature" --openspec
zy commit "feat: implement new feature"
# → "feat: implement new feature (refs #200)" ✅
```

### 🚀 Quick Start (5 minutes)

#### Installation

```bash
npm install -g zellyy-dev-kit
```

#### Ready to use immediately (no init needed!)

```bash
# Fix failing tests
zy test:fix src/__tests__/YourService.test.ts

# Validate Quality Gates
zy quality:check

# Validate OpenSpec proposal
zy openspec:validate your-proposal --strict
```

**That's it!** Works with existing projects right away.

### 🧬 3 Integrated Technologies

zellyy-dev-kit integrates 3 validated technologies:

#### 1. **establish-tdd-coverage-workflow** (Coverage 70%+)
- Vitest infrastructure setup
- TRUST 5 Quality Gates
- Pre-commit hooks

#### 2. **implement-multi-agent-debate** (3-Agent System)
- TestAgent (test quality validation)
- SecurityAgent (vulnerability analysis)
- PerformanceAgent (performance issue detection)

#### 3. **implement-openspec-review-command** (CI/CD Automation)
- `/openspec:review` slash command
- GitHub Actions integration
- Backlog ↔ OpenSpec traceability chain

**Integrated Benefits**: Apply 3 technologies with a single click

---

### ✨ Why Choose zellyy-dev-kit?

#### ✅ Brownfield-Ready
Gradually adopt into existing projects. Start with small parts.

#### ✅ All-in-One
Unifies OpenSpec (spec-driven development) + Backlog (task management) + Quality Gates into one tool.

#### ✅ Battle-Tested
Built on patterns validated from real-world projects starting from task-150.

**Proof**:
```bash
# 6 failing tests → Fixed in 3-5 minutes ✅
zy test:fix SmartCategoryService.test.ts
```

---

### 📚 Usage Scenarios

#### Scenario 1: Fix Failing Tests Only (Beginner)

```bash
# 1. Install
npm install -g zellyy-dev-kit

# 2. Fix tests
zy test:fix src/__tests__/YourService.test.ts

# 3. Check results
npm run test
```

**Expected Result**: Improve test pass rate within 3-5 minutes

---

#### Scenario 2: OpenSpec Automation (Intermediate)

```bash
# Create proposal
zy openspec:proposal add-new-feature

# Validate spec
zy openspec:validate add-new-feature --strict

# Multi-Agent Debate
zy openspec:review add-new-feature

# Auto-generate tests
zy test:generate --spec openspec/specs/new-feature/spec.md
```

---

#### Scenario 3: Full Integration (Advanced)

```bash
# Project initialization (optional)
zy init

# End-to-End workflow
zy task:create "new-feature" --openspec
zy test:generate --spec openspec/specs/new-feature/spec.md
zy test:watch
zy commit "feat: implement new feature"
zy openspec:archive new-feature
```

---

### 📖 Documentation

#### Official Docs
- **Proposal**: [proposal.md](proposal.md) - zellyy-dev-kit overview
- **Design**: [design.md](design.md) - Architecture details
- **Tasks**: [tasks.md](tasks.md) - Implementation status
- **Migration Guide**: [docs/migration-guide.md](docs/migration-guide.md)

#### Community
- **GitHub**: https://github.com/zellycloud/zellyy-dev-kit (Issues, Discussions)
- **Discord**: https://discord.gg/zellyy-dev-kit (Coming soon)
- **Twitter/X**: @zellyy_dev_kit (Coming soon)

---

### 🛠️ Development (Contributor)

#### Project Structure

```
zellyy-dev-kit/
├── src/
│   ├── cli.ts                  # CLI entry point
│   ├── commands/
│   │   ├── init.ts             # Project initialization
│   │   ├── test-fix.ts         # Precision test fixing
│   │   ├── openspec.ts         # OpenSpec integration
│   │   ├── task.ts             # Backlog integration
│   │   └── quality.ts          # Quality Gates
│   ├── core/
│   │   ├── ast-analyzer.ts     # TypeScript AST analysis
│   │   ├── openspec-parser.ts  # OpenSpec parsing
│   │   ├── backlog-parser.ts   # Backlog parsing
│   │   └── git-integration.ts  # Git commit messages
│   └── utils/
│       ├── logger.ts           # CLI logging
│       ├── file-system.ts      # File read/write
│       └── prompt.ts           # Interactive prompts
├── tests/
├── openspec/                   # OpenSpec specifications
├── backlog/                    # Backlog task management
├── package.json
├── tsconfig.json
└── README.md
```

#### Local Development

```bash
# 1. Clone repository
git clone https://github.com/zellycloud/zellyy-dev-kit.git
cd zellyy-dev-kit

# 2. Install dependencies
npm install

# 3. Build (Watch mode)
npm run dev

# 4. Local testing
npm link
zellyy-dev-kit --help

# 5. Run tests
npm run test
npm run test:coverage
```

### Dogfooding

Develop zellyy-dev-kit using zy:

```bash
# 1. Create OpenSpec proposal
zy openspec:proposal add-new-command

# 2. Generate tests
zy test:generate --spec openspec/specs/new-command/spec.md

# 3. Fix tests
zy test:fix src/__tests__/NewCommand.test.ts

# 4. Quality Gates
zy quality:check

# 5. Commit
zy commit "feat: add new command"
```

---

### 🤝 Contributing

Contributions are always welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`zy commit "feat: Add AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md) ✅

---

### 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

### 💬 Need Help?

- **GitHub Issues**: https://github.com/zellycloud/zellyy-dev-kit/issues
- **Discord**: `#help` channel (Coming soon)
- **Email**: support@zellyy.com

**Response Time**:
- Critical (Production issues): Within 24 hours
- High (Feature broken): Within 3 days
- Medium (Enhancement): Within 2 weeks

---

**Made with ❤️ by Zellyy Team**

---

<a id="korean"></a>

## 한국어

> **OpenSpec & Backlog를 통합한 SDD & TDD 개발 자동화 CLI**
>
> Spec-Driven과 Test-Driven 개발을 하나의 도구로 자동화하세요

**핵심 차별화**: Brownfield 지원 - 기존 프로젝트에 점진적 도입 가능 🚀

[![npm version](https://img.shields.io/npm/v/zellyy-dev-kit.svg)](https://www.npmjs.com/package/zellyy-dev-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### 📊 현재 상태: Phase 2 완료 ✅

**v0.3.0** (2025-11-13):
- ✅ **Quality Gates** (TRUST 5 원칙) - 자동 품질 검증
- ✅ **JSON 로컬 저장소** (~/.zy/) - 오프라인 메트릭, 의존성 제로
- ✅ **대시보드 API 통합** (선택사항) - 대시보드 푸시
- ✅ **대규모 프로젝트 안전장치** - 300+ 테스트 파일, 90% 커버리지 지원
- ✅ **96+ 테스트 시나리오** - 포괄적 테스트
- ✅ **3개 문서 가이드** - 완벽한 사용자 가이드

**이전 Phase 1** (v0.2.0):
- ✅ Precision Test Fixing (task-150 패턴)
- ✅ OpenSpec 통합 (사양 기반 개발)
- ✅ Backlog 통합 (작업 관리)

---

## 🎯 핵심 기능

### 1. **Quality Gates** (TRUST 5) - v0.3.0 신규
5가지 검증기로 자동 품질 검증:

```bash
zy quality:check
# 검증: Coverage (80%), ESLint, Prettier, Secrets, @SPEC/@TEST/@CODE 태그
# Coverage: 85% ✅
# ESLint: 0 errors ✅
# Secrets: API 키 미탐지 ✅
# 추적성: 100% ✅
```

### 2. **JSON 로컬 저장소** - v0.3.0 신규
품질 메트릭을 로컬에 저장 (오프라인 지원, 의존성 제로):

```bash
zy quality:check --save-to-db
# 저장 위치: ~/.zy/projects/my-project/
#   - metrics.json (품질 메트릭 히스토리)
#   - coverage.json (파일별 커버리지 상세)
#   - lint-errors.json (린트 에러 추적)
#   - push-queue.json (오프라인 대시보드 큐)

# 대시보드로 푸시 (선택사항)
export ZY_DASHBOARD_URL="https://dashboard.example.com"
export ZY_DASHBOARD_API_KEY="sk-xxx"
zy quality:check --push-to-dashboard
```

### 3. **Precision Test Fixing** (task-150 패턴)
실패한 테스트를 AI 기반으로 3-5분 내 자동 수정

```bash
zy test:fix SmartCategoryService.test.ts
# Before: 6/18 tests passing
# After:  18/18 tests passing ✅
```

### 4. **OpenSpec 통합**
사양 기반 개발 워크플로우 자동화

```bash
zy openspec:proposal new-feature
zy openspec:validate new-feature --strict
zy openspec:review new-feature  # Multi-Agent Debate
```

### 5. **TDD 워크플로우**
RED → GREEN → REFACTOR 사이클 자동화

```bash
zy test:generate --spec openspec/specs/feature.md
zy test:watch
```

### 4. **Quality Gates** (TRUST 5)
커버리지 70%, ESLint, Security scan 자동 검증

```bash
zy quality:check
# Coverage: 72% ✅
# ESLint: 0 errors ✅
# Security: 0 vulnerabilities ✅
```

### 5. **Backlog 통합**
작업 관리 + OpenSpec + Git 자동 연결

```bash
zy task:create "새 기능" --openspec
zy commit "feat: 새 기능 구현"
# → "feat: 새 기능 구현 (refs #200)" ✅
```

---

## 🚀 빠른 시작 (5분)

### 설치

```bash
npm install -g zellyy-dev-kit
```

### 즉시 사용 가능 (init 불필요!)

```bash
# 실패한 테스트 수정
zy test:fix src/__tests__/YourService.test.ts

# Quality Gates 검증
zy quality:check

# OpenSpec 제안 검증
zy openspec:validate your-proposal --strict
```

**이게 전부입니다!** 기존 프로젝트에 바로 적용 가능합니다.

---

## 🧬 3개 완료된 기술 통합

zellyy-dev-kit은 다음 3개 검증된 기술을 통합합니다:

### 1. **establish-tdd-coverage-workflow** (커버리지 70%)
- Vitest 인프라 구축
- TRUST 5 Quality Gates
- Pre-commit hooks

### 2. **implement-multi-agent-debate** (3-Agent 시스템)
- TestAgent (테스트 품질 검증)
- SecurityAgent (보안 취약점 분석)
- PerformanceAgent (성능 이슈 감지)

### 3. **implement-openspec-review-command** (CI/CD 자동화)
- `/openspec:review` 슬래시 커맨드
- GitHub Actions 통합
- Backlog ↔ OpenSpec 추적 체인

**통합 효과**: 3개 기술을 원클릭으로 적용 가능

---

## ✨ 왜 zellyy-dev-kit을 선택하나요?

### ✅ Brownfield-Ready
기존 프로젝트에 점진적으로 도입 가능합니다. 작은 부분부터 시작할 수 있습니다.

### ✅ All-in-One
OpenSpec (사양 기반 개발) + Backlog (작업 관리) + Quality Gates를 하나의 도구로 통합합니다.

### ✅ 검증된 기술
task-150부터 시작된 실전 프로젝트에서 검증된 패턴을 기반으로 합니다.

**실전 증거**:
```bash
# 6개 실패한 테스트 → 3-5분 만에 모두 수정 ✅
zy test:fix SmartCategoryService.test.ts
```

---

## 📚 시나리오별 사용법

### 시나리오 1: 실패한 테스트만 수정 (초급)

```bash
# 1. 설치
npm install -g zellyy-dev-kit

# 2. 테스트 수정
zy test:fix src/__tests__/YourService.test.ts

# 3. 결과 확인
npm run test
```

**예상 결과**: 3-5분 내 테스트 통과율 개선

---

### 시나리오 2: OpenSpec 자동화 (중급)

```bash
# 제안 생성
zy openspec:proposal add-new-feature

# 사양 검증
zy openspec:validate add-new-feature --strict

# Multi-Agent Debate
zy openspec:review add-new-feature

# 테스트 자동 생성
zy test:generate --spec openspec/specs/new-feature/spec.md
```

---

### 시나리오 3: 완전 통합 (고급)

```bash
# 프로젝트 초기화 (선택적)
zy init

# End-to-End 워크플로우
zy task:create "새 기능" --openspec
zy test:generate --spec openspec/specs/new-feature/spec.md
zy test:watch
zy commit "feat: 새 기능 구현"
zy openspec:archive new-feature
```

---

## 📖 문서

### 공식 문서
- **제안서**: [proposal.md](proposal.md) - zellyy-dev-kit 개요
- **설계 문서**: [design.md](design.md) - 아키텍처 상세
- **작업 체크리스트**: [tasks.md](tasks.md) - 구현 현황
- **마이그레이션 가이드**: [docs/migration-guide.md](docs/migration-guide.md)

### 커뮤니티
- **GitHub**: https://github.com/zellycloud/zellyy-dev-kit (Issues, Discussions)
- **Discord**: https://discord.gg/zellyy-dev-kit (준비 중)
- **Twitter/X**: @zellyy_dev_kit (준비 중)

### 실제 사례
- **task-150**: SmartCategoryService.test.ts 수정 (6/18 → 18/18 테스트 통과)
- **task-152**: zellyy-dev-kit 구축 (자체 Dogfooding)
- **task-155**: Multi-Agent Debate 구현
- **task-156**: /openspec:review 슬래시 커맨드

---

## 🛠️ 개발 (Contributor)

### 프로젝트 구조

```
zellyy-dev-kit/
├── src/
│   ├── cli.ts                  # CLI 진입점
│   ├── commands/
│   │   ├── init.ts             # 프로젝트 초기화
│   │   ├── test-fix.ts         # Precision test fixing
│   │   ├── openspec.ts         # OpenSpec 통합
│   │   ├── task.ts             # Backlog 통합
│   │   └── quality.ts          # Quality Gates
│   ├── core/
│   │   ├── ast-analyzer.ts     # TypeScript AST 분석
│   │   ├── openspec-parser.ts  # OpenSpec 파싱
│   │   ├── backlog-parser.ts   # Backlog 파싱
│   │   └── git-integration.ts  # Git 커밋 메시지
│   └── utils/
│       ├── logger.ts           # CLI 로깅
│       ├── file-system.ts      # 파일 읽기/쓰기
│       └── prompt.ts           # Interactive 프롬프트
├── tests/
├── openspec/                   # OpenSpec 사양 관리
│   ├── project.md
│   ├── changes/
│   │   └── initial-project-setup/
│   │       ├── proposal.md
│   │       ├── design.md
│   │       ├── tasks.md
│   │       ├── specs/
│   │       └── docs/
│   └── specs/                  # 완료된 사양
├── backlog/                    # Backlog 작업 관리
│   ├── backlog.md
│   ├── tasks/
│   └── completed/
├── package.json
├── tsconfig.json
└── README.md
```

### 로컬 개발

```bash
# 1. 저장소 클론
git clone https://github.com/zellycloud/zellyy-dev-kit.git
cd zellyy-dev-kit

# 2. 의존성 설치
npm install

# 3. 빌드 (Watch 모드)
npm run dev

# 4. 로컬 테스트
npm link
zellyy-dev-kit --help

# 5. 테스트 실행
npm run test
npm run test:coverage
```

### Dogfooding

zellyy-dev-kit을 개발할 때 zy를 사용합니다:

```bash
# 1. OpenSpec 제안
zy openspec:proposal add-new-command

# 2. 테스트 생성
zy test:generate --spec openspec/specs/new-command/spec.md

# 3. 테스트 수정
zy test:fix src/__tests__/NewCommand.test.ts

# 4. Quality Gates
zy quality:check

# 5. 커밋
zy commit "feat: 새 명령어 추가"
```

---

## 🤝 기여

기여는 언제나 환영합니다!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`zy commit "feat: Add AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**기여 가이드**: [CONTRIBUTING.md](CONTRIBUTING.md) ✅

---

## 📄 라이선스

MIT License - [LICENSE](LICENSE) 참고

---

## 💬 도움이 필요하신가요?

- **GitHub Issues**: https://github.com/zellycloud/zellyy-dev-kit/issues
- **Discord**: `#help` 채널 (준비 중)
- **이메일**: support@zellyy.com

**응답 시간**:
- Critical (프로덕션 장애): 24시간 이내
- High (기능 동작 불가): 3일 이내
- Medium (개선 제안): 2주 이내

---

**Made with ❤️ by Zellyy Team**

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=zellycloud/zellyy-dev-kit&type=Date)](https://star-history.com/#zellycloud/zellyy-dev-kit&Date)
