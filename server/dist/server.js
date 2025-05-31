"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const players_routes_1 = __importDefault(require("./routes/players.routes"));
const poll_routes_1 = __importDefault(require("./routes/poll.routes"));
const custom_polls_routes_1 = __importDefault(require("./routes/custom-polls.routes"));
const user_management_routes_1 = __importDefault(require("./routes/user-management.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(config_1.default.cookieSecret));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api", players_routes_1.default);
app.use("/api/poll", poll_routes_1.default);
app.use("/api", custom_polls_routes_1.default);
app.use("/api/admin", user_management_routes_1.default);
// Error handling middleware
app.use(error_middleware_1.errorHandler);
const PORT = config_1.default.port || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
