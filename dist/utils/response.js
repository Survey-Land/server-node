"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocale = setLocale;
exports.sendResponse = sendResponse;
const i18n_1 = __importDefault(require("../config/i18n"));
function setLocale(req) {
    const lang = req.headers["accept-language"] || "ar";
    i18n_1.default.setLocale(lang);
    return lang;
}
function sendResponse(success, message, data = null) {
    return { success, message, data };
}
