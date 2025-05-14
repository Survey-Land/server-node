import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';

dotenv.config();

async function createSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
    
    // Check if superAdmin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        role: 'superAdmin'
      }
    });
    
    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const superAdmin = await prisma.user.create({
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
    
  } catch (error) {
    console.error('Failed to create SuperAdmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createSuperAdmin();
}

export default createSuperAdmin; 