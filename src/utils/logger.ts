/**
 * CLI 로깅 유틸리티
 *
 * @description
 * chalk을 사용한 컬러풀한 로깅
 */

import chalk from 'chalk';

export class Logger {
  /**
   * 정보 메시지
   */
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * 성공 메시지
   */
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * 경고 메시지
   */
  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  /**
   * 에러 메시지
   */
  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  /**
   * 디버그 메시지 (NODE_ENV=development 시에만 출력)
   */
  static debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(chalk.gray('🐛'), chalk.gray(message));
    }
  }

  /**
   * 진행 중 메시지
   */
  static progress(message: string): void {
    console.log(chalk.cyan('⏳'), message);
  }

  /**
   * 섹션 헤더
   */
  static section(message: string): void {
    console.log('');
    console.log(chalk.bold.cyan(`\n${message}`));
    console.log(chalk.gray('─'.repeat(50)));
  }
}