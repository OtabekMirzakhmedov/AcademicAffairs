import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System administrator with full access',
    },
  });

  const deptHeadRole = await prisma.role.upsert({
    where: { name: 'departmenthead' },
    update: {},
    create: {
      name: 'departmenthead',
      description: 'Department head with management access',
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: 'teacher' },
    update: {},
    create: {
      name: 'teacher',
      description: 'Teacher with activity tracking access',
    },
  });

  console.log('✅ Roles created');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
      mustChangePassword: true,
      userInfo: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          email1: 'admin@university.edu',
        },
      },
    },
  });

  console.log('✅ Admin user created (login: admin, password: admin123)');

  // Create a sample academic period
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  const academicPeriod = await prisma.academicPeriod.upsert({
    where: { id: 1 },
    update: {},
    create: {
      academicYear: academicYear,
      semester: 1,
      teachingWeek: 1,
      isActive: true,
      startDate: new Date(`${currentYear}-09-01`),
      endDate: new Date(`${currentYear + 1}-01-31`),
    },
  });

  console.log(`✅ Academic period created: ${academicYear} - Semester 1`);

  // Create departments
  const mechanicalEngDept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Mechanical Engineering',
      phone: '+998974953804',
      roomNumber: 'B-601',
    },
  });

  const energyDept = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Energy and applied sciences',
      phone: '+998974953804',
      roomNumber: 'B-611',
    },
  });

  console.log('✅ Departments created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Login: admin');
  console.log('   Password: admin123');
  console.log('   ⚠️  You will be required to change the password on first login\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
