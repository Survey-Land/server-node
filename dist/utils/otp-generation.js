"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.compareOtp = compareOtp;
exports.getExpiry = getExpiry;
const crypto_1 = require("crypto");
const bcrypt_1 = __importDefault(require("bcrypt"));
function generateOtp() {
    return (0, crypto_1.randomInt)(0, 1000000).toString().padStart(6, "0");
}
async function hashOtp(plain) {
    const salt = await bcrypt_1.default.genSalt(12);
    return bcrypt_1.default.hash(plain, salt);
}
async function compareOtp(plain, otpHash) {
    return bcrypt_1.default.compare(plain, otpHash);
}
function getExpiry(minutes = 5) {
    return new Date(Date.now() + minutes * 60000);
}
