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

  // Create department heads and teachers
  const hashedPass123 = await bcrypt.hash('pass123', 10);

  // Department Head for Mechanical Engineering
  const sarvarYusupov = await prisma.user.upsert({
    where: { login: 'headdep1' },
    update: {},
    create: {
      login: 'headdep1',
      password: hashedPass123,
      roleId: deptHeadRole.id,
      isActive: true,
      mustChangePassword: true,
      userInfo: {
        create: {
          firstName: 'Sarvar',
          lastName: 'Yusupov',
          email1: 's.yusupov@kiut.uz',
          phone1: '+998901234567',
        },
      },
      teacherInfo: {
        create: {
          departmentId: mechanicalEngDept.id,
          employmentType: 'full-time',
          mandatoryHoursPerPeriod: 300,
          mandatoryExtracurricularHours: 0,
          mandatoryConferenceArticles: 0,
          mandatoryNationalArticles: 0,
          mandatoryScopusArticles: 0,
          mandatoryDocumentation: 0,
        },
      },
    },
  });

  // Update Mechanical Engineering department with head
  await prisma.department.update({
    where: { id: mechanicalEngDept.id },
    data: { headId: sarvarYusupov.id },
  });

  // Department Head for Energy and applied sciences
  const kamolliddinAbdivahidov = await prisma.user.upsert({
    where: { login: 'headdep2' },
    update: {},
    create: {
      login: 'headdep2',
      password: hashedPass123,
      roleId: deptHeadRole.id,
      isActive: true,
      mustChangePassword: true,
      userInfo: {
        create: {
          firstName: 'Kamolliddin',
          lastName: 'Abdivahidov',
          email1: 'k.abdivahidov@kiut.uz',
          phone1: '+998901234567',
        },
      },
      teacherInfo: {
        create: {
          departmentId: energyDept.id,
          employmentType: 'full-time',
          mandatoryHoursPerPeriod: 300,
          mandatoryExtracurricularHours: 0,
          mandatoryConferenceArticles: 0,
          mandatoryNationalArticles: 0,
          mandatoryScopusArticles: 0,
          mandatoryDocumentation: 0,
        },
      },
    },
  });

  // Update Energy and applied sciences department with head
  await prisma.department.update({
    where: { id: energyDept.id },
    data: { headId: kamolliddinAbdivahidov.id },
  });

  console.log('✅ Department heads created');

  // Create teachers
  // Teacher 1 - Mechanical Engineering
  const otabekMirzakhmedov = await prisma.user.upsert({
    where: { login: 'teacher1' },
    update: {},
    create: {
      login: 'teacher1',
      password: hashedPass123,
      roleId: teacherRole.id,
      isActive: true,
      mustChangePassword: true,
      userInfo: {
        create: {
          firstName: 'Otabek',
          lastName: 'Mirzakhmedov',
          email1: 'o.mirzaxmedov@kiut.uz',
          phone1: '+998974953804',
        },
      },
      teacherInfo: {
        create: {
          departmentId: mechanicalEngDept.id,
          employmentType: 'full-time',
          mandatoryHoursPerPeriod: 550,
          mandatoryExtracurricularHours: 0,
          mandatoryConferenceArticles: 0,
          mandatoryNationalArticles: 0,
          mandatoryScopusArticles: 1,
          mandatoryDocumentation: 0,
        },
      },
    },
  });

  // Teacher 2 - Energy and applied sciences
  const malikaPlatoshina = await prisma.user.upsert({
    where: { login: 'teacher2' },
    update: {},
    create: {
      login: 'teacher2',
      password: hashedPass123,
      roleId: teacherRole.id,
      isActive: true,
      mustChangePassword: true,
      userInfo: {
        create: {
          firstName: 'Malika',
          lastName: 'Platoshina',
          email1: 'm.platoshina@kiut.uz',
          phone1: '+998974953804',
        },
      },
      teacherInfo: {
        create: {
          departmentId: energyDept.id,
          employmentType: 'full-time',
          mandatoryHoursPerPeriod: 550,
          mandatoryExtracurricularHours: 0,
          mandatoryConferenceArticles: 0,
          mandatoryNationalArticles: 0,
          mandatoryScopusArticles: 1,
          mandatoryDocumentation: 0,
        },
      },
    },
  });

  // Teacher 3 - Mechanical Engineering (part-time)
  const sardorMusurmonov = await prisma.user.upsert({
    where: { login: 'teacher3' },
    update: {},
    create: {
      login: 'teacher3',
      password: hashedPass123,
      roleId: teacherRole.id,
      isActive: true,
      mustChangePassword: true,
      userInfo: {
        create: {
          firstName: 'Sardor',
          lastName: 'Musurmonov',
          email1: 's.musurmonov@kiut.uz',
          phone1: '+998974953804',
        },
      },
      teacherInfo: {
        create: {
          departmentId: mechanicalEngDept.id,
          employmentType: 'part-time',
          mandatoryHoursPerPeriod: 250,
          mandatoryExtracurricularHours: 0,
          mandatoryConferenceArticles: 0,
          mandatoryNationalArticles: 0,
          mandatoryScopusArticles: 0,
          mandatoryDocumentation: 0,
        },
      },
    },
  });

  // Teacher 4 - Mechanical Engineering (contract)
  const abrorXoshimov = await prisma.user.upsert({
    where: { login: 'teacher4' },
    update: {},
    create: {
      login: 'teacher4',
      password: hashedPass123,
      roleId: teacherRole.id,
      isActive: true,
      mustChangePassword: true,
      userInfo: {
        create: {
          firstName: 'Abror',
          lastName: 'Xoshimov',
          email1: 'abror.xoshimov@gmail.com',
          phone1: '+998974953804',
        },
      },
      teacherInfo: {
        create: {
          departmentId: mechanicalEngDept.id,
          employmentType: 'contract',
          mandatoryHoursPerPeriod: 150,
          mandatoryExtracurricularHours: 0,
          mandatoryConferenceArticles: 0,
          mandatoryNationalArticles: 0,
          mandatoryScopusArticles: 0,
          mandatoryDocumentation: 0,
        },
      },
    },
  });

  console.log('✅ Teachers created');

  // Create courses
  const engineeringLinearSystems = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Engineering linear systems',
      departmentId: mechanicalEngDept.id,
    },
  });

  const rationalMechanics = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Rational mechanics',
      departmentId: mechanicalEngDept.id,
    },
  });

  const projectManagement = await prisma.course.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Project management',
      departmentId: mechanicalEngDept.id,
    },
  });

  const strengthOfMaterials = await prisma.course.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Strength of Materials',
      departmentId: energyDept.id,
    },
  });

  console.log('✅ Courses created');

  // Create course-teacher assignments for the active academic period
  const courseTeacher1 = await prisma.courseTeacher.upsert({
    where: { id: 1 },
    update: {},
    create: {
      courseId: engineeringLinearSystems.id,
      teacherId: otabekMirzakhmedov.id,
      academicPeriodId: academicPeriod.id,
    },
  });

  const courseTeacher2 = await prisma.courseTeacher.upsert({
    where: { id: 2 },
    update: {},
    create: {
      courseId: rationalMechanics.id,
      teacherId: otabekMirzakhmedov.id,
      academicPeriodId: academicPeriod.id,
    },
  });

  const courseTeacher3 = await prisma.courseTeacher.upsert({
    where: { id: 3 },
    update: {},
    create: {
      courseId: projectManagement.id,
      teacherId: abrorXoshimov.id,
      academicPeriodId: academicPeriod.id,
    },
  });

  const courseTeacher4 = await prisma.courseTeacher.upsert({
    where: { id: 4 },
    update: {},
    create: {
      courseId: strengthOfMaterials.id,
      teacherId: malikaPlatoshina.id,
      academicPeriodId: academicPeriod.id,
    },
  });

  console.log('✅ Course assignments created');

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
