import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRobotDto {
  @IsNotEmpty()
  @MaxLength(20)
  model!: string;

  @IsNotEmpty()
  @MaxLength(30)
  serialNumber!: string;
}
