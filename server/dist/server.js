"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const players_routes_1 = __importDefault(require("./routes/players.routes"));
const votes_routes_1 = __importDefault(require("./routes/votes.routes"));
const transfer_routes_1 = __importDefault(require("./routes/transfer.routes"));
const transfer_admin_routes_1 = __importDefault(require("./routes/transfer-admin.routes"));
const news_routes_1 = __importDefault(require("./routes/news.routes"));
const poll_routes_1 = __importDefault(require("./routes/poll.routes"));
const custom_polls_routes_1 = __importDefault(require("./routes/custom-polls.routes"));
const discussions_routes_1 = __importDefault(require("./routes/discussions.routes"));
const user_management_routes_1 = __importDefault(require("./routes/user-management.routes"));
const maritodle_routes_1 = __importDefault(require("./routes/maritodle.routes"));
const maritodle_daily_routes_1 = __importDefault(require("./routes/maritodle-daily.routes"));
const player_ratings_routes_1 = __importDefault(require("./routes/player-ratings.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const scheduler_service_1 = __importDefault(require("./services/scheduler.service"));
const maritodle_scheduler_service_1 = __importDefault(require("./services/maritodle-scheduler.service"));
const app = (0, express_1.default)();
// Compression middleware - should be early in the middleware stack
app.use((0, compression_1.default)({
    filter: (req, res) => {
        // Don't compress responses if the client doesn't support it
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Use compression filter function
        return compression_1.default.filter(req, res);
    },
    level: 6,
    threshold: 1024, // Only compress responses larger than 1KB
}));
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:*"],
        },
    },
}));
// CORS middleware
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:5173/',
        config_1.default.clientUrl
    ],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
}));
app.use((0, cookie_parser_1.default)(config_1.default.cookieSecret));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static files with caching headers and CORS
app.use('/images', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}, express_1.default.static(path_1.default.resolve(__dirname, '../../public/images'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
}));
// Debug: Log the images directory path
const imagesPath = path_1.default.resolve(__dirname, '../../public/images');
console.log('Images directory path:', imagesPath);
console.log('Directory exists:', require('fs').existsSync(imagesPath));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/players', players_routes_1.default);
app.use('/api/votes', votes_routes_1.default);
app.use('/api/transfer', transfer_routes_1.default);
app.use('/api/admin/transfer', transfer_admin_routes_1.default);
app.use('/api/news', news_routes_1.default);
app.use('/api/poll', poll_routes_1.default);
app.use('/api/custom-polls', custom_polls_routes_1.default);
app.use('/api/discussions', discussions_routes_1.default);
app.use('/api/admin', user_management_routes_1.default);
app.use('/api/maritodle', maritodle_routes_1.default);
app.use('/api/maritodle-daily', maritodle_daily_routes_1.default);
app.use('/api/player-ratings', player_ratings_routes_1.default);
// Error handling
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// Start server
const PORT = config_1.default.port;
app.listen(PORT, () => {
    console.log(`Server running in ${config_1.default.nodeEnv} mode on port ${PORT}`);
    console.log(`Compression enabled for responses > 1KB`);
    // Inicializar scheduler para verificação automática de novos jogos
    console.log('🚀 Initializing automatic voting system...');
    scheduler_service_1.default.startAutoVotingCheck();
    // Inicializar scheduler do maritodle diário
    console.log('🎮 Initializing Maritodle daily scheduler...');
    maritodle_scheduler_service_1.default.startDailyScheduler();
});
exports.default = app;
