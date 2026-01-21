import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Country, (country) => country.states)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  country_id: number;

  @Column({ length: 2 })
  country_code: string;

  @Column({ nullable: true })
  fips_code?: string;

  @Column({ nullable: true })
  iso2?: string;

  @Column({ nullable: true })
  iso3166_2?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  level?: number;

  @Column({ nullable: true })
  parent_id?: number;

  @Column({ nullable: true })
  native?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ type: 'text', nullable: true })
  translations?: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ default: true })
  flag: boolean;

  @Column({ nullable: true })
  wikiDataId?: string;

  @Column({ nullable: true })
  population?: string;

  @OneToMany(() => City, (city) => city.state)
  cities: City[];
}
