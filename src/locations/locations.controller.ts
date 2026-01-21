import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Locations')
@Controller('locations')
@Public()
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get('regions')
  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({ status: 200, description: 'List of regions' })
  getRegions(@Query() query: PaginationDto) {
    return this.service.getRegions(query);
  }

  @Get('regions/:id/subregions')
  @ApiOperation({ summary: 'Get subregions by region ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'List of subregions' })
  getSubregions(
    @Param('id') regionId: number,
    @Query() query: PaginationDto,
  ) {
    return this.service.getSubregions(regionId, query);
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'List of countries' })
  getCountries(@Query() query: PaginationDto) {
    return this.service.getCountries(query);
  }

  @Get('countries/:id/states')
  @ApiOperation({ summary: 'Get states by country ID' })
  @ApiParam({ name: 'id', example: 233 })
  @ApiResponse({ status: 200, description: 'List of states' })
  getStates(
    @Param('id') countryId: number,
    @Query() query: PaginationDto,
  ) {
    return this.service.getStates(countryId, query);
  }

  @Get('states/:id/cities')
  @ApiOperation({ summary: 'Get cities by state ID' })
  @ApiParam({ name: 'id', example: 145 })
  @ApiResponse({ status: 200, description: 'List of cities' })
  getCities(
    @Param('id') stateId: number,
    @Query() query: PaginationDto,
  ) {
    return this.service.getCities(stateId, query);
  }

  @Get('cities/:id')
  @ApiOperation({ summary: 'Get city by ID' })
  @ApiParam({ name: 'id', example: 1024 })
  @ApiResponse({ status: 200, description: 'City details' })
  @ApiResponse({ status: 404, description: 'City not found' })
  getCity(@Param('id') id: number) {
    return this.service.getCityById(id);
  }
}
