import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../domain/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async updatePassword(userId: string, hashedPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.password = hashedPassword;
    return user.save();
  }

  async findAll() {
    return this.userModel.find().select('-password');
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, data: Partial<User>) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    Object.assign(user, data);
    return user.save();
  }

  async remove(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.isActive = false;
    return user.save();
  }

  async hardRemove(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario eliminado permanentemente' };
  }
}
