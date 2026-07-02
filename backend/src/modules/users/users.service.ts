import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditActor } from '../audit/interfaces/audit-actor.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTeacherInfoDto } from './dto/update-teacher-info.dto';
import { UpdateUserAccountDto } from './dto/update-user-account.dto';
import {
  ACCOUNT_SUMMARY_LABELS,
  resolveAccountSummaryLang,
} from './reports/account-summary.labels';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto, actor: AuditActor) {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: createUserDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

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

    if (user.role.name === 'teacher' && createUserDto.departmentId) {
      await this.prisma.teacherInfo.create({
        data: {
          userId: user.id,
          departmentId: createUserDto.departmentId,
        },
      });
    }

    await this.audit.log(actor, 'create', 'User', user.id, {
      after: { id: user.id, login: user.login, role: user.role.name },
    });
    this.logger.log({
      event: 'user.created',
      userId: user.id,
      login: user.login,
      actorId: actor.id,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createTeacher(createTeacherDto: CreateTeacherDto, actor: AuditActor) {
    const department = await this.prisma.department.findFirst({
      where: { headId: actor.id },
    });

    if (!department) {
      throw new ForbiddenException('You are not a department head');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { login: createTeacherDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    const teacherRole = await this.prisma.role.findUnique({
      where: { name: 'teacher' },
    });

    if (!teacherRole) {
      throw new BadRequestException('Teacher role not found');
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

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

    await this.audit.log(actor, 'create', 'User', user.id, {
      after: {
        id: user.id,
        login: user.login,
        role: 'teacher',
        departmentId: department.id,
      },
    });
    this.logger.log({
      event: 'user.created',
      userId: user.id,
      login: user.login,
      actorId: actor.id,
    });

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

  /**
   * Builds the render context (labels + data) for the condensed account
   * summary PDF. Cell/field mapping lives here (not in reports-pdf) per
   * this repo's report convention: the domain module owns the data.
   */
  async buildAccountSummary(userId: number, lang?: string) {
    const user = await this.findOne(userId);
    const labels = ACCOUNT_SUMMARY_LABELS[resolveAccountSummaryLang(lang)];

    const fullName = [user.userInfo?.firstName, user.userInfo?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      labels,
      generatedAt: new Date().toISOString().slice(0, 10),
      fullName: fullName || user.login,
      login: user.login,
      roleName:
        labels.roleNames[
          user.role.name as 'admin' | 'departmenthead' | 'teacher'
        ],
      departmentName: user.teacherInfo?.department?.name,
      bachelor: user.teacherInfo?.bachelorUniversity
        ? {
            university: user.teacherInfo.bachelorUniversity,
            year: user.teacherInfo.bachelorYear,
          }
        : null,
      master: user.teacherInfo?.masterUniversity
        ? {
            university: user.teacherInfo.masterUniversity,
            year: user.teacherInfo.masterYear,
          }
        : null,
      phd: user.teacherInfo?.hasPhdDegree
        ? {
            year: user.teacherInfo.phdYear,
            speciality: user.teacherInfo.phdSpeciality,
          }
        : null,
      academicTitle: user.teacherInfo?.hasAcademicTitle
        ? {
            name: user.teacherInfo.academicTitleName,
            year: user.teacherInfo.academicTitleYear,
          }
        : null,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto, actor: AuditActor) {
    const existingUser = await this.findOne(id);

    if (updateUserDto.login && updateUserDto.login !== existingUser.login) {
      const loginExists = await this.prisma.user.findUnique({
        where: { login: updateUserDto.login },
      });

      if (loginExists) {
        throw new ConflictException('User with this login already exists');
      }
    }

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

    const sensitiveChange =
      updateUserDto.roleId !== undefined || updateUserDto.login !== undefined;
    if (sensitiveChange) {
      await this.audit.log(actor, 'update', 'User', id, {
        before: { id, login: existingUser.login, roleId: existingUser.roleId },
        after: { id, login: user.login, roleId: user.roleId },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateTeacherInfo(
    teacherId: number,
    updateTeacherInfoDto: UpdateTeacherInfoDto,
    departmentHeadId: number,
  ) {
    const department = await this.prisma.department.findFirst({
      where: { headId: departmentHeadId },
    });

    if (!department) {
      throw new ForbiddenException('You are not a department head');
    }

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

    const updatedTeacherInfo = await this.prisma.teacherInfo.update({
      where: { userId: teacherId },
      data: {
        employmentType: updateTeacherInfoDto.employmentType,
        mandatoryHoursPerPeriod: updateTeacherInfoDto.mandatoryHoursPerPeriod,
        mandatoryExtracurricularHours:
          updateTeacherInfoDto.mandatoryExtracurricularHours,
        mandatoryConferenceArticles:
          updateTeacherInfoDto.mandatoryConferenceArticles,
        mandatoryNationalArticles:
          updateTeacherInfoDto.mandatoryNationalArticles,
        mandatoryScopusArticles: updateTeacherInfoDto.mandatoryScopusArticles,
        mandatoryDocumentation: updateTeacherInfoDto.mandatoryDocumentation,
      },
    });

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

  async updateUserAccount(
    userId: number,
    updateAccountDto: UpdateUserAccountDto,
  ) {
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

    const userInfoData: any = {};
    const teacherInfoData: any = {};

    const userInfoFields = [
      'firstName',
      'lastName',
      'middleName',
      'dateOfBirth',
      'gender',
      'nationality',
      'countryOfBirth',
      'regionOfBirth',
      'currentAddress',
      'permanentAddress',
      'passportSerial',
      'personalId',
      'stirInn',
      'englishLevel',
      'profileImage',
      'locale',
      'email1',
      'email2',
      'phone1',
      'phone2',
    ];

    const teacherInfoFields = [
      'bachelorUniversity',
      'bachelorYear',
      'bachelorDirection',
      'bachelorDiplomaNumber',
      'masterUniversity',
      'masterYear',
      'masterDirection',
      'masterDiplomaNumber',
      'researchArea',
      'hasPhdDegree',
      'phdYear',
      'phdSpeciality',
      'phdTopic',
      'phdDiplomaNumber',
      'phdCountry',
      'phdOrganization',
      'hasDscDegree',
      'dscYear',
      'dscSpeciality',
      'dscTopic',
      'dscDiplomaNumber',
      'dscCountry',
      'dscOrganization',
      'hasAcademicTitle',
      'academicTitleName',
      'academicTitleSpeciality',
      'academicTitleYear',
      'academicTitleAttestat',
      'internshipsCount',
      'internshipsInfo',
      'trainingCount',
      'trainingInfo',
      'awardsField',
      'awardsState',
      'supervisedPhd',
      'supervisedDsc',
      'conferencesRepublic',
      'conferencesInternational',
      'seminarsRepublic',
      'seminarsInternational',
      'projectsFundamental',
      'projectsPractical',
      'projectsYouth',
      'projectsBusiness',
      'projectsInnovation',
      'innovativeIdeasCount',
    ];

    userInfoFields.forEach((field) => {
      if (updateAccountDto[field] !== undefined) {
        userInfoData[field] = updateAccountDto[field];
      }
    });

    if (user.role.name === 'teacher') {
      teacherInfoFields.forEach((field) => {
        if (updateAccountDto[field] !== undefined) {
          teacherInfoData[field] = updateAccountDto[field];
        }
      });
    }

    if (Object.keys(userInfoData).length > 0) {
      await this.prisma.userInfo.update({
        where: { userId },
        data: userInfoData,
      });
    }

    if (
      user.role.name === 'teacher' &&
      Object.keys(teacherInfoData).length > 0
    ) {
      if (user.teacherInfo) {
        await this.prisma.teacherInfo.update({
          where: { userId },
          data: teacherInfoData,
        });
      }
    }

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

  async toggleStatus(id: number, actor: AuditActor) {
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

    const action = updatedUser.isActive ? 'activate' : 'deactivate';
    await this.audit.log(actor, action, 'User', id, {
      before: { id, isActive: user.isActive },
      after: { id, isActive: updatedUser.isActive },
    });
    this.logger.log({
      event: `user.${action}d`,
      userId: id,
      actorId: actor.id,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: number, actor: AuditActor) {
    const userToDelete = await this.findOne(id);

    const currentUser = await this.prisma.user.findUnique({
      where: { id: actor.id },
      include: {
        role: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    if (currentUser.role.name === 'departmenthead') {
      const department = await this.prisma.department.findFirst({
        where: { headId: actor.id },
      });

      if (!department) {
        throw new ForbiddenException('You are not a department head');
      }

      if (userToDelete.role.name !== 'teacher') {
        throw new ForbiddenException(
          'Department heads can only delete teachers',
        );
      }

      if (userToDelete.teacherInfo?.departmentId !== department.id) {
        throw new ForbiddenException(
          'You can only delete teachers from your department',
        );
      }
    }

    const before = {
      id,
      login: userToDelete.login,
      role: userToDelete.role.name,
    };

    await this.prisma.teachingActivity.deleteMany({
      where: { teacherId: id },
    });

    await this.prisma.courseTeacher.deleteMany({
      where: { teacherId: id },
    });

    await this.prisma.teacherScientificReport.deleteMany({
      where: { teacherId: id },
    });

    await this.prisma.teacherInfo.deleteMany({
      where: { userId: id },
    });

    await this.prisma.userInfo.deleteMany({
      where: { userId: id },
    });

    await this.prisma.user.delete({
      where: { id },
    });

    await this.audit.log(actor, 'delete', 'User', id, { before });
    this.logger.log({
      event: 'user.deleted',
      userId: id,
      login: before.login,
      actorId: actor.id,
    });

    return { message: 'User deleted successfully' };
  }
}
