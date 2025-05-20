"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const authService_1 = require("./services/authService");
async function bootstrap() {
    const { created } = await authService_1.AuthService.createAdminUser('en');
    console.log(created ? '✅ Admin user created' : 'ℹ️ Admin user already exists');
    const port = parseInt(process.env.PORT || '3000', 10);
    const server = new app_1.default();
    await server.listen(port);
}
bootstrap().catch((error) => {
    console.error('Failed to start the server:', error);
    process.exit(1);
});
