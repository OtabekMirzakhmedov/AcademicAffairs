import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { AddCourseToProgramDto } from './dto/add-course-to-program.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  async create(createProgramDto: CreateProgramDto, createdBy: number) {
    // Check if code already exists
    const existing = await this.prisma.program.findUnique({
      where: { code: createProgramDto.code },
    });

    if (existing) {
      throw new ConflictException('Program with this code already exists');
    }

    const program = await this.prisma.program.create({
      data: {
        name: createProgramDto.name,
        code: createProgramDto.code,
        degreeLevel: createProgramDto.degreeLevel,
        departmentId: createProgramDto.departmentId,
        durationYears: createProgramDto.durationYears,
        totalCreditsRequired: new Decimal(createProgramDto.totalCreditsRequired),
        description: createProgramDto.description,
        isActive: createProgramDto.isActive !== undefined ? createProgramDto.isActive : true,
        createdBy,
      },
      include: {
        department: true,
        creator: {
          include: {
            userInfo: true,
          },
        },
        programCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    return program;
  }

  async findAll() {
    return this.prisma.program.findMany({
      include: {
        department: true,
        creator: {
          include: {
            userInfo: true,
          },
        },
        _count: {
          select: {
            programCourses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        department: true,
        creator: {
          include: {
            userInfo: true,
          },
        },
        programCourses: {
          include: {
            course: true,
          },
          orderBy: {
            recommendedSemester: 'asc',
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async update(id: number, updateProgramDto: UpdateProgramDto, userId: number) {
    const program = await this.findOne(id);

    // Check permissions: only creator, admin, or dept head can update
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.role.name === 'admin';
    const isCreator = program.createdBy === userId;
    const isDeptHead = user.role.name === 'departmenthead';

    if (!isAdmin && !isCreator && !isDeptHead) {
      throw new ForbiddenException('You do not have permission to update this program');
    }

    // Check code uniqueness if being updated
    if (updateProgramDto.code && updateProgramDto.code !== program.code) {
      const existing = await this.prisma.program.findUnique({
        where: { code: updateProgramDto.code },
      });

      if (existing) {
        throw new ConflictException('Program with this code already exists');
      }
    }

    const updateData: any = { ...updateProgramDto };
    if (updateProgramDto.totalCreditsRequired !== undefined) {
      updateData.totalCreditsRequired = new Decimal(updateProgramDto.totalCreditsRequired);
    }

    return this.prisma.program.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        creator: {
          include: {
            userInfo: true,
          },
        },
        programCourses: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const program = await this.findOne(id);

    // Check permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.role.name === 'admin';
    const isCreator = program.createdBy === userId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('You do not have permission to delete this program');
    }

    await this.prisma.program.delete({
      where: { id },
    });

    return { message: 'Program deleted successfully' };
  }

  async addCourse(programId: number, addCourseDto: AddCourseToProgramDto) {
    // Check if program exists
    await this.findOne(programId);

    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: addCourseDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already added
    const existing = await this.prisma.programCourse.findFirst({
      where: {
        programId,
        courseId: addCourseDto.courseId,
      },
    });

    if (existing) {
      throw new ConflictException('Course already added to this program');
    }

    return this.prisma.programCourse.create({
      data: {
        programId,
        courseId: addCourseDto.courseId,
        isRequired: addCourseDto.isRequired !== undefined ? addCourseDto.isRequired : true,
        recommendedSemester: addCourseDto.recommendedSemester,
      },
      include: {
        course: true,
      },
    });
  }

  async removeCourse(programId: number, courseId: number) {
    const programCourse = await this.prisma.programCourse.findFirst({
      where: {
        programId,
        courseId,
      },
    });

    if (!programCourse) {
      throw new NotFoundException('Course not found in this program');
    }

    await this.prisma.programCourse.delete({
      where: { id: programCourse.id },
    });

    return { message: 'Course removed from program successfully' };
  }

  async updateProgramCourse(
    programId: number,
    courseId: number,
    updateData: { isRequired?: boolean; recommendedSemester?: number },
  ) {
    const programCourse = await this.prisma.programCourse.findFirst({
      where: {
        programId,
        courseId,
      },
    });

    if (!programCourse) {
      throw new NotFoundException('Course not found in this program');
    }

    return this.prisma.programCourse.update({
      where: { id: programCourse.id },
      data: updateData,
      include: {
        course: true,
      },
    });
  }
}
