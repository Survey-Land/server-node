"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const not_foundMiddleware_1 = require("./middleware/not-foundMiddleware");
require("./lib/cron/surveyDeadlineChecker");
const qs_1 = __importDefault(require("qs"));
const passport_1 = __importDefault(require("./config/passport"));
const cors_1 = __importDefault(require("cors"));
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const limiterOptions_1 = __importDefault(require("./config/limiterOptions"));
const i18n_1 = __importDefault(require("i18n"));
const i18n_2 = __importDefault(require("./config/i18n"));
dotenv_1.default.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configureCore();
        this.configureMiddlewares();
        this.configureRoutes();
        this.configureErrorHandlers();
        this.app.use(i18n_2.default.init);
    }
    configureCore() {
        this.app.set("query parser", (str) => qs_1.default.parse(str, { allowDots: true }));
        this.app.set("trust proxy", 1);
    }
    configureMiddlewares() {
        this.app.use((0, helmet_1.default)({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
        this.app.use((0, cors_1.default)(corsOptions_1.default));
        this.app.use(limiterOptions_1.default);
        this.app.use((0, morgan_1.default)("dev"));
        this.app.use(express_1.default.json());
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(passport_1.default.initialize());
        this.app.use(i18n_1.default.init);
    }
    configureRoutes() {
        this.app.use("/api", routes_1.default);
    }
    configureErrorHandlers() {
        this.app.use(not_foundMiddleware_1.notFoundHandler);
        this.app.use(errorMiddleware_1.errorHandler);
    }
    async listen(port = process.env.PORT || 3000) {
        const portNumber = typeof port === "string" ? parseInt(port, 10) : port;
        this.app.listen(portNumber, () => {
            console.log(`Server running on http://localhost:${portNumber}`);
        });
    }
}
exports.default = App;
