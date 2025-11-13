"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleReporter = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ConsoleReporter {
    print(result) {
        console.log('\n');
        console.log(chalk_1.default.bold('═══════════════════════════════════════════════'));
        console.log(chalk_1.default.bold('    Quality Gates Check Result'));
        console.log(chalk_1.default.bold('═══════════════════════════════════════════════'));
        const statusIcon = result.status === 'passed' ? chalk_1.default.green('✅') : chalk_1.default.red('❌');
        console.log(`\n${statusIcon} Status: ${chalk_1.default.bold(result.status.toUpperCase())}`);
        console.log(`   Score: ${chalk_1.default.bold(`${result.score}/100`)}`);
        console.log(`   Duration: ${result.durationMs}ms`);
        console.log(chalk_1.default.bold('\n📋 TRUST 5 Quality Gates:'));
        this.printValidationResult('Tests (Coverage)', result.coverage, `${result.coverage.percentage}% >= ${result.coverage.threshold}%`);
        this.printValidationResult('Readable (ESLint/Prettier)', result.readable, `ESLint: ${result.readable.eslintErrors} errors, Prettier: ${result.readable.prettierErrors} files`);
        this.printValidationResult('Unified (Naming)', result.unified, `${result.unified.violations} violations`);
        this.printValidationResult('Secured (No Secrets)', result.secured, `${result.secured.secretsFound} secrets found`);
        this.printValidationResult('Trackable (@SPEC/@TEST/@CODE)', result.trackable, `${result.trackable.missingTags} missing tags`);
        if (result.status !== 'passed') {
            console.log(chalk_1.default.bold('\n⚠️ Details:'));
            if (!result.coverage.passed && result.coverage.fileDetails) {
                console.log(chalk_1.default.red('  ❌ Coverage failures (lowest 10):'));
                result.coverage.fileDetails.slice(0, 5).forEach(f => {
                    console.log(`     ${f.path}: ${f.coverage.toFixed(1)}%`);
                });
            }
            if (!result.readable.passed && result.readable.errors) {
                console.log(chalk_1.default.red('  ❌ Style violations (first 5):'));
                result.readable.errors.slice(0, 5).forEach(e => {
                    console.log(`     ${e.file}:${e.line}:${e.column} - ${e.rule}: ${e.message}`);
                });
            }
            if (!result.unified.passed && result.unified.details) {
                console.log(chalk_1.default.red('  ❌ Naming violations (first 5):'));
                result.unified.details.slice(0, 5).forEach(d => {
                    console.log(`     ${d.file}: ${d.type} - expected, got ${d.actual}`);
                });
            }
            if (!result.secured.passed && result.secured.details) {
                console.log(chalk_1.default.red('  ⚠️ Potential secrets (first 5):'));
                result.secured.details.slice(0, 5).forEach(d => {
                    console.log(`     ${d.file}:${d.line} - ${d.type}`);
                });
            }
            if (!result.trackable.passed && result.trackable.details) {
                console.log(chalk_1.default.yellow('  ℹ️ Tracking issues (first 5):'));
                result.trackable.details.slice(0, 5).forEach(d => {
                    console.log(`     ${d.file}: ${d.type} - ${d.id}`);
                });
            }
        }
        console.log(chalk_1.default.bold('\n📌 Summary:'));
        console.log(`   ${result.summary}`);
        console.log('\n' + chalk_1.default.bold('═══════════════════════════════════════════════\n'));
    }
    printValidationResult(name, result, details) {
        const icon = result.passed ? chalk_1.default.green('✅') : chalk_1.default.red('❌');
        const status = result.passed ? chalk_1.default.green('PASS') : chalk_1.default.red('FAIL');
        console.log(`${icon} ${name.padEnd(30)} [${status}] ${details}`);
    }
}
exports.ConsoleReporter = ConsoleReporter;
//# sourceMappingURL=ConsoleReporter.js.map