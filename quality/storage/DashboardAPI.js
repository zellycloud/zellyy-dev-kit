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
exports.DashboardAPI = void 0;
class DashboardAPI {
    config;
    constructor(config) {
        this.config = {
            timeout: 5000,
            retries: 3,
            ...config,
        };
    }
    async pushMetrics(payload) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.retries; attempt++) {
            try {
                const response = await this.callApi(payload, attempt);
                return response;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < this.config.retries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.warn(`⚠️  API 호출 실패 (시도 ${attempt}/${this.config.retries}): ${lastError.message}`);
                    console.warn(`   ${delay}ms 후 재시도...`);
                    await this.sleep(delay);
                }
            }
        }
        throw new Error(`Dashboard API 호출 실패 (${this.config.retries} 회 재시도 후): ${lastError?.message}`);
    }
    async callApi(payload, attempt) {
        const url = `${this.config.dashboardUrl}/api/metrics/push`;
        console.log(`📤 대시보드로 메트릭 푸시 중... (시도 ${attempt})`);
        console.log(`   URL: ${url}`);
        console.log(`   프로젝트: ${payload.projectId}`);
        try {
            const response = await Promise.race([
                (global.fetch || this.nodeFetch)(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                    body: JSON.stringify(payload),
                }),
                this.createTimeout(),
            ]);
            if (!response || typeof response.json !== 'function') {
                throw new Error('Invalid response from server');
            }
            const data = (await response.json());
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${data.message}`);
            }
            if (data.success && data.metricId) {
                console.log(`✅ 메트릭 푸시 성공`);
                console.log(`   메트릭 ID: ${data.metricId}`);
                return data;
            }
            else {
                throw new Error(`API 응답 오류: ${data.message}`);
            }
        }
        catch (error) {
            throw error;
        }
    }
    nodeFetch = async (url, options) => {
        try {
            const fetch = (await Promise.resolve().then(() => __importStar(require('node-fetch')))).default;
            return fetch(url, options);
        }
        catch {
            throw new Error('fetch is not available. Please use Node.js 18+ or install node-fetch');
        }
    };
    createTimeout() {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`API 호출 타임아웃 (${this.config.timeout}ms)`));
            }, this.config.timeout);
        });
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async testConnection() {
        try {
            const url = `${this.config.dashboardUrl}/api/health`;
            const response = await Promise.race([
                (global.fetch || this.nodeFetch)(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                }),
                this.createTimeout(),
            ]);
            console.log(`✅ 대시보드 연결 성공: ${this.config.dashboardUrl}`);
            return response.ok;
        }
        catch (error) {
            console.warn(`⚠️  대시보드 연결 실패: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
}
exports.DashboardAPI = DashboardAPI;
exports.default = DashboardAPI;
//# sourceMappingURL=DashboardAPI.js.map