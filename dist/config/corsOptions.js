"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Specify which methods are allowed
    allowedHeaders: ["Content-Type", "Authorization", "accept-language"], // Specify which headers are allowed
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    exposedHeaders: ["accept-language"],
};
exports.default = corsOptions;
