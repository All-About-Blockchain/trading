"use strict";
/**
 * Webhook server for GitHub deployments
 * Listens for webhook calls and triggers deploy
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var app = (0, express_1.default)();
var PORT = process.env.WEBHOOK_PORT || 3003;
var DEPLOY_SCRIPT = '/home/biest/aab-projects/hyperliquid-trading/scripts/deploy.sh';
var WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
app.use(express_1.default.json());
// Deploy endpoint
app.post('/deploy', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, _a, stdout, stderr, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // Verify secret if set
                if (WEBHOOK_SECRET) {
                    token = req.headers['x-webhook-secret'];
                    if (token !== WEBHOOK_SECRET) {
                        res.status(401).json({ error: 'Unauthorized' });
                        return [2 /*return*/];
                    }
                }
                console.log('Deploy triggered:', new Date().toISOString());
                console.log('Headers:', JSON.stringify(req.headers));
                console.log('Body:', JSON.stringify(req.body));
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, execAsync("bash ".concat(DEPLOY_SCRIPT))];
            case 2:
                _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                console.log('Deploy output:', stdout);
                if (stderr)
                    console.error('Deploy errors:', stderr);
                res.json({ success: true, message: 'Deployment triggered' });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('Deploy failed:', error_1);
                res.status(500).json({ error: 'Deploy failed', details: error_1.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Health check
app.get('/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, function () {
    console.log("Webhook server running on port ".concat(PORT));
    console.log("Deploy URL: http://localhost:".concat(PORT, "/deploy"));
});
// Start if run directly
if (require.main === module) {
    console.log('Webhook deployment server ready');
}
