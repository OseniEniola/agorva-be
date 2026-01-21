import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Subregion } from './entities/subregion.entity';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
    imports: [TypeOrmModule.forFeature([Region,Subregion,Country,State,City])],
    controllers: [LocationsController],
    providers: [LocationsService],
    exports: [LocationsService]
})
export class LocationsModule {}
