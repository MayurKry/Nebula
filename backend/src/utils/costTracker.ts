/**
 * Cost Tracker Utility
 * Logs all Gemini API calls with estimated costs
 */

export interface APICallLog {
    timestamp: Date;
    model: string;
    type: 'image' | 'video' | 'text';
    status: 'success' | 'failed' | 'attempted';
    estimatedCost: number;
    metadata?: any;
}

class CostTracker {
    private logs: APICallLog[] = [];
    private sessionCost: number = 0;

    // Pricing as of 2026
    private pricing = {
        // Image generation
        'imagen-2.0-generate-001': 0.02,
        'imagen-3.0-fast-generate-001': 0.02,
        'imagen-3.0-generate-001': 0.04,
        'imagen-3.0-generate-002': 0.04,
        'imagen-4.0-fast-generate-001': 0.04,
        'imagen-4.0-generate-001': 0.06,
        'imagen-4.0-ultra-generate-001': 0.08,

        // Text generation (per 1K characters)
        'gemini-1.5-flash-input': 0.0001875,
        'gemini-1.5-flash-output': 0.00075,
        'gemini-1.5-pro-input': 0.00125,
        'gemini-1.5-pro-output': 0.005,

        // Video generation
        'veo-2.0-6s': 0.30,
        'veo-2.0-12s': 0.50,
        'veo-2.0-24s': 0.80,
    };

    logCall(call: APICallLog): void {
        this.logs.push(call);
        if (call.status === 'success') {
            this.sessionCost += call.estimatedCost;
        }

        // Console log with color coding
        const costStr = `$${call.estimatedCost.toFixed(4)}`;
        const statusEmoji = call.status === 'success' ? '✅' : call.status === 'failed' ? '❌' : '🔄';

        console.log(`
╔════════════════════════════════════════════════════════════════
║ ${statusEmoji} GEMINI API CALL - ${call.type.toUpperCase()}
╟────────────────────────────────────────────────────────────────
║ Model: ${call.model}
║ Status: ${call.status}
║ Estimated Cost: ${costStr}
║ Session Total: $${this.sessionCost.toFixed(4)}
║ Timestamp: ${call.timestamp.toISOString()}
${call.metadata ? `║ Metadata: ${JSON.stringify(call.metadata)}` : ''}
╚════════════════════════════════════════════════════════════════
`);
    }

    estimateImageCost(model: string): number {
        return this.pricing[model] || 0.04; // Default to Imagen 3.0 price
    }

    estimateTextCost(model: string, inputChars: number, outputChars: number): number {
        const modelBase = model.includes('pro') ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
        const inputCost = (inputChars / 1000) * this.pricing[`${modelBase}-input`];
        const outputCost = (outputChars / 1000) * this.pricing[`${modelBase}-output`];
        return inputCost + outputCost;
    }

    estimateVideoCost(duration: number): number {
        if (duration <= 6) return this.pricing['veo-2.0-6s'];
        if (duration <= 12) return this.pricing['veo-2.0-12s'];
        return this.pricing['veo-2.0-24s'];
    }

    getSessionCost(): number {
        return this.sessionCost;
    }

    getAllLogs(): APICallLog[] {
        return this.logs;
    }

    getSessionSummary(): string {
        const successCount = this.logs.filter(l => l.status === 'success').length;
        const failedCount = this.logs.filter(l => l.status === 'failed').length;
        const attemptedCount = this.logs.filter(l => l.status === 'attempted').length;

        return `
╔════════════════════════════════════════════════════════════════
║              GEMINI API SESSION SUMMARY
╟────────────────────────────────────────────────────────────────
║ Total Successful Calls: ${successCount}
║ Total Failed Calls: ${failedCount}
║ Total Attempted Calls: ${attemptedCount}
║ Total Estimated Cost: $${this.sessionCost.toFixed(4)}
╚════════════════════════════════════════════════════════════════
`;
    }

    reset(): void {
        this.logs = [];
        this.sessionCost = 0;
        console.log('[Cost Tracker] Session reset');
    }
}

export const costTracker = new CostTracker();
export default costTracker;
