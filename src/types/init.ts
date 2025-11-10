/**
 * 프로젝트 초기화 설정
 */

export type ProjectType = 'react' | 'vue' | 'node';

export interface InitConfig {
  /**
   * 프로젝트 이름
   * @example "my-awesome-project"
   */
  projectName: string;

  /**
   * 프로젝트 타입
   * @example "react" | "vue" | "node"
   */
  projectType: ProjectType;

  /**
   * OpenSpec 활성화 여부
   * OpenSpec 사양 기반 개발 워크플로우 사용 여부
   * @default true
   */
  enableOpenSpec: boolean;

  /**
   * Backlog 활성화 여부
   * Backlog.md 작업 관리 시스템 사용 여부
   * @default true
   */
  enableBacklog: boolean;

  /**
   * TDD 인프라 설정
   */
  tdd: {
    /**
     * vitest + @vitest/coverage-v8 설치 여부
     * @default true
     */
    enableVitest: boolean;

    /**
     * Coverage threshold (%)
     * @default 70
     */
    coverageThreshold: number;

    /**
     * @vitest/ui (시각적 테스트 대시보드) 설치 여부
     * @default true
     */
    enableUI: boolean;
  };

  /**
   * Quality Gates 설정
   */
  qualityGates: {
    /**
     * Pre-commit hook 설정 여부
     * - Coverage 검증
     * - ESLint 검증
     * - Prettier 자동 포매팅
     * @default true
     */
    enablePreCommitHook: boolean;

    /**
     * Commit message 검증 여부
     * - Backlog ID (refs #XXX) 검증
     * - Conventional Commits 형식 검증
     * @default true
     */
    enableCommitMsgValidation: boolean;

    /**
     * ESLint 자동 수정 여부
     * @default true
     */
    autoFixLint: boolean;

    /**
     * Prettier 자동 포매팅 여부
     * @default true
     */
    autoFormatCode: boolean;
  };
}

/**
 * 초기화 결과
 */
export interface InitResult {
  /**
   * 초기화 성공 여부
   */
  success: boolean;

  /**
   * 생성된 파일 목록
   */
  filesCreated: string[];

  /**
   * 설치된 의존성 목록
   */
  dependenciesInstalled: string[];

  /**
   * 실행된 스크립트 목록
   */
  scriptsExecuted: string[];

  /**
   * 생략된 단계 (사용자가 비활성화한 항목)
   */
  skipped: string[];

  /**
   * 에러 메시지 (발생한 경우)
   */
  errors?: string[];

  /**
   * 다음 단계 가이드
   */
  nextSteps: string[];
}