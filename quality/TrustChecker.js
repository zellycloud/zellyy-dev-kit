"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustChecker = void 0;
const CoverageValidator_1 = require("./validators/CoverageValidator");
const ReadableValidator_1 = require("./validators/ReadableValidator");
const UnifiedValidator_1 = require("./validators/UnifiedValidator");
const SecuredValidator_1 = require("./validators/SecuredValidator");
const TrackableValidator_1 = require("./validators/TrackableValidator");
const ConsoleReporter_1 = require("./reporters/ConsoleReporter");
const JSONReporter_1 = require("./reporters/JSONReporter");
const HTMLReporter_1 = require("./reporters/HTMLReporter");
class TrustChecker {
    projectPath;
    options;
    coverageValidator;
    readableValidator;
    unifiedValidator;
    securedValidator;
    trackableValidator;
    consoleReporter;
    jsonReporter;
    htmlReporter;
    constructor(projectPath = process.cwd(), options = {}) {
        this.projectPath = projectPath;
        this.options = {
            coverage: { threshold: 80, minFileThreshold: 70, ...options.coverage },
            eslint: { enabled: true, ...options.eslint },
            prettier: { enabled: true, ...options.prettier },
            reporters: options.reporters || ['console'],
            onlyValidators: options.onlyValidators,
            ...options,
        };
        this.coverageValidator = new CoverageValidator_1.CoverageValidator(this.projectPath, this.options.coverage);
        this.readableValidator = new ReadableValidator_1.ReadableValidator(this.projectPath, {
            eslint: this.options.eslint,
            prettier: this.options.prettier,
        });
        this.unifiedValidator = new UnifiedValidator_1.UnifiedValidator(this.projectPath);
        this.securedValidator = new SecuredValidator_1.SecuredValidator(this.projectPath);
        this.trackableValidator = new TrackableValidator_1.TrackableValidator(this.projectPath);
        this.consoleReporter = new ConsoleReporter_1.ConsoleReporter();
        this.jsonReporter = new JSONReporter_1.JSONReporter();
        this.htmlReporter = new HTMLReporter_1.HTMLReporter();
    }
    async check() {
        const startTime = Date.now();
        const validatorsToRun = this.options.onlyValidators || [
            'coverage',
            'readable',
            'unified',
            'secured',
            'trackable',
        ];
        const [coverage, readable, unified, secured, trackable] = await Promise.all([
            validatorsToRun.includes('coverage') ? this.checkTests() : Promise.resolve(this.createPassedCoverageResult()),
            validatorsToRun.includes('readable') ? this.checkReadable() : Promise.resolve(this.createPassedReadableResult()),
            validatorsToRun.includes('unified') ? this.checkUnified() : Promise.resolve(this.createPassedUnifiedResult()),
            validatorsToRun.includes('secured') ? this.checkSecured() : Promise.resolve(this.createPassedSecuredResult()),
            validatorsToRun.includes('trackable') ? this.checkTrackable() : Promise.resolve(this.createPassedTrackableResult()),
        ]);
        const durationMs = Date.now() - startTime;
        const allPassed = coverage.passed && readable.passed && unified.passed && secured.passed && trackable.passed;
        const status = allPassed ? 'passed' : 'failed';
        const score = [
            coverage.passed ? 20 : 0,
            readable.passed ? 20 : 0,
            unified.passed ? 20 : 0,
            secured.passed ? 20 : 0,
            trackable.passed ? 20 : 0,
        ].reduce((a, b) => a + b, 0);
        const result = {
            status,
            timestamp: new Date().toISOString(),
            durationMs,
            coverage,
            readable,
            unified,
            secured,
            trackable,
            score,
            summary: this.generateSummary(coverage, readable, unified, secured, trackable),
        };
        await this.report(result);
        return result;
    }
    async checkTests() {
        return this.coverageValidator.validate();
    }
    async checkReadable() {
        return this.readableValidator.validate();
    }
    async checkUnified() {
        return this.unifiedValidator.validate();
    }
    async checkSecured() {
        return this.securedValidator.validate();
    }
    async checkTrackable() {
        return this.trackableValidator.validate();
    }
    async fix() {
        let fixed = 0;
        let unfixable = 0;
        const prettierFixed = await this.readableValidator.autoFix();
        fixed += prettierFixed;
        return { fixed, unfixable };
    }
    async report(result) {
        for (const reporter of this.options.reporters || ['console']) {
            if (reporter === 'console') {
                this.consoleReporter.print(result);
            }
            else if (reporter === 'json') {
                await this.jsonReporter.write(result, `${this.projectPath}/quality-report.json`);
            }
            else if (reporter === 'html') {
                await this.htmlReporter.write(result, `${this.projectPath}/quality-report.html`);
            }
        }
    }
    generateSummary(coverage, readable, unified, secured, trackable) {
        const failures = [
            !coverage.passed && `Coverage: ${coverage.message}`,
            !readable.passed && `Readable: ${readable.message}`,
            !unified.passed && `Unified: ${unified.message}`,
            !secured.passed && `Secured: ${secured.message}`,
            !trackable.passed && `Trackable: ${trackable.message}`,
        ].filter(Boolean);
        if (failures.length === 0) {
            return 'All Quality Gates passed! ✅';
        }
        return `Quality Gates failed: ${failures.join(', ')}`;
    }
    createPassedCoverageResult() {
        return { passed: true, percentage: 100, threshold: 80, message: 'Coverage check skipped' };
    }
    createPassedReadableResult() {
        return { passed: true, eslintErrors: 0, prettierErrors: 0, message: 'Readable check skipped' };
    }
    createPassedUnifiedResult() {
        return { passed: true, violations: 0, message: 'Unified check skipped' };
    }
    createPassedSecuredResult() {
        return { passed: true, secretsFound: 0, message: 'Secured check skipped' };
    }
    createPassedTrackableResult() {
        return { passed: true, missingTags: 0, invalidChains: 0, message: 'Trackable check skipped' };
    }
}
exports.TrustChecker = TrustChecker;
//# sourceMappingURL=TrustChecker.js.map