"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
require("dotenv/config");
const port = parseInt(process.env.PORT || '3000', 10);
const server = new app_1.default();
server.listen(port).catch((error) => {
    console.error('Failed to start the server:', error);
    process.exit(1);
});
