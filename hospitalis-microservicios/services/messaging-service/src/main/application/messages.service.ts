import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from '../domain/message.schema';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async createMessage(senderId: string, receiverId: string, content: string) {
    if (!content || content.trim().length === 0) throw new BadRequestException('El mensaje no puede estar vacio');
    if (senderId === receiverId) throw new BadRequestException('No puedes enviarte un mensaje a ti mismo');
    return new this.messageModel({
      sender: new Types.ObjectId(senderId), receiver: new Types.ObjectId(receiverId), content,
    }).save();
  }

  async getInbox(userId: string) {
    const objId = new Types.ObjectId(userId);
    const messages = await this.messageModel.find({ $or: [{ sender: objId }, { receiver: objId }] })
      .sort({ createdAt: -1 }).populate('sender', 'fullname email').populate('receiver', 'fullname email').lean();
    const map = new Map<string, any>();
    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;
      const other = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      const otherId = other._id.toString();
      if (!map.has(otherId)) {
        map.set(otherId, {
          otherUser: other,
          lastMessage: { _id: msg._id, content: msg.content, createdAt: msg.createdAt, isRead: msg.isRead, senderId: msg.sender._id.toString() },
          unreadCount: 0,
        });
      }
      if (msg.receiver._id.toString() === userId && !msg.isRead) map.get(otherId).unreadCount += 1;
    }
    return Array.from(map.values());
  }

  async getConversation(userId: string, otherUserId: string) {
    const u = new Types.ObjectId(userId), o = new Types.ObjectId(otherUserId);
    await this.messageModel.updateMany({ sender: o, receiver: u, isRead: false }, { $set: { isRead: true } });
    const conv = await this.messageModel.find({ $or: [{ sender: u, receiver: o }, { sender: o, receiver: u }] })
      .sort({ createdAt: 1 }).populate('sender', 'fullname email _id').populate('receiver', 'fullname email _id').lean();
    return conv.filter((m: any) => m.sender && m.receiver);
  }

  async markAsRead(messageId: string, userId: string) {
    const m = await this.messageModel.findOneAndUpdate(
      { _id: new Types.ObjectId(messageId), receiver: new Types.ObjectId(userId) },
      { $set: { isRead: true } }, { new: true });
    if (!m) throw new NotFoundException('Mensaje no encontrado');
    return m;
  }

  async getUnreadCount(userId: string) {
    const count = await this.messageModel.countDocuments({ receiver: new Types.ObjectId(userId), isRead: false });
    return { count };
  }
}
