import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Region } from './region.entity';

@Entity('subregions')
export class Subregion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  translations?: string;

  @ManyToOne(() => Region, (region) => region.subregions)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column()
  region_id: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ default: true })
  flag: boolean;

  @Column({ nullable: true })
  wikiDataId?: string;
}
