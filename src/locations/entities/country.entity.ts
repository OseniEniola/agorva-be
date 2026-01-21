import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Region } from './region.entity';
import { Subregion } from './subregion.entity';
import { State } from './state.entity';
import { City } from './city.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 3, nullable: true })
  iso3?: string;

  @Column({ length: 3, nullable: true })
  numeric_code?: string;

  @Column({ length: 2, nullable: true })
  iso2?: string;

  @Column({ nullable: true })
  phonecode?: string;

  @Column({ nullable: true })
  capital?: string;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  currency_name?: string;

  @Column({ nullable: true })
  currency_symbol?: string;

  @Column({ nullable: true })
  tld?: string;

  @Column({ nullable: true })
  native?: string;

  @Column({ type: 'bigint', nullable: true })
  population?: number;

  @Column({ type: 'bigint', nullable: true })
  gdp?: number;

  @Column({ nullable: true })
  region?: string;

  @ManyToOne(() => Region, (region) => region.countries)
  @JoinColumn({ name: 'region_id' })
  regionRef?: Region;

  @Column({ nullable: true })
  region_id?: number;

  @ManyToOne(() => Subregion)
  @JoinColumn({ name: 'subregion_id' })
  subregionRef?: Subregion;

  @Column({ nullable: true })
  subregion_id?: number;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ type: 'double precision', nullable: true })
  area_sq_km?: number;

  @Column({ type: 'text', nullable: true })
  timezones?: string;

  @Column({ type: 'text', nullable: true })
  translations?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  emoji?: string;

  @Column({ nullable: true })
  emojiU?: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ default: true })
  flag: boolean;

  @Column({ nullable: true })
  wikiDataId?: string;

  @OneToMany(() => State, (state) => state.country)
  states: State[];

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
