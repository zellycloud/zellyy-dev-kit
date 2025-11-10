/**
 * FileSystem 유틸리티
 *
 * 파일 시스템 관련 유틸리티 함수 모음
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export class FileSystem {
  /**
   * 파일 읽기
   * @param filePath 읽을 파일 경로
   * @returns 파일 내용
   */
  static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`파일을 읽을 수 없습니다: ${filePath} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 파일 쓰기
   * @param filePath 작성할 파일 경로
   * @param content 파일 내용
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // 디렉토리가 없으면 자동 생성
      const dir = path.dirname(filePath);
      await this.ensureDir(dir);

      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`파일을 작성할 수 없습니다: ${filePath} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 파일 또는 디렉토리 존재 여부 확인
   * @param filePath 확인할 경로
   * @returns 존재하면 true, 아니면 false
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 템플릿 파일 복사
   * @param source 소스 파일 경로
   * @param dest 대상 파일 경로
   */
  static async copyTemplate(source: string, dest: string): Promise<void> {
    try {
      // 소스 파일 존재 여부 확인
      const exists = await this.fileExists(source);
      if (!exists) {
        throw new Error(`소스 파일이 존재하지 않습니다: ${source}`);
      }

      // 대상 디렉토리 생성
      const dir = path.dirname(dest);
      await this.ensureDir(dir);

      // 파일 복사
      await fs.copyFile(source, dest);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`템플릿 복사 실패: ${source} -> ${dest} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 프로젝트 루트 디렉토리 찾기 (package.json이 있는 디렉토리)
   * @param startPath 시작 경로 (기본값: 현재 디렉토리)
   * @returns 프로젝트 루트 경로
   */
  static async findProjectRoot(startPath: string = process.cwd()): Promise<string> {
    let currentPath = path.resolve(startPath);
    const root = path.parse(currentPath).root;

    // 루트 디렉토리에 도달할 때까지 상위로 탐색
    while (currentPath !== root) {
      const packageJsonPath = path.join(currentPath, 'package.json');
      const exists = await this.fileExists(packageJsonPath);

      if (exists) {
        return currentPath;
      }

      // 상위 디렉토리로 이동
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        // 더 이상 올라갈 수 없으면 현재 경로 반환
        break;
      }
      currentPath = parentPath;
    }

    // package.json을 찾지 못하면 시작 경로 반환
    return path.resolve(startPath);
  }

  /**
   * 디렉토리 생성 (중첩 디렉토리 지원)
   * @param dirPath 생성할 디렉토리 경로
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`디렉토리 생성 실패: ${dirPath} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 파일 또는 디렉토리 삭제
   * @param filePath 삭제할 경로
   * @param recursive 재귀적 삭제 여부 (디렉토리용)
   */
  static async remove(filePath: string, recursive: boolean = false): Promise<void> {
    try {
      const exists = await this.fileExists(filePath);
      if (!exists) {
        return; // 존재하지 않으면 무시
      }

      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await fs.rm(filePath, { recursive, force: true });
      } else {
        await fs.unlink(filePath);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`삭제 실패: ${filePath} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 디렉토리 내 파일 목록 조회
   * @param dirPath 디렉토리 경로
   * @returns 파일/디렉토리 이름 배열
   */
  static async readDir(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`디렉토리 읽기 실패: ${dirPath} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 절대 경로로 변환
   * @param relativePath 상대 경로
   * @returns 절대 경로
   */
  static resolve(...paths: string[]): string {
    return path.resolve(...paths);
  }

  /**
   * 경로 결합
   * @param paths 결합할 경로들
   * @returns 결합된 경로
   */
  static join(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * 파일 확장자 추출
   * @param filePath 파일 경로
   * @returns 확장자 (점 포함)
   */
  static extname(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * 파일 이름 추출 (확장자 제외)
   * @param filePath 파일 경로
   * @returns 파일 이름
   */
  static basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }

  /**
   * 디렉토리 이름 추출
   * @param filePath 파일 경로
   * @returns 디렉토리 경로
   */
  static dirname(filePath: string): string {
    return path.dirname(filePath);
  }
}