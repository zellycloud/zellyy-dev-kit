"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLReporter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class HTMLReporter {
    async write(result, filePath) {
        try {
            const dir = path_1.default.dirname(filePath);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            const html = this.generateHTML(result);
            fs_1.default.writeFileSync(filePath, html, 'utf-8');
            console.log(`\n✅ Quality report saved: ${filePath}`);
        }
        catch (error) {
            console.error(`Error writing HTML report: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    generateHTML(result) {
        const statusColor = result.status === 'passed' ? '#10b981' : '#ef4444';
        const statusText = result.status === 'passed' ? 'PASSED' : 'FAILED';
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quality Gates Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      background: ${statusColor};
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 1.2em;
      margin-top: 15px;
    }
    .metrics {
      padding: 40px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      background: #f9fafb;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .metric-card h3 {
      font-size: 0.9em;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    .metric-unit {
      font-size: 0.8em;
      color: #999;
      margin-left: 5px;
    }
    .trust5-section {
      padding: 40px;
    }
    .trust5-section h2 {
      font-size: 1.5em;
      margin-bottom: 20px;
      color: #333;
    }
    .trust5-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    .trust5-item {
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
    }
    .trust5-item.passed {
      border-color: #10b981;
      background: #ecfdf5;
    }
    .trust5-item.failed {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .trust5-item h3 {
      font-size: 1em;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .trust5-item p {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 5px;
    }
    .icon {
      font-size: 1.2em;
    }
    .details-section {
      padding: 40px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .details-section h2 {
      font-size: 1.5em;
      margin-bottom: 20px;
      color: #333;
    }
    .details-list {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .detail-item {
      padding: 12px 15px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.9em;
      color: #666;
      font-family: 'Courier New', monospace;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .footer {
      padding: 20px 40px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #999;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Quality Gates Report</h1>
      <div class="status">${statusText}</div>
      <p style="margin-top: 15px; opacity: 0.9;">Generated: ${new Date(result.timestamp).toLocaleString()}</p>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <h3>Quality Score</h3>
        <div class="metric-value">${result.score}<span class="metric-unit">/100</span></div>
      </div>
      <div class="metric-card">
        <h3>Duration</h3>
        <div class="metric-value">${result.durationMs}<span class="metric-unit">ms</span></div>
      </div>
      <div class="metric-card">
        <h3>Coverage</h3>
        <div class="metric-value">${result.coverage.percentage.toFixed(1)}<span class="metric-unit">%</span></div>
      </div>
    </div>

    <div class="trust5-section">
      <h2>TRUST 5 Quality Gates</h2>
      <div class="trust5-grid">
        ${this.renderTrust5Item('Tests', result.coverage)}
        ${this.renderTrust5Item('Readable', result.readable)}
        ${this.renderTrust5Item('Unified', result.unified)}
        ${this.renderTrust5Item('Secured', result.secured)}
        ${this.renderTrust5Item('Trackable', result.trackable)}
      </div>
    </div>

    ${this.renderDetails(result)}

    <div class="footer">
      <p>${result.summary}</p>
    </div>
  </div>
</body>
</html>`;
    }
    renderTrust5Item(name, result) {
        const icon = result.passed ? '✅' : '❌';
        const className = result.passed ? 'passed' : 'failed';
        return `
      <div class="trust5-item ${className}">
        <h3><span class="icon">${icon}</span> ${name}</h3>
        <p>${result.message}</p>
      </div>
    `;
    }
    renderDetails(result) {
        const details = [];
        if (!result.coverage.passed && result.coverage.fileDetails) {
            details.push(`<strong>Coverage Failures (lowest files):</strong>`);
            result.coverage.fileDetails.slice(0, 5).forEach(f => {
                details.push(`${f.path}: ${f.coverage.toFixed(1)}%`);
            });
        }
        if (!result.readable.passed && result.readable.errors) {
            details.push(`<strong>Style Violations (first 5):</strong>`);
            result.readable.errors.slice(0, 5).forEach(e => {
                details.push(`${e.file}:${e.line}:${e.column} - ${e.rule}`);
            });
        }
        if (details.length === 0) {
            return '';
        }
        return `
      <div class="details-section">
        <h2>Details</h2>
        <div class="details-list">
          ${details.map(d => `<div class="detail-item">${d}</div>`).join('')}
        </div>
      </div>
    `;
    }
}
exports.HTMLReporter = HTMLReporter;
//# sourceMappingURL=HTMLReporter.js.map