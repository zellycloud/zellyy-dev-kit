"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    static info(message) {
        console.log(chalk_1.default.blue('ℹ'), message);
    }
    static success(message) {
        console.log(chalk_1.default.green('✓'), message);
    }
    static warn(message) {
        console.log(chalk_1.default.yellow('⚠'), message);
    }
    static error(message) {
        console.log(chalk_1.default.red('✗'), message);
    }
    static debug(message) {
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk_1.default.gray('🐛'), chalk_1.default.gray(message));
        }
    }
    static progress(message) {
        console.log(chalk_1.default.cyan('⏳'), message);
    }
    static section(message) {
        console.log('');
        console.log(chalk_1.default.bold.cyan(`\n${message}`));
        console.log(chalk_1.default.gray('─'.repeat(50)));
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map