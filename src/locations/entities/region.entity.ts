import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Subregion } from './subregion.entity';
import { Country } from './country.entity';


@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

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

  @OneToMany(() => Subregion, (sub) => sub.region)
  subregions: Subregion[];

  @OneToMany(() => Country, (country) => country.region)
  countries: Country[];
}
