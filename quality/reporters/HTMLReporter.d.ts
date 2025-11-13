import { QualityCheckResult } from '../TrustChecker';
export declare class HTMLReporter {
    write(result: QualityCheckResult, filePath: string): Promise<void>;
    private generateHTML;
    private renderTrust5Item;
    private renderDetails;
}
//# sourceMappingURL=HTMLReporter.d.ts.map