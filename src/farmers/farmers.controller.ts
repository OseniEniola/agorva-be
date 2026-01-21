// farmers.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { FarmerQueryDto } from './dto/farmer-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { FarmersService } from './farmers.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateFarmerProfileDto } from './dto/create-farmer-profile.dto';
import { AddPickupLocationDto } from './dto/add-pickup-location.dto';
import { AddCertificationDto } from './dto/add-certification.dto';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';

@ApiTags('farmers')
@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  // Public endpoints

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all farmers with filters' })
  @ApiResponse({ status: 200, description: 'Returns list of farmers' })
  async findAll(@Query() query: FarmerQueryDto) {
    return this.farmersService.findAll(query);
  }

  @Public()
  @Get('nearby')
  @ApiOperation({ summary: 'Find farmers near a location' })
  @ApiQuery({ name: 'latitude', example: 49.2827 })
  @ApiQuery({ name: 'longitude', example: -123.1207 })
  @ApiQuery({ name: 'radius', example: 50, required: false })
  @ApiResponse({ status: 200, description: 'Returns nearby farmers' })
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
  ) {
    return this.farmersService.findNearby(latitude, longitude, radius);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get farmer by ID' })
  @ApiParam({ name: 'id', description: 'Farmer UUID' })
  @ApiResponse({ status: 200, description: 'Returns farmer details' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  async findOne(@Param('id') id: string) {
    return this.farmersService.findOne(id);
  }

  @Public()
  @Get(':id/delivery-check')
  @ApiOperation({ summary: 'Check if farmer can deliver to location' })
  @ApiParam({ name: 'id', description: 'Farmer UUID' })
  @ApiQuery({ name: 'latitude', example: 49.2827 })
  @ApiQuery({ name: 'longitude', example: -123.1207 })
  @ApiResponse({ status: 200, description: 'Returns delivery availability' })
  async checkDelivery(
    @Param('id') id: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return this.farmersService.canDeliverTo(id, latitude, longitude);
  }

  // Farmer-only endpoints

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @Post('profile')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create farmer profile (Farmers only)' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  async createProfile(
    @CurrentUser() user: any,
    @Body() createFarmerProfileDto: CreateFarmerProfileDto,
  ) {
    return this.farmersService.createProfile(user.userId, createFarmerProfileDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @Get('profile/me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my farmer profile' })
  @ApiResponse({ status: 200, description: 'Returns farmer profile' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.farmersService.findByUserId(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @Put('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update farmer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateFarmerProfileDto: CreateFarmerProfileDto,
  ) {
    return this.farmersService.updateProfile(user.userId, updateFarmerProfileDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @Post('pickup-locations')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add pickup location' })
  @ApiResponse({ status: 201, description: 'Pickup location added' })
  async addPickupLocation(
    @CurrentUser() user: any,
    @Body() pickupLocationDto: AddPickupLocationDto,
  ) {
    return this.farmersService.addPickupLocation(user.userId, pickupLocationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @Delete('pickup-locations/:index')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove pickup location' })
  @ApiParam({ name: 'index', description: 'Pickup location index' })
  @ApiResponse({ status: 200, description: 'Pickup location removed' })
  async removePickupLocation(
    @CurrentUser() user: any,
    @Param('index') index: number,
  ) {
    return this.farmersService.removePickupLocation(user.userId, index);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @Put('bank-details')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update bank details' })
  @ApiResponse({ status: 200, description: 'Bank details updated' })
  async updateBankDetails(
    @CurrentUser() user: any,
    @Body() bankDetailsDto: UpdateBankDetailsDto,
  ) {
    return this.farmersService.updateBankDetails(user.userId, bankDetailsDto);
  }

  // Admin-only endpoints

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/verify')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify farmer (Admin only)' })
  @ApiParam({ name: 'id', description: 'Farmer UUID' })
  @ApiResponse({ status: 200, description: 'Farmer verified' })
  async verifyFarmer(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.farmersService.verifyFarmer(id, notes);
  }

  // farmers.controller.ts - Add this endpoint
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FARMER)
@Post('certifications')
@ApiBearerAuth('JWT-auth')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Add certification document' })
@ApiResponse({ status: 201, description: 'Certification added successfully' })
async addCertification(
  @CurrentUser() user: any,
  @Body() certificationDto: AddCertificationDto,
) {
  return this.farmersService.addCertification(user.userId, certificationDto);
}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/reject')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject farmer (Admin only)' })
  @ApiParam({ name: 'id', description: 'Farmer UUID' })
  @ApiResponse({ status: 200, description: 'Farmer rejected' })
  async rejectFarmer(
    @Param('id') id: string,
    @Body('notes') notes: string,
  ) {
    return this.farmersService.rejectFarmer(id, notes);
  }
}