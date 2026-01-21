import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  };

  async findByEmail(email: string): Promise<User | null>{
    return await this.userRepository.findOne({
        where: {email: email.toLowerCase()}
    });
  }

  async findById(id: string): Promise<User | null>{
    return await this.userRepository.findOne({
        where: {id}
    })
  }

  async update(id: string, userData:Partial<User>): Promise<User>{
    const user = await this.findById(id);

    if(!user){
      throw new NotFoundException("User not found");
    }

    Object.assign(user,userData)

    return await this.userRepository.save(user)
  }

  async updateLastLogin(id: string): Promise<UpdateResult>{
   return await this.userRepository.update(id,{lastLoginAt: new Date()})
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async delete(id: string): Promise<DeleteResult> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return result
  }
}
