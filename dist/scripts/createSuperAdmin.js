"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function createSuperAdmin() {
    try {
        const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
        const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
        // Check if superAdmin already exists
        const existingSuperAdmin = await prisma_1.default.user.findFirst({
            where: {
                role: 'superAdmin'
            }
        });
        if (existingSuperAdmin) {
            console.log('SuperAdmin already exists.');
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const superAdmin = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'superAdmin',
                provider: 'local',
                isEmailVerified: true,
                userIsActive: true
            }
        });
        console.log('SuperAdmin created successfully:', {
            id: superAdmin.id,
            email: superAdmin.email,
            name: superAdmin.name
        });
    }
    catch (error) {
        console.error('Failed to create SuperAdmin:', error);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
// Run the function if this file is executed directly
if (require.main === module) {
    createSuperAdmin();
}
exports.default = createSuperAdmin;
