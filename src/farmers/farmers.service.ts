// farmers.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFarmerProfileDto } from './dto/create-farmer-profile.dto';
import { AddPickupLocationDto } from './dto/add-pickup-location.dto';
import { FarmerQueryDto } from './dto/farmer-query.dto';
import { AddCertificationDto } from './dto/add-certification.dto';
import { Farmer } from './entities/farmer.entities';
import { FarmerStatus } from 'src/common/enums/business-enum';
import { UpdateFarmerProfileDto } from './dto/update-farmer-profile.dto';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';

@Injectable()
export class FarmersService {
  constructor(
    @InjectRepository(Farmer)
    private farmerRepository: Repository<Farmer>,
  ) {}

  // Create farmer profile
  async createProfile(
    userId: string,
    createFarmerProfileDto: CreateFarmerProfileDto,
  ) {
    // Check if farmer profile already exists
    const existingFarmer = await this.farmerRepository.findOne({
      where: { userId },
    });

    if (existingFarmer) {
      throw new ConflictException('Farmer profile already exists');
    }

    const farmer = this.farmerRepository.create({
      userId,
      ...createFarmerProfileDto,
    });

    return this.farmerRepository.save(farmer);
  }

  // Get all farmers with filters and pagination
// farmers.service.ts - Updated findAll method
async findAll(query: FarmerQueryDto) {
  const {
    search,
    city,
    province,
    status,
    farmingMethods,
    certifications,
    deliveryDays,
    latitude,
    longitude,
    radiusKm,
    page = 1,
    limit = 10,
  } = query;

  const queryBuilder = this.farmerRepository
    .createQueryBuilder('farmer')
    .leftJoinAndSelect('farmer.user', 'user')
    .where('farmer.status = :verifiedStatus', {
      verifiedStatus: FarmerStatus.VERIFIED,
    });

  // Search by farm name or description
  if (search) {
    queryBuilder.andWhere(
      '(farmer.farmName ILIKE :search OR farmer.description ILIKE :search)',
      { search: `%${search}%` },
    );
  }

  // Filter by city
  if (city) {
    queryBuilder.andWhere('farmer.city ILIKE :city', { city: `%${city}%` });
  }

  // Filter by province
  if (province) {
    queryBuilder.andWhere('farmer.province ILIKE :province', {
      province: `%${province}%`,
    });
  }

  // Filter by status
  if (status) {
    queryBuilder.andWhere('farmer.status = :status', { status });
  }

  // Filter by farming methods
  if (farmingMethods && farmingMethods.length > 0) {
    queryBuilder.andWhere('farmer.farmingMethods && :farmingMethods', {
      farmingMethods,
    });
  }

  // Filter by certifications
  if (certifications && certifications.length > 0) {
    queryBuilder.andWhere('farmer.certifications && :certifications', {
      certifications,
    });
  }

  // Filter by delivery days
  if (deliveryDays && deliveryDays.length > 0) {
    queryBuilder.andWhere('farmer.deliveryDays && :deliveryDays', {
      deliveryDays,
    });
  }

  // Location-based search
  if (latitude && longitude && radiusKm) {
    const farmers = await queryBuilder.getMany();

    const farmersWithDistance = farmers
      .map((farmer) => ({
        ...farmer,
        distance: this.calculateDistance(
          latitude,
          longitude,
          farmer.latitude,
          farmer.longitude,
        ),
      }))
      .filter((f) => f.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    const total = farmersWithDistance.length;
    const skip = (page - 1) * limit;
    const paginatedFarmers = farmersWithDistance.slice(skip, skip + limit);

    return {
      farmers: paginatedFarmers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Regular pagination
  const skip = (page - 1) * limit;
  const [farmers, total] = await queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy('farmer.averageRating', 'DESC')
    .getManyAndCount();

  return {
    farmers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

  // Get single farmer by ID
  async findOne(id: string) {
    const farmer = await this.farmerRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });

    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    return farmer;
  }

  // Get farmer by user ID
  async findByUserId(userId: string) {
    const farmer = await this.farmerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!farmer) {
      throw new NotFoundException('Farmer profile not found');
    }

    return farmer;
  }

  // Update farmer profile
  async updateProfile(
    userId: string,
    updateFarmerProfileDto: UpdateFarmerProfileDto,
  ) {
    const farmer = await this.findByUserId(userId);

    Object.assign(farmer, updateFarmerProfileDto);

    return this.farmerRepository.save(farmer);
  }

  // Add pickup location
  async addPickupLocation(userId: string, pickupLocationDto: AddPickupLocationDto) {
    const farmer = await this.findByUserId(userId);

    if (!farmer.pickupLocations) {
      farmer.pickupLocations = [];
    }

    farmer.pickupLocations.push(pickupLocationDto);

    return this.farmerRepository.save(farmer);
  }

  // Remove pickup location
  async removePickupLocation(userId: string, locationIndex: number) {
    const farmer = await this.findByUserId(userId);

    if (!farmer.pickupLocations || locationIndex >= farmer.pickupLocations.length) {
      throw new NotFoundException('Pickup location not found');
    }

    farmer.pickupLocations.splice(locationIndex, 1);

    return this.farmerRepository.save(farmer);
  }

  // Update bank details
  async updateBankDetails(userId: string, bankDetailsDto: UpdateBankDetailsDto) {
    const farmer = await this.findByUserId(userId);

    farmer.bankAccountNumber = bankDetailsDto.bankAccountNumber;
    farmer.bankRoutingNumber = bankDetailsDto.bankRoutingNumber;
    farmer.bankAccountHolderName = bankDetailsDto.bankAccountHolderName;

    return this.farmerRepository.save(farmer);
  }

  // Upload profile image
  async uploadProfileImage(userId: string, imageUrl: string) {
    const farmer = await this.findByUserId(userId);
    farmer.profileImage = imageUrl;
    return this.farmerRepository.save(farmer);
  }

  // Upload farm images
  async uploadFarmImages(userId: string, imageUrls: string[]) {
    const farmer = await this.findByUserId(userId);

    if (!farmer.farmImages) {
      farmer.farmImages = [];
    }

    farmer.farmImages.push(...imageUrls);

    return this.farmerRepository.save(farmer);
  }

  // Get farmers near location
  async findNearby(latitude: number, longitude: number, radiusKm: number = 50) {
    const farmers = await this.farmerRepository.find({
      where: { status: FarmerStatus.VERIFIED },
      relations: ['user'],
    });

    const farmersWithDistance = farmers
      .map((farmer) => ({
        ...farmer,
        distance: this.calculateDistance(
          latitude,
          longitude,
          farmer.latitude,
          farmer.longitude,
        ),
      }))
      .filter((f) => f.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return farmersWithDistance;
  }

  // Check if farmer can deliver to location
  async canDeliverTo(farmerId: string, latitude: number, longitude: number) {
    const farmer = await this.findOne(farmerId);

    const distance = this.calculateDistance(
      farmer.latitude,
      farmer.longitude,
      latitude,
      longitude,
    );

    return {
      canDeliver: distance <= farmer.deliveryRadiusKm,
      distance,
      deliveryRadius: farmer.deliveryRadiusKm,
    };
  }

  // Admin: Verify farmer
  async verifyFarmer(farmerId: string, notes?: string) {
    const farmer = await this.findOne(farmerId);

    farmer.status = FarmerStatus.VERIFIED;
    farmer.isVerified = true;
    farmer.verifiedAt = new Date();
    farmer.verificationNotes = notes || "";

    return this.farmerRepository.save(farmer);
  }

  // Admin: Reject farmer
  async rejectFarmer(farmerId: string, notes?: string) {
    const farmer = await this.findOne(farmerId);

    farmer.status = FarmerStatus.REJECTED;
    farmer.verificationNotes = notes || '';

    return this.farmerRepository.save(farmer);
  }

  // Admin: Suspend farmer
  async suspendFarmer(farmerId: string, notes?: string) {
    const farmer = await this.findOne(farmerId);

    farmer.status = FarmerStatus.SUSPENDED;
    farmer.verificationNotes = notes || '';

    return this.farmerRepository.save(farmer);
  }


// Add method to add certification documents
async addCertification(userId: string, certificationDto: AddCertificationDto) {
  const farmer = await this.findByUserId(userId);

  if (!farmer.certificationDocuments) {
    farmer.certificationDocuments = [];
  }

  farmer.certificationDocuments.push({
    certificationType: certificationDto.certificationType,
    documentName: certificationDto.documentName,
    documentUrl: certificationDto.documentUrl,
    issueDate: new Date(certificationDto.issueDate),
    expiryDate: certificationDto.expiryDate ? new Date(certificationDto.expiryDate) : undefined,
    uploadedAt: new Date(),
  });

  // Add to certifications array if not already there
  if (!farmer.certifications) {
    farmer.certifications = [];
  }
  if (!farmer.certifications.includes(certificationDto.certificationType)) {
    farmer.certifications.push(certificationDto.certificationType);
  }

  return this.farmerRepository.save(farmer);
}

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}