/**
 * Git Integration 유틸리티
 *
 * Git 관련 기능 (커밋 메시지 생성, Backlog ID 추가, 상태 확인 등)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { FileSystem } from '../utils/file-system';

const execAsync = promisify(exec);

/**
 * Git 상태 인터페이스
 */
export interface GitStatus {
  modified: string[];   // 수정된 파일
  staged: string[];     // 스테이징된 파일
  untracked: string[];  // 추적되지 않은 파일
}

/**
 * Git 커밋 정보 인터페이스
 */
export interface GitCommit {
  hash: string;      // 커밋 해시
  message: string;   // 커밋 메시지
  author: string;    // 작성자
  date: string;      // 작성 날짜
}

export class GitIntegration {
  /**
   * Git 저장소인지 확인
   * @param cwd 작업 디렉토리 (기본값: 현재 디렉토리)
   * @returns Git 저장소이면 true
   */
  static async isGitRepository(cwd: string = process.cwd()): Promise<boolean> {
    try {
      const gitDir = path.join(cwd, '.git');
      return await FileSystem.fileExists(gitDir);
    } catch {
      return false;
    }
  }

  /**
   * 현재 브랜치 이름 조회
   * @param cwd 작업 디렉토리
   * @returns 브랜치 이름
   */
  static async getCurrentBranch(cwd: string = process.cwd()): Promise<string> {
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd });
      return stdout.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`현재 브랜치를 가져올 수 없습니다: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Git 상태 조회 (수정/스테이징/추적되지 않은 파일)
   * @param cwd 작업 디렉토리
   * @returns Git 상태
   */
  static async getGitStatus(cwd: string = process.cwd()): Promise<GitStatus> {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd });
      const lines = stdout.split('\n').filter(line => line.trim());

      const status: GitStatus = {
        modified: [],
        staged: [],
        untracked: []
      };

      for (const line of lines) {
        const statusCode = line.substring(0, 2);
        const filePath = line.substring(3).trim();

        // XY 형식: X=index 상태, Y=worktree 상태
        const indexStatus = statusCode[0];
        const worktreeStatus = statusCode[1];

        // 스테이징된 파일 (index에 변경사항)
        if (indexStatus !== ' ' && indexStatus !== '?') {
          status.staged.push(filePath);
        }

        // 수정된 파일 (worktree에 변경사항, 스테이징되지 않음)
        if (worktreeStatus === 'M') {
          status.modified.push(filePath);
        }

        // 추적되지 않은 파일
        if (statusCode === '??') {
          status.untracked.push(filePath);
        }
      }

      return status;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Git 상태를 가져올 수 없습니다: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 커밋 메시지에 Backlog ID 추가
   * @param message 원본 커밋 메시지
   * @param taskId Backlog 작업 ID (예: "task-5")
   * @returns Backlog ID가 추가된 커밋 메시지
   */
  static addBacklogId(message: string, taskId: string): string {
    // 이미 refs가 포함되어 있으면 그대로 반환
    if (message.includes('refs #')) {
      return message;
    }

    // task-123 → 123 추출
    const match = taskId.match(/task-(\d+)/);
    if (!match) {
      throw new Error(`잘못된 task ID 형식: ${taskId}`);
    }

    const taskNumber = match[1];
    return `${message} (refs #${taskNumber})`;
  }

  /**
   * 마지막 커밋 정보 조회
   * @param cwd 작업 디렉토리
   * @returns 커밋 정보 (커밋이 없으면 null)
   */
  static async getLastCommit(cwd: string = process.cwd()): Promise<GitCommit | null> {
    try {
      // 커밋 존재 여부 확인
      const { stdout: revList } = await execAsync('git rev-list -n 1 HEAD', { cwd });
      if (!revList.trim()) {
        return null;
      }

      // 커밋 정보 조회
      const format = '%H%n%s%n%an%n%ai'; // hash, subject, author name, author date
      const { stdout } = await execAsync(`git log -1 --format="${format}"`, { cwd });
      const lines = stdout.trim().split('\n');

      if (lines.length < 4) {
        return null;
      }

      return {
        hash: lines[0],
        message: lines[1],
        author: lines[2],
        date: lines[3]
      };
    } catch {
      // 커밋이 없으면 null 반환
      return null;
    }
  }

  /**
   * Conventional Commits 형식 검증
   * @param message 커밋 메시지
   * @throws 형식이 잘못된 경우 에러
   */
  static validateCommitMessage(message: string): void {
    if (!message || message.trim() === '') {
      throw new Error('커밋 메시지가 비어있습니다');
    }

    // Conventional Commits 형식: type(scope?): description
    const conventionalCommitPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/;

    if (!conventionalCommitPattern.test(message)) {
      throw new Error(
        '커밋 메시지는 Conventional Commits 형식을 따라야 합니다.\n' +
        '예시: feat: Add new feature, fix(scope): Fix bug'
      );
    }
  }

  /**
   * 브랜치 이름에서 task ID 추출
   * @param branchName 브랜치 이름
   * @returns task ID (없으면 null)
   */
  static extractTaskIdFromBranch(branchName: string): string | null {
    const match = branchName.match(/task-\d+/);
    return match ? match[0] : null;
  }

  /**
   * Git 커밋 생성 (헬퍼 메서드)
   * @param message 커밋 메시지
   * @param cwd 작업 디렉토리
   */
  static async createCommit(message: string, cwd: string = process.cwd()): Promise<void> {
    try {
      // Conventional Commits 형식 검증
      this.validateCommitMessage(message);

      // 커밋 생성
      await execAsync(`git commit -m "${message}"`, { cwd });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`커밋 생성 실패: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Git 설정 확인 (user.name, user.email)
   * @param cwd 작업 디렉토리
   * @returns 설정 완료 여부
   */
  static async isGitConfigured(cwd: string = process.cwd()): Promise<boolean> {
    try {
      const { stdout: userName } = await execAsync('git config user.name', { cwd });
      const { stdout: userEmail } = await execAsync('git config user.email', { cwd });

      return userName.trim() !== '' && userEmail.trim() !== '';
    } catch {
      return false;
    }
  }

  /**
   * Git 설정 (user.name, user.email)
   * @param name 사용자 이름
   * @param email 사용자 이메일
   * @param cwd 작업 디렉토리
   */
  static async configureGit(
    name: string,
    email: string,
    cwd: string = process.cwd()
  ): Promise<void> {
    try {
      await execAsync(`git config user.name "${name}"`, { cwd });
      await execAsync(`git config user.email "${email}"`, { cwd });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Git 설정 실패: ${error.message}`);
      }
      throw error;
    }
  }
}