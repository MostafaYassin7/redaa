import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Find a user by any criteria
   */
  async findOne(where: FindOptionsWhere<User> | FindOptionsWhere<User>[]): Promise<User | null> {
    return this.userRepo.findOne({ where });
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  /**
   * Find a user by phone number
   */
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { phoneNumber } });
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  /**
   * Find a user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }

  /**
   * Create a new user
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  /**
   * Update a user
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepo.update(id, userData);
    return this.findById(id);
  }

  /**
   * Save a user (create or update)
   */
  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
