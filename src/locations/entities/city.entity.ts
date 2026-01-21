import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { State } from './state.entity';
import { Country } from './country.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => State, (state) => state.cities)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column()
  state_id: number;

  @Column()
  state_code: string;

  @ManyToOne(() => Country, (country) => country.cities)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  country_id: number;

  @Column({ length: 2 })
  country_code: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  level?: number;

  @Column({ nullable: true })
  parent_id?: number;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ nullable: true })
  native?: string;

  @Column({ type: 'bigint', nullable: true })
  population?: number;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ type: 'text', nullable: true })
  translations?: string;

  @Column({ type: 'timestamp', default: () => `'2014-01-01 12:01:01'` })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ default: true })
  flag: boolean;

  @Column({ nullable: true })
  wikiDataId?: string;
}
