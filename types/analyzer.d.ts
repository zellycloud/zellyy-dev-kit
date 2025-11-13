export interface Parameter {
    name: string;
    type: string;
    isOptional: boolean;
    hasDefault: boolean;
    defaultValue?: string;
}
export interface FunctionSignature {
    name: string;
    parameters: Parameter[];
    returnType: string;
    isAsync: boolean;
    isExported: boolean;
    isPrivate?: boolean;
    typeParameters?: string[];
    jsDoc?: string;
    line: number;
}
export interface ClassMethod extends FunctionSignature {
    isStatic?: boolean;
}
export interface ClassInfo {
    name: string;
    isExported: boolean;
    methods: ClassMethod[];
    properties: PropertyInfo[];
    jsDoc?: string;
    line: number;
}
export interface PropertyInfo {
    name: string;
    type: string;
    isOptional: boolean;
    jsDoc?: string;
}
export interface InterfaceInfo {
    name: string;
    isExported: boolean;
    properties: PropertyInfo[];
    jsDoc?: string;
    line: number;
}
export interface TypeAliasInfo {
    name: string;
    isExported: boolean;
    definition: string;
    jsDoc?: string;
    line: number;
}
export interface EnumMember {
    name: string;
    value?: string | number;
}
export interface EnumInfo {
    name: string;
    isExported: boolean;
    members: EnumMember[];
    jsDoc?: string;
    line: number;
}
export interface ImportInfo {
    name: string;
    module: string;
    type: 'default' | 'named' | 'namespace';
    isExternal: boolean;
    line: number;
}
export interface AnalysisResult {
    filePath: string;
    functions: FunctionSignature[];
    classes: ClassInfo[];
    interfaces: InterfaceInfo[];
    typeAliases: TypeAliasInfo[];
    enums: EnumInfo[];
    imports: ImportInfo[];
}
export interface CircularDependency {
    files: string[];
    path: string[];
}
export interface ParsedError {
    type: 'assertion' | 'type' | 'import' | 'signature' | 'async' | 'mock' | 'other';
    message: string;
    file: string;
    line: number;
    column: number;
    context: {
        code: string;
        expected?: string;
        actual?: string;
    };
}
export interface FixIntent {
    type: 'add' | 'remove' | 'modify' | 'replace';
    target: 'import' | 'type' | 'param' | 'call' | 'assertion';
    severity: 'critical' | 'major' | 'minor';
    confidence: number;
    suggestion: string;
}
//# sourceMappingURL=analyzer.d.ts.map