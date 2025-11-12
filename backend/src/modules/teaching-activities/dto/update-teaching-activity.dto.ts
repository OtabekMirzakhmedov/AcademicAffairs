import { PartialType } from '@nestjs/mapped-types';
import { CreateTeachingActivityDto } from './create-teaching-activity.dto';

export class UpdateTeachingActivityDto extends PartialType(
  CreateTeachingActivityDto,
) {}
