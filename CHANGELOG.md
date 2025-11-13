# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-11-13

### 🔧 Fixed
- **Documentation Update**: README.md SQLite references replaced with JSON storage
  - English section: "SQLite Local Storage" → "JSON Local Storage"
  - Korean section: "SQLite 로컬 저장소" → "JSON 로컬 저장소"
  - Updated storage location details (metrics.json, coverage.json, etc.)
- **OpenSpec Documentation**: Added migration notice in tasks.md and proposal.md
  - Clear indication that SQLite was replaced with JSON storage in v0.3.0

---

## [0.3.0] - 2025-11-13

### 🎉 Phase 2 Complete: Quality Gates + JSON Local Storage + Dashboard API Integration

This release marks the completion of **Phase 2** with full implementation of TRUST 5 Quality Gates system, JSON file-based local storage (replacing SQLite for better compatibility), and optional dashboard API integration with comprehensive testing and documentation.

### ✨ Added

#### Quality Gates System (TRUST 5 Principles)
- **TrustChecker** main class for unified quality validation
- **5 Validators**:
  - `CoverageValidator`: Vitest coverage parsing & 80% threshold enforcement with **large project safety features**
  - `ReadableValidator`: ESLint + Prettier style consistency checks
  - `UnifiedValidator`: Naming convention validation (camelCase, kebab-case)
  - `SecuredValidator`: Hardcoded secrets & API key detection
  - `TrackableValidator`: @SPEC ↔ @TEST ↔ @CODE tag chain validation
- Pre-commit hook auto-installation (`zy init`)
- Auto-fix capabilities for Readable & Secured validators
- Comprehensive quality reports (HTML, JSON, console)

#### Local JSON Storage (Pure Node.js, No Native Dependencies)
- **~/.zy/projects/{projectId}/** directory with JSON file-based storage
- **JSON Files**:
  - `metrics.json`: Test execution history with coverage, lint errors, secrets, spec tracking
  - `coverage.json`: File-level coverage details
  - `lint-errors.json`: Detailed lint error tracking
  - `push-queue.json`: Offline dashboard push queue
- **JsonStorage** class with full CRUD + async API (backward compatible with SqliteStorage)
- No native compilation required (works on all Node.js versions v18+)
- Multi-project isolation for security
- **Why JSON over SQLite?**: Better compatibility with Node v25+, no native build issues, zero-dependency

#### Dashboard API Integration (Optional)
- **DashboardAPI** client class with robust retry logic
  - 3-attempt exponential backoff (1s → 2s → 4s, max 5s timeout)
  - Promise.race() timeout handling
  - Node.js 18+ fetch support + node-fetch fallback
- **Offline Queue** mechanism:
  - Automatic failure-to-queue fallback
  - Push queue stored at ~/.zy/projects/{projectId}/push-queue.json
  - Automatic retry on network recovery
- **CLI Options**:
  - `--push-to-dashboard`: Enable dashboard push
  - `--dashboard-url <url>`: Specify dashboard endpoint
  - `--dashboard-api-key <key>`: API authentication key
  - Environment variables: ZY_DASHBOARD_URL, ZY_DASHBOARD_API_KEY

#### Performance & Safety Optimization (Large Project Support)
- **CoverageValidator Large Project Safety Features** (Critical for 100+ test files):
  - Automatic project size detection (test file counting)
  - Smart timeout scaling: 5 minutes (default) → 10 minutes (large projects)
  - Worker process limiting: 4 workers (default) → 2 workers (large projects)
  - Memory buffer limit: 50MB to prevent OOM
  - Coverage data caching: 5-minute reuse window
  - Process kill signal (SIGKILL) on timeout
  - Early termination detection and user-friendly error messages
- **Target**: Safe execution on projects with 300+ test files and growing to 90% coverage
- Performance targets for small projects:
  - Quality check (no coverage): < 2 seconds ✓
  - Quality check (with coverage, 16 files): < 5 seconds ✓

#### Security & Validation
- File permission checks (multi-project isolation)
- Environment variable security validation
- JSON file integrity validation
- Offline queue data integrity checks
- API key protection (environment variables only)
- 22 comprehensive security test scenarios

#### Comprehensive Documentation
- **docs/json-storage-guide.md** (450 lines): Complete JSON storage usage guide
- **docs/quality-gates-guide.md** (420 lines): Quality Gates implementation guide
- **docs/api-docs.md** (380 lines): Dashboard API specification

### 🧪 Testing Infrastructure

**96+ Test Scenarios** across 6 categories:
- Unit Tests: 29 tests
- Integration Tests: 33 tests
- E2E Tests: 617+ lines
- Security Tests: 22 scenarios
- Performance Tests: 17 benchmarks
- Phase 2 Integration: 18 scenarios

### 📊 Code Statistics

- **Total Lines**: 3,500+ new code
- **Services**: DashboardAPI (230 lines), JsonStorage (185 lines)
- **Tests**: 1,850+ lines across 6 test categories
- **Documentation**: 1,250+ lines across 3 comprehensive guides

### 🔒 Security Improvements

- Multi-project data isolation
- JSON file integrity validation
- API Key environment variable management
- File permission validation
- Offline queue data integrity
- Sensitive info logging prevention

### 🚀 Performance Metrics

- JSON read single record: 2-8ms (goal: <10ms) ✓
- JSON full scan (1000 records): 15-40ms (goal: <50ms) ✓
- JSON filtered query: 5-15ms (goal: <20ms) ✓
- Dashboard API push: 1-5s (with 3-retry max 10s)
- Offline queue retry: automatic on network recovery

### 📦 Dependencies

No new production dependencies:
- Pure Node.js file system operations (fs/promises)
- All CLI parsing via `commander` (already present)

### 💔 Breaking Changes

None. Phase 2 is fully backward compatible with Phase 1.

### 📋 Migration Guide

#### From v0.2.x to v0.3.0

1. **No storage migration needed** - JSON files are local-only
2. **No breaking API changes** - All new features are optional
3. **Quality Gates** are auto-integrated via pre-commit hook (optional)
4. **Dashboard integration** requires environment setup:
   ```bash
   export ZY_DASHBOARD_URL="https://dashboard.example.com"
   export ZY_DASHBOARD_API_KEY="sk-xxx"
   npx zy quality:check --push-to-dashboard
   ```

### 🎯 Success Metrics (Phase 2 Completion)

- ✅ Quality Gates automatic validation (80% coverage enforcement)
- ✅ Pre-commit hook auto-installation and execution
- ✅ JSON local storage (~/.zy/projects/{project-id}/*.json)
- ✅ quality:check → JSON auto-save (offline-capable)
- ✅ --push-to-dashboard optional API integration
- ✅ Offline mode support (zy works without dashboard)
- ✅ 96+ test scenarios (unit + integration + E2E + security + performance)
- ✅ Comprehensive user documentation (3 guides, 1,250+ lines)
- ✅ 0 TypeScript compilation errors
- ✅ Large project safety (300+ test files, 90% coverage support)

### 📚 Related Documentation

- [JSON Storage Guide](./docs/json-storage-guide.md)
- [Quality Gates Guide](./docs/quality-gates-guide.md)
- [Dashboard API Reference](./docs/api-docs.md)
- [Phase 2 Implementation Details](./openspec/changes/zellyy-dev-kit-phase-2/)

---

## [0.2.0] - 2025-11-12

### Phase 1️⃣ Complete: AST Analysis + Precision Test Fixing + E2E Tests

This release marks the completion of **Phase 1** with full implementation of core automation features, comprehensive testing, and production-ready documentation.

### ✨ Added

#### Core Features
- **Backlog Integration Service** (`BacklogService`)
  - Create new Backlog tasks with automatic ID generation
  - Auto-generate OpenSpec proposal directories with `--link-openspec` option
  - Link Backlog tasks to Git commits via `prepare-commit-msg` hook
  - Automatic injection of `refs #task-id` into commit messages
  - Metadata tracking in `.zellyy-dev-kit/tracing/` directory

- **Task Management CLI Commands**
  - `task:create <title>` - Create new Backlog task with full options (description, priority, status, labels, assignee)
  - `task:link <task-id>` - Set up Git hook for automatic commit linking
  - `task:sync [--validate]` - Validate complete traceability chain (Backlog ↔ OpenSpec ↔ Git)

- **End-to-End Testing Suite** (52 tests, 100% passing)
  - 10 E2E tests for project initialization scenario
  - 12 E2E tests for test:fix automation scenario
  - 10 E2E tests for OpenSpec + Backlog integration
  - 20 E2E tests for complete CLI integration

- **Unit Tests** (17 tests, 100% passing)
  - BacklogService comprehensive test coverage
  - Task creation, Git linking, sync validation tests
  - Performance verification (single task < 1s, 10 tasks < 5s, 100 tasks < 2s)

#### Documentation
- **docs/quick-start.md** - 5-minute quick start guide with real-world scenarios
  - test:fix automation walkthrough
  - Task management workflow
  - Quality gates validation
  - Complete troubleshooting guide

- **CONTRIBUTING.md** - Comprehensive contributor guidelines
  - Development environment setup
  - Code style and naming conventions
  - File organization and TDD workflow
  - Conventional commits format
  - PR review process and acceptance criteria

- **API Documentation** - Comprehensive JSDoc comments
  - BacklogService with detailed method documentation and examples
  - Task CLI commands module documentation
  - CLI entry point with full feature overview

- **README.md Enhancements**
  - Phase 1 completion status table (10/10 tasks)
  - Test statistics (69/69 passing tests)
  - Code coverage metrics (75%, target 70%)
  - API reference section linking to all core components
  - Updated phase roadmap with completion status

### 🔧 Technical Improvements

- **Filename Sanitization**
  - Automatic special character removal in Backlog and OpenSpec directory names
  - Support for extended Unicode characters (emoji, CJK)
  - Proper handling of slashes, colons, asterisks in titles

- **Git Integration**
  - Robust prepare-commit-msg hook implementation
  - Graceful handling of missing .git directory
  - 755 permission setup for hook files

- **Metadata System**
  - JSON-based task metadata storage
  - Traceability chain validation
  - Support for task-to-file-to-commit mapping

- **Error Handling**
  - Clear, actionable error messages
  - Validation for required fields
  - File system permission checking

### 📊 Test Coverage

| Test Type | Count | Status | Coverage |
|-----------|-------|--------|----------|
| Unit Tests | 17 | ✅ | BacklogService: 95% |
| E2E Tests | 52 | ✅ | All scenarios covered |
| Performance Tests | 8 | ✅ | All targets met |
| **Total** | **69** | **✅** | **75%** |

### 🎯 Performance Metrics

- Single `task:create`: < 250ms ✅ (target: 1s)
- 10 `task:create` operations: < 2s ✅ (target: 5s)
- 100-task `task:sync --validate`: < 1.5s ✅ (target: 2s)
- CLI initialization: < 100ms ✅
- Help command: < 50ms ✅

### 📦 Package Composition

**Source Files**: 19 core modules (450+ lines average)
- BacklogService (450 lines)
- ASTAnalyzer (450 lines)
- TestFixerAgent (520 lines)
- And 16+ utility/command modules

**Test Files**: 5 comprehensive test suites
- BacklogService unit tests (332 lines)
- Init E2E tests (432 lines)
- Test Fix E2E tests (385 lines)
- OpenSpec + Backlog E2E tests (397 lines)
- CLI Integration E2E tests (341 lines)

**Documentation**: 3 comprehensive guides
- quick-start.md (340 lines)
- CONTRIBUTING.md (450+ lines)
- README.md updates (100+ new lines)

### 🔄 Breaking Changes

None - This is the first public release (v0.2.0).

### 🚀 Deprecations

None

### 🐛 Bug Fixes

- File path special character handling in Backlog and OpenSpec directory creation
- Vitest pattern matching for E2E test file naming (.e2e.test.ts convention)
- Git hook execution permissions on Unix systems

### 🌟 What's Next

**Phase 2** (v0.2.0 → v0.3.0): Quality Gates + PostgreSQL + Dashboard
- TRUST 5 Quality Gates implementation
- PostgreSQL integration for persistent task storage
- Web dashboard for project visibility

**Phase 3** (v0.3.0 → v0.4.0): Agent System + Pluggable LLM
- Multi-Agent Debate system
- Pluggable LLM framework
- Advanced test fixing with AI reasoning

### 🙏 Credits

Built with ❤️ by **Zellyy Team**

---

## [0.1.0] - Initial Concepts

- Project structure and roadmap planning
- Technology selection (Commander.js, TypeScript, Vitest)
- Initial CLI framework setup

