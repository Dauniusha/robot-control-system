import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRobotRequestDto {
  @IsNotEmpty()
  @IsUUID()
  robotId!: string;
}
