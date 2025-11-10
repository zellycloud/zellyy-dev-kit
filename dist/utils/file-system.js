"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class FileSystem {
    static async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf-8');
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`파일을 읽을 수 없습니다: ${filePath} - ${error.message}`);
            }
            throw error;
        }
    }
    static async writeFile(filePath, content) {
        try {
            const dir = path.dirname(filePath);
            await this.ensureDir(dir);
            await fs.writeFile(filePath, content, 'utf-8');
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`파일을 작성할 수 없습니다: ${filePath} - ${error.message}`);
            }
            throw error;
        }
    }
    static async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    static async copyTemplate(source, dest) {
        try {
            const exists = await this.fileExists(source);
            if (!exists) {
                throw new Error(`소스 파일이 존재하지 않습니다: ${source}`);
            }
            const dir = path.dirname(dest);
            await this.ensureDir(dir);
            await fs.copyFile(source, dest);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`템플릿 복사 실패: ${source} -> ${dest} - ${error.message}`);
            }
            throw error;
        }
    }
    static async findProjectRoot(startPath = process.cwd()) {
        let currentPath = path.resolve(startPath);
        const root = path.parse(currentPath).root;
        while (currentPath !== root) {
            const packageJsonPath = path.join(currentPath, 'package.json');
            const exists = await this.fileExists(packageJsonPath);
            if (exists) {
                return currentPath;
            }
            const parentPath = path.dirname(currentPath);
            if (parentPath === currentPath) {
                break;
            }
            currentPath = parentPath;
        }
        return path.resolve(startPath);
    }
    static async ensureDir(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`디렉토리 생성 실패: ${dirPath} - ${error.message}`);
            }
            throw error;
        }
    }
    static async remove(filePath, recursive = false) {
        try {
            const exists = await this.fileExists(filePath);
            if (!exists) {
                return;
            }
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                await fs.rm(filePath, { recursive, force: true });
            }
            else {
                await fs.unlink(filePath);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`삭제 실패: ${filePath} - ${error.message}`);
            }
            throw error;
        }
    }
    static async readDir(dirPath) {
        try {
            return await fs.readdir(dirPath);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`디렉토리 읽기 실패: ${dirPath} - ${error.message}`);
            }
            throw error;
        }
    }
    static resolve(...paths) {
        return path.resolve(...paths);
    }
    static join(...paths) {
        return path.join(...paths);
    }
    static extname(filePath) {
        return path.extname(filePath);
    }
    static basename(filePath, ext) {
        return path.basename(filePath, ext);
    }
    static dirname(filePath) {
        return path.dirname(filePath);
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=file-system.js.map