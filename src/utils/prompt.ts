/**
 * Interactive Prompt 유틸리티
 *
 * inquirer 라이브러리를 사용하여 사용자 입력, 선택, 확인 다이얼로그를 제공합니다.
 *
 * @example
 * ```typescript
 * // 사용자 입력
 * const name = await Prompt.input('프로젝트 이름:', 'my-app');
 *
 * // 선택 메뉴
 * const type = await Prompt.select('타입 선택:', ['React', 'Vue', 'Node']);
 *
 * // 확인 다이얼로그
 * const confirmed = await Prompt.confirm('계속하시겠습니까?');
 *
 * // 다중 선택
 * const features = await Prompt.multiSelect('기능 선택:', ['A', 'B', 'C']);
 * ```
 */

import inquirer from 'inquirer';

/**
 * 프롬프트 에러 클래스
 */
export class PromptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptError';
  }
}

export class Prompt {
  /**
   * 사용자 입력 프롬프트
   *
   * @param message 표시할 메시지
   * @param defaultValue 기본값 (옵션)
   * @param required 필수 입력 여부 (기본값: false)
   * @returns 사용자 입력 값
   * @throws {PromptError} 필수 입력이 비어있을 경우
   *
   * @example
   * ```typescript
   * const projectName = await Prompt.input('프로젝트 이름:', 'my-app', true);
   * ```
   */
  static async input(
    message: string,
    defaultValue?: string,
    required: boolean = false
  ): Promise<string> {
    try {
      const answer = await inquirer.prompt([
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
    } catch (error) {
      if (error instanceof PromptError) {
        throw error;
      }
      throw new PromptError(
        `입력 프롬프트 실행 중 오류가 발생했습니다: ${(error as Error).message}`
      );
    }
  }

  /**
   * 선택 메뉴
   *
   * @param message 표시할 메시지
   * @param choices 선택지 배열
   * @param defaultChoice 기본 선택값 (옵션)
   * @returns 선택된 값
   * @throws {PromptError} 선택지가 비어있거나 오류 발생 시
   *
   * @example
   * ```typescript
   * const projectType = await Prompt.select(
   *   '프로젝트 타입:',
   *   ['React', 'Vue', 'Node'],
   *   'React'
   * );
   * ```
   */
  static async select<T extends string>(
    message: string,
    choices: T[],
    defaultChoice?: T
  ): Promise<T> {
    if (choices.length === 0) {
      throw new PromptError('선택지가 비어있습니다');
    }

    try {
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'answer',
          message,
          choices,
          ...(defaultChoice && { default: defaultChoice }),
        },
      ]);

      return answer.answer;
    } catch (error) {
      throw new PromptError(
        `선택 메뉴 실행 중 오류가 발생했습니다: ${(error as Error).message}`
      );
    }
  }

  /**
   * 확인 다이얼로그
   *
   * @param message 표시할 메시지
   * @param defaultValue 기본값 (기본값: true)
   * @returns 사용자 확인 여부 (true/false)
   * @throws {PromptError} 오류 발생 시
   *
   * @example
   * ```typescript
   * const shouldContinue = await Prompt.confirm('계속하시겠습니까?');
   * if (shouldContinue) {
   *   // 작업 계속...
   * }
   * ```
   */
  static async confirm(message: string, defaultValue: boolean = true): Promise<boolean> {
    try {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'answer',
          message,
          default: defaultValue,
        },
      ]);

      return answer.answer;
    } catch (error) {
      throw new PromptError(
        `확인 다이얼로그 실행 중 오류가 발생했습니다: ${(error as Error).message}`
      );
    }
  }

  /**
   * 다중 선택 메뉴
   *
   * @param message 표시할 메시지
   * @param choices 선택지 배열
   * @returns 선택된 값들의 배열 (빈 배열 가능)
   * @throws {PromptError} 오류 발생 시
   *
   * @example
   * ```typescript
   * const features = await Prompt.multiSelect(
   *   '활성화할 기능:',
   *   ['OpenSpec', 'Backlog', 'TDD']
   * );
   * console.log(`선택된 기능: ${features.join(', ')}`);
   * ```
   */
  static async multiSelect<T extends string>(
    message: string,
    choices: T[]
  ): Promise<T[]> {
    try {
      const answer = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'answer',
          message,
          choices,
        },
      ]);

      return answer.answer;
    } catch (error) {
      throw new PromptError(
        `다중 선택 메뉴 실행 중 오류가 발생했습니다: ${(error as Error).message}`
      );
    }
  }
}