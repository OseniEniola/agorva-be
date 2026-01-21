import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  minLength,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'farmer@agorva.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password (minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, and number/special character',
  })
  password: string;

   @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.FARMER,
    description: 'Type of user account',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    required: false,
  })
  @IsString()
  phoneNo: string;

  @ApiProperty({
    example: '1234 Main drive, V3M 567, BC, Canada',
    description: 'Address',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: '90.234',
    description: 'Latitude',
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    example: '-90.234',
    description: 'Longitude',
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
