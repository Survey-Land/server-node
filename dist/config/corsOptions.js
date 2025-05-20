"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
exports.default = corsOptions;
