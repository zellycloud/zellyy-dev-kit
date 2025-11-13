#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = require("path");
const init_1 = require("./commands/init");
const test_fix_1 = require("./commands/test-fix");
const openspec_1 = require("./commands/openspec");
const task_1 = require("./commands/task");
const quality_1 = require("./commands/quality");
const commit_1 = require("./commands/commit");
const packageJsonPath = (0, path_1.join)(__dirname, '..', 'package.json');
const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf-8'));
const version = packageJson.version;
const program = new commander_1.Command();
program
    .name('zellyy-dev-kit')
    .description('Spec-Driven & Test-Driven Development Unified Automation CLI')
    .version(version);
(0, init_1.setupInitCommand)(program);
(0, test_fix_1.registerTestFixCommand)(program);
(0, openspec_1.registerOpenSpecCommands)(program);
(0, task_1.registerTaskCommands)(program);
(0, quality_1.registerQualityCommands)(program);
(0, commit_1.registerCommitCommand)(program);
program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ zy init');
    console.log('  $ zy test:fix SmartCategoryService.test.ts');
    console.log('  $ zy openspec:proposal new-feature');
    console.log('  $ zy task:create "새 기능 추가" --openspec new-feature');
    console.log('');
    console.log('Documentation:');
    console.log('  https://github.com/zellycloud/zellyy-dev-kit');
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=cli.js.map