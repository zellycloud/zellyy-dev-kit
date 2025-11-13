"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSqliteStorage = exports.SqliteStorage = exports.JsonStorage = exports.STORAGE_PATHS = void 0;
exports.getProjectMetricsPath = getProjectMetricsPath;
exports.getProjectCoveragePath = getProjectCoveragePath;
exports.getProjectLintErrorsPath = getProjectLintErrorsPath;
exports.getProjectStoragePath = getProjectStoragePath;
exports.getProjectLogsPath = getProjectLogsPath;
exports.getProjectPushQueuePath = getProjectPushQueuePath;
exports.createJsonStorage = createJsonStorage;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const json_storage_1 = require("./json-storage");
exports.STORAGE_PATHS = {
    ZY_HOME: path_1.default.join(os_1.default.homedir(), '.zy'),
    PROJECTS_DIR: path_1.default.join(os_1.default.homedir(), '.zy', 'projects'),
    LOGS_DIR: path_1.default.join(os_1.default.homedir(), '.zy', 'logs'),
    CACHE_DIR: path_1.default.join(os_1.default.homedir(), '.zy', 'cache'),
    CONFIG_FILE: path_1.default.join(os_1.default.homedir(), '.zy', 'config.json'),
};
function getProjectMetricsPath(projectId) {
    return path_1.default.join(exports.STORAGE_PATHS.PROJECTS_DIR, projectId, 'metrics.json');
}
function getProjectCoveragePath(projectId) {
    return path_1.default.join(exports.STORAGE_PATHS.PROJECTS_DIR, projectId, 'coverage.json');
}
function getProjectLintErrorsPath(projectId) {
    return path_1.default.join(exports.STORAGE_PATHS.PROJECTS_DIR, projectId, 'lint-errors.json');
}
function getProjectStoragePath(projectId) {
    return path_1.default.join(exports.STORAGE_PATHS.PROJECTS_DIR, projectId);
}
function getProjectLogsPath(projectId) {
    return path_1.default.join(exports.STORAGE_PATHS.PROJECTS_DIR, projectId, 'logs');
}
function getProjectPushQueuePath(projectId) {
    return path_1.default.join(exports.STORAGE_PATHS.PROJECTS_DIR, projectId, 'push-queue.json');
}
function createJsonStorage(projectId) {
    return new json_storage_1.JsonStorage(projectId);
}
var json_storage_2 = require("./json-storage");
Object.defineProperty(exports, "JsonStorage", { enumerable: true, get: function () { return json_storage_2.JsonStorage; } });
var json_storage_3 = require("./json-storage");
Object.defineProperty(exports, "SqliteStorage", { enumerable: true, get: function () { return json_storage_3.JsonStorage; } });
exports.createSqliteStorage = createJsonStorage;
exports.default = {
    STORAGE_PATHS: exports.STORAGE_PATHS,
    getProjectMetricsPath,
    getProjectCoveragePath,
    getProjectLintErrorsPath,
    getProjectStoragePath,
    getProjectLogsPath,
    getProjectPushQueuePath,
    createJsonStorage,
    createSqliteStorage: exports.createSqliteStorage,
};
//# sourceMappingURL=index.js.map