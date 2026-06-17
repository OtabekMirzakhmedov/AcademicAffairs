import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTeacherInfoDto } from './dto/update-teacher-info.dto';
import { UpdateUserAccountDto } from './dto/update-user-account.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { login: createUserDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user with user info
    const user = await this.prisma.user.create({
      data: {
        login: createUserDto.login,
        password: hashedPassword,
        roleId: createUserDto.roleId,
        mustChangePassword: true,
        userInfo: {
          create: {
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email1: createUserDto.email1,
            email2: createUserDto.email2,
            phone1: createUserDto.phone1,
            phone2: createUserDto.phone2,
          },
        },
      },
      include: {
        role: true,
        userInfo: true,
      },
    });

    // If teacher role and department provided, create teacher info
    if (
      user.role.name === 'teacher' &&
      createUserDto.departmentId
    ) {
      await this.prisma.teacherInfo.create({
        data: {
          userId: user.id,
          departmentId: createUserDto.departmentId,
        },
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createTeacher(createTeacherDto: CreateTeacherDto, departmentHeadId: number) {
    // Verify department head and get their department
    const department = await this.prisma.department.findFirst({
      where: { headId: departmentHeadId },
    });

    if (!department) {
      throw new ForbiddenException('You are not a department head');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { login: createTeacherDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    // Get teacher role
    const teacherRole = await this.prisma.role.findUnique({
      where: { name: 'teacher' },
    });

    if (!teacherRole) {
      throw new BadRequestException('Teacher role not found');
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create user with user info and teacher info
    const user = await this.prisma.user.create({
      data: {
        login: createTeacherDto.login,
        password: hashedPassword,
        roleId: teacherRole.id,
        mustChangePassword: true,
        userInfo: {
          create: {
            firstName: createTeacherDto.firstName,
            lastName: createTeacherDto.lastName,
            email1: createTeacherDto.email1,
            email2: createTeacherDto.email2,
            phone1: createTeacherDto.phone1,
            phone2: createTeacherDto.phone2,
          },
        },
        teacherInfo: {
          create: {
            departmentId: department.id,
          },
        },
      },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove passwords from response
    return users.map(({ password: _, ...user }) => user);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.findOne(id);

    // If login is being updated, check for conflicts
    if (updateUserDto.login && updateUserDto.login !== existingUser.login) {
      const loginExists = await this.prisma.user.findUnique({
        where: { login: updateUserDto.login },
      });

      if (loginExists) {
        throw new ConflictException('User with this login already exists');
      }
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        login: updateUserDto.login,
        roleId: updateUserDto.roleId,
        userInfo: {
          update: {
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            email1: updateUserDto.email1,
            email2: updateUserDto.email2,
            phone1: updateUserDto.phone1,
            phone2: updateUserDto.phone2,
          },
        },
      },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    // Update teacher info if needed
    if (updateUserDto.departmentId && user.role.name === 'teacher') {
      const teacherInfo = await this.prisma.teacherInfo.findUnique({
        where: { userId: id },
      });

      if (teacherInfo) {
        await this.prisma.teacherInfo.update({
          where: { userId: id },
          data: {
            departmentId: updateUserDto.departmentId,
          },
        });
      } else {
        await this.prisma.teacherInfo.create({
          data: {
            userId: id,
            departmentId: updateUserDto.departmentId,
          },
        });
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateTeacherInfo(
    teacherId: number,
    updateTeacherInfoDto: UpdateTeacherInfoDto,
    departmentHeadId: number,
  ) {
    // Verify department head and get their department
    const department = await this.prisma.department.findFirst({
      where: { headId: departmentHeadId },
    });

    if (!department) {
      throw new ForbiddenException('You are not a department head');
    }

    // Verify teacher exists and belongs to the department
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        role: true,
        teacherInfo: true,
      },
    });

    if (!teacher || teacher.role.name !== 'teacher') {
      throw new NotFoundException('Teacher not found');
    }

    if (teacher.teacherInfo?.departmentId !== department.id) {
      throw new ForbiddenException(
        'You can only update teachers in your department',
      );
    }

    // Update teacher info
    const updatedTeacherInfo = await this.prisma.teacherInfo.update({
      where: { userId: teacherId },
      data: {
        employmentType: updateTeacherInfoDto.employmentType,
        mandatoryHoursPerPeriod: updateTeacherInfoDto.mandatoryHoursPerPeriod,
        mandatoryExtracurricularHours: updateTeacherInfoDto.mandatoryExtracurricularHours,
        mandatoryConferenceArticles: updateTeacherInfoDto.mandatoryConferenceArticles,
        mandatoryNationalArticles: updateTeacherInfoDto.mandatoryNationalArticles,
        mandatoryScopusArticles: updateTeacherInfoDto.mandatoryScopusArticles,
        mandatoryDocumentation: updateTeacherInfoDto.mandatoryDocumentation,
      },
    });

    // Return full user with updated teacher info
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException('Teacher not found after update');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updateUserAccount(userId: number, updateAccountDto: UpdateUserAccountDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Separate UserInfo fields from TeacherInfo fields
    const userInfoData: any = {};
    const teacherInfoData: any = {};

    // UserInfo fields
    const userInfoFields = [
      'firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender', 'nationality',
      'countryOfBirth', 'regionOfBirth', 'currentAddress', 'permanentAddress',
      'passportSerial', 'personalId', 'stirInn', 'englishLevel', 'profileImage', 'locale',
      'email1', 'email2', 'phone1', 'phone2'
    ];

    // TeacherInfo fields
    const teacherInfoFields = [
      'bachelorUniversity', 'bachelorYear', 'bachelorDirection', 'bachelorDiplomaNumber',
      'masterUniversity', 'masterYear', 'masterDirection', 'masterDiplomaNumber',
      'researchArea', 'hasPhdDegree', 'phdYear', 'phdSpeciality', 'phdTopic',
      'phdDiplomaNumber', 'phdCountry', 'phdOrganization', 'hasDscDegree', 'dscYear',
      'dscSpeciality', 'dscTopic', 'dscDiplomaNumber', 'dscCountry', 'dscOrganization',
      'hasAcademicTitle', 'academicTitleName', 'academicTitleSpeciality', 'academicTitleYear',
      'academicTitleAttestat', 'internshipsCount', 'internshipsInfo', 'trainingCount',
      'trainingInfo', 'awardsField', 'awardsState', 'supervisedPhd', 'supervisedDsc',
      'conferencesRepublic', 'conferencesInternational', 'seminarsRepublic', 'seminarsInternational',
      'projectsFundamental', 'projectsPractical', 'projectsYouth', 'projectsBusiness',
      'projectsInnovation', 'innovativeIdeasCount'
    ];

    // Populate userInfoData
    userInfoFields.forEach((field) => {
      if (updateAccountDto[field] !== undefined) {
        userInfoData[field] = updateAccountDto[field];
      }
    });

    // Populate teacherInfoData (only for teachers)
    if (user.role.name === 'teacher') {
      teacherInfoFields.forEach((field) => {
        if (updateAccountDto[field] !== undefined) {
          teacherInfoData[field] = updateAccountDto[field];
        }
      });
    }

    // Update UserInfo if there are fields to update
    if (Object.keys(userInfoData).length > 0) {
      await this.prisma.userInfo.update({
        where: { userId },
        data: userInfoData,
      });
    }

    // Update TeacherInfo if it's a teacher and there are fields to update
    if (user.role.name === 'teacher' && Object.keys(teacherInfoData).length > 0) {
      if (user.teacherInfo) {
        await this.prisma.teacherInfo.update({
          where: { userId },
          data: teacherInfoData,
        });
      }
    }

    // Return updated user
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async toggleStatus(id: number) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      include: {
        role: true,
        userInfo: true,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: number, currentUserId: number) {
    // Get the user to be deleted
    const userToDelete = await this.findOne(id);

    // Get current user to check permissions
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        role: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    // If department head, verify they can only delete teachers from their department
    if (currentUser.role.name === 'departmenthead') {
      // Get department head's department
      const department = await this.prisma.department.findFirst({
        where: { headId: currentUserId },
      });

      if (!department) {
        throw new ForbiddenException('You are not a department head');
      }

      // Check if user being deleted is a teacher
      if (userToDelete.role.name !== 'teacher') {
        throw new ForbiddenException(
          'Department heads can only delete teachers',
        );
      }

      // Check if teacher belongs to their department
      if (userToDelete.teacherInfo?.departmentId !== department.id) {
        throw new ForbiddenException(
          'You can only delete teachers from your department',
        );
      }
    }

    // Hard delete - remove all related records first
    // Delete teaching activities
    await this.prisma.teachingActivity.deleteMany({
      where: { teacherId: id },
    });

    // Delete course teacher assignments
    await this.prisma.courseTeacher.deleteMany({
      where: { teacherId: id },
    });

    // Delete teacher scientific reports
    await this.prisma.teacherScientificReport.deleteMany({
      where: { teacherId: id },
    });

    // Delete teacher info if exists
    await this.prisma.teacherInfo.deleteMany({
      where: { userId: id },
    });

    // Delete user info if exists
    await this.prisma.userInfo.deleteMany({
      where: { userId: id },
    });

    // Finally, delete the user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
