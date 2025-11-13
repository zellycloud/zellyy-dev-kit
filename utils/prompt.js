"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = exports.PromptError = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
class PromptError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PromptError';
    }
}
exports.PromptError = PromptError;
class Prompt {
    static async input(message, defaultValue, required = false) {
        try {
            const answer = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'answer',
                    message,
                    ...(defaultValue && { default: defaultValue }),
                },
            ]);
            const value = answer.answer.trim();
            if (required && !value) {
                throw new PromptError('입력값이 비어있습니다');
            }
            return value;
        }
        catch (error) {
            if (error instanceof PromptError) {
                throw error;
            }
            throw new PromptError(`입력 프롬프트 실행 중 오류가 발생했습니다: ${error.message}`);
        }
    }
    static async select(message, choices, defaultChoice) {
        if (choices.length === 0) {
            throw new PromptError('선택지가 비어있습니다');
        }
        try {
            const answer = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'answer',
                    message,
                    choices,
                    ...(defaultChoice && { default: defaultChoice }),
                },
            ]);
            return answer.answer;
        }
        catch (error) {
            throw new PromptError(`선택 메뉴 실행 중 오류가 발생했습니다: ${error.message}`);
        }
    }
    static async confirm(message, defaultValue = true) {
        try {
            const answer = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'answer',
                    message,
                    default: defaultValue,
                },
            ]);
            return answer.answer;
        }
        catch (error) {
            throw new PromptError(`확인 다이얼로그 실행 중 오류가 발생했습니다: ${error.message}`);
        }
    }
    static async multiSelect(message, choices) {
        try {
            const answer = await inquirer_1.default.prompt([
                {
                    type: 'checkbox',
                    name: 'answer',
                    message,
                    choices,
                },
            ]);
            return answer.answer;
        }
        catch (error) {
            throw new PromptError(`다중 선택 메뉴 실행 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompt.js.map