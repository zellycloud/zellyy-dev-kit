"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTAnalyzer = void 0;
const ts_morph_1 = require("ts-morph");
const fs_1 = require("fs");
const path_1 = require("path");
class ASTAnalyzer {
    project;
    constructor() {
        this.project = new ts_morph_1.Project({
            compilerOptions: {
                target: 99,
                module: 99,
                moduleResolution: 2,
                skipLibCheck: true,
                esModuleInterop: true,
                lib: ['ES2020'],
            },
            skipLoadingLibFiles: false,
        });
    }
    analyzeFile(filePath) {
        const absolutePath = (0, path_1.resolve)(filePath);
        if (!(0, fs_1.existsSync)(absolutePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        try {
            let sourceFile = this.project.getSourceFile(absolutePath);
            if (!sourceFile) {
                sourceFile = this.project.addSourceFileAtPath(absolutePath);
            }
            return {
                filePath: absolutePath,
                functions: this.extractFunctions(sourceFile),
                classes: this.extractClasses(sourceFile),
                interfaces: this.extractInterfaces(sourceFile),
                typeAliases: this.extractTypeAliases(sourceFile),
                enums: this.extractEnums(sourceFile),
                imports: this.extractImports(sourceFile),
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to analyze ${filePath}: ${error.message}`);
            }
            throw error;
        }
    }
    extractFunctions(sourceFile) {
        const functions = [];
        sourceFile.getFunctions().forEach((func) => {
            const sig = this.extractFunctionSignature(func, func.isExported());
            if (sig)
                functions.push(sig);
        });
        return functions;
    }
    extractFunctionSignature(func, isExported) {
        try {
            const name = func.getName();
            if (!name)
                return null;
            const parameters = this.extractParameters(func);
            const returnType = func.getReturnTypeNode()
                ? func.getReturnTypeNode().getText()
                : 'void';
            const isAsync = func.isAsync?.() || false;
            const typeParameters = func
                .getTypeParameters?.()
                ?.map((tp) => tp.getName?.()) || [];
            return {
                name,
                parameters,
                returnType,
                isAsync,
                isExported,
                typeParameters: typeParameters.length > 0 ? typeParameters : undefined,
                jsDoc: this.extractJsDoc(func),
                line: func.getStartLineNumber?.() || 0,
            };
        }
        catch (error) {
            return null;
        }
    }
    extractParameters(func) {
        const parameters = [];
        try {
            const params = func.getParameters?.() || [];
            if (!Array.isArray(params)) {
                return parameters;
            }
            params.forEach((param, index) => {
                try {
                    const paramName = param.getName?.();
                    let paramType = 'any';
                    try {
                        const typeNode = param.getTypeNode?.();
                        if (typeNode && typeof typeNode.getText === 'function') {
                            paramType = typeNode.getText() || 'any';
                        }
                        else if (typeof param.getType === 'function') {
                            const type = param.getType();
                            if (type && typeof type.getText === 'function') {
                                paramType = type.getText() || 'any';
                            }
                        }
                    }
                    catch (typeError) {
                    }
                    let defaultValue = undefined;
                    try {
                        const initializer = param.getInitializer?.();
                        if (initializer && typeof initializer.getText === 'function') {
                            defaultValue = initializer.getText();
                        }
                    }
                    catch {
                    }
                    parameters.push({
                        name: paramName || 'unknown',
                        type: paramType,
                        isOptional: param.isOptional?.() || false,
                        hasDefault: param.getInitializer?.() !== undefined,
                        defaultValue,
                    });
                }
                catch (paramError) {
                }
            });
        }
        catch (error) {
        }
        return parameters;
    }
    extractClasses(sourceFile) {
        const classes = [];
        sourceFile.getClasses().forEach((classDecl) => {
            const name = classDecl.getName();
            if (!name)
                return;
            const methods = [];
            classDecl.getMethods().forEach((method) => {
                const sig = this.extractFunctionSignature(method, true);
                if (sig) {
                    methods.push({
                        ...sig,
                        isPrivate: method.getScope?.() === 'private',
                        isStatic: method.isStatic?.(),
                    });
                }
            });
            const properties = [];
            classDecl.getProperties().forEach((prop) => {
                const propName = prop.getName?.();
                const propType = prop.getTypeNode?.()
                    ? prop.getTypeNode()?.getText() || 'any'
                    : 'any';
                if (propName) {
                    properties.push({
                        name: propName,
                        type: propType,
                        isOptional: prop.hasQuestionToken?.() || false,
                    });
                }
            });
            classes.push({
                name,
                isExported: classDecl.isExported?.(),
                methods,
                properties,
                jsDoc: this.extractJsDoc(classDecl),
                line: classDecl.getStartLineNumber?.() || 0,
            });
        });
        return classes;
    }
    extractInterfaces(sourceFile) {
        const interfaces = [];
        sourceFile.getInterfaces().forEach((iface) => {
            const name = iface.getName();
            if (!name)
                return;
            const properties = [];
            iface.getProperties().forEach((prop) => {
                const propName = prop.getName?.();
                const propType = prop.getTypeNode?.()
                    ? prop.getTypeNode()?.getText() || 'any'
                    : 'any';
                if (propName) {
                    properties.push({
                        name: propName,
                        type: propType,
                        isOptional: prop.hasQuestionToken?.() || false,
                    });
                }
            });
            interfaces.push({
                name,
                isExported: iface.isExported?.(),
                properties,
                jsDoc: this.extractJsDoc(iface),
                line: iface.getStartLineNumber?.() || 0,
            });
        });
        return interfaces;
    }
    extractTypeAliases(sourceFile) {
        const typeAliases = [];
        sourceFile.getTypeAliases().forEach((typeAlias) => {
            const name = typeAlias.getName();
            if (!name)
                return;
            typeAliases.push({
                name,
                isExported: typeAlias.isExported?.(),
                definition: typeAlias.getTypeNode?.()?.getText() || '',
                jsDoc: this.extractJsDoc(typeAlias),
                line: typeAlias.getStartLineNumber?.() || 0,
            });
        });
        return typeAliases;
    }
    extractEnums(sourceFile) {
        const enums = [];
        sourceFile.getEnums().forEach((enumDecl) => {
            const name = enumDecl.getName();
            if (!name)
                return;
            const members = enumDecl.getMembers().map((member) => ({
                name: member.getName?.() || '',
                value: member.getInitializer?.()?.getText?.(),
            }));
            enums.push({
                name,
                isExported: enumDecl.isExported?.(),
                members,
                jsDoc: this.extractJsDoc(enumDecl),
                line: enumDecl.getStartLineNumber?.() || 0,
            });
        });
        return enums;
    }
    extractImports(sourceFile) {
        const imports = [];
        sourceFile.getImportDeclarations().forEach((importDecl) => {
            const module = importDecl.getModuleSpecifierValue();
            if (!module)
                return;
            const isExternal = !module.startsWith('.');
            const defaultImport = importDecl.getDefaultImport();
            if (defaultImport) {
                const defaultName = defaultImport.getText?.() || '';
                if (defaultName) {
                    imports.push({
                        name: defaultName,
                        module,
                        type: 'default',
                        isExternal,
                        line: importDecl.getStartLineNumber?.() || 0,
                    });
                }
            }
            importDecl.getNamedImports().forEach((named) => {
                imports.push({
                    name: named.getName?.() || '',
                    module,
                    type: 'named',
                    isExternal,
                    line: importDecl.getStartLineNumber?.() || 0,
                });
            });
            const namespaceImport = importDecl.getNamespaceImport();
            if (namespaceImport) {
                const namespaceName = namespaceImport.getText?.() || '';
                if (namespaceName) {
                    imports.push({
                        name: namespaceName,
                        module,
                        type: 'namespace',
                        isExternal,
                        line: importDecl.getStartLineNumber?.() || 0,
                    });
                }
            }
        });
        return imports;
    }
    extractJsDoc(node) {
        try {
            const jsDocs = node.getJsDocs?.() || [];
            if (jsDocs.length > 0) {
                return jsDocs[0].getText?.();
            }
        }
        catch {
        }
        return undefined;
    }
    detectCircularDependencies(filePaths) {
        const circularDeps = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (filePath, path) => {
            const normalized = (0, path_1.resolve)(filePath);
            if (recursionStack.has(normalized)) {
                const cycleStart = path.indexOf(normalized);
                circularDeps.push({
                    files: [...path.slice(cycleStart), normalized],
                    path: [...path.slice(cycleStart), normalized].map((p) => p),
                });
                return;
            }
            if (visited.has(normalized)) {
                return;
            }
            visited.add(normalized);
            recursionStack.add(normalized);
            path.push(normalized);
            try {
                const result = this.analyzeFile(normalized);
                result.imports.forEach((imp) => {
                    if (!imp.isExternal) {
                        const resolvedPath = (0, path_1.resolve)(normalized, '..', imp.module + (imp.module.endsWith('.ts') ? '' : '.ts'));
                        if (filePaths.includes(resolvedPath)) {
                            dfs(resolvedPath, [...path]);
                        }
                    }
                });
            }
            catch {
            }
            path.pop();
            recursionStack.delete(normalized);
        };
        filePaths.forEach((filePath) => {
            if (!visited.has((0, path_1.resolve)(filePath))) {
                dfs(filePath, []);
            }
        });
        return circularDeps;
    }
}
exports.ASTAnalyzer = ASTAnalyzer;
//# sourceMappingURL=ASTAnalyzer.js.map