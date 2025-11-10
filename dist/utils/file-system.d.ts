export declare class FileSystem {
    static readFile(filePath: string): Promise<string>;
    static writeFile(filePath: string, content: string): Promise<void>;
    static fileExists(filePath: string): Promise<boolean>;
    static copyTemplate(source: string, dest: string): Promise<void>;
    static findProjectRoot(startPath?: string): Promise<string>;
    static ensureDir(dirPath: string): Promise<void>;
    static remove(filePath: string, recursive?: boolean): Promise<void>;
    static readDir(dirPath: string): Promise<string[]>;
    static resolve(...paths: string[]): string;
    static join(...paths: string[]): string;
    static extname(filePath: string): string;
    static basename(filePath: string, ext?: string): string;
    static dirname(filePath: string): string;
}
//# sourceMappingURL=file-system.d.ts.map