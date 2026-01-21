import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { Subregion } from './entities/subregion.entity';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { PaginationDto } from 'src/common/dto/pagination-dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Region)
    private regionRepo: Repository<Region>,
    @InjectRepository(Subregion)
    private subregionRepo: Repository<Subregion>,
    @InjectRepository(Country)
    private countryRepo: Repository<Country>,
    @InjectRepository(State)
    private stateRepo: Repository<State>,
    @InjectRepository(City)
    private cityRepo: Repository<City>,
  ) {}

  private paginate<T extends ObjectLiteral>(
    repo: Repository<T>,
    query: PaginationDto,
    where?: any,
    relations?: string[],
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return repo.findAndCount({
      where,
      relations,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' } as any,
    });
  }

  getRegions(query: PaginationDto) {
    return this.paginate(this.regionRepo, query);
  }

  getSubregions(regionId: number, query: PaginationDto) {
    return this.paginate(this.subregionRepo, query, { region_id: regionId });
  }

  getCountries(query: PaginationDto) {
    return this.paginate(this.countryRepo, query, undefined, [
      'regionRef',
      'subregionRef',
    ]);
  }

  getStates(countryId: number, query: PaginationDto) {
    return this.paginate(this.stateRepo, query, { country_id: countryId });
  }

  getCities(stateId: number, query: PaginationDto) {
    return this.paginate(this.cityRepo, query, { state_id: stateId });
  }

  getCityById(id: number) {
    return this.cityRepo.findOne({
      where: { id },
      relations: ['state', 'country'],
    });
  }
}
