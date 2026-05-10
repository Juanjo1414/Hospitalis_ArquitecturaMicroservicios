import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from '../application/messages.service';
import { JwtAuthGuard } from '../domain/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}
  @Post() create(@Req() req: any, @Body() body: { receiverId: string; content: string }) { return this.svc.createMessage(req.user.userId, body.receiverId, body.content); }
  @Get('inbox') getInbox(@Req() req: any) { return this.svc.getInbox(req.user.userId); }
  @Get('conversation/:userId') getConversation(@Req() req: any, @Param('userId') userId: string) { return this.svc.getConversation(req.user.userId, userId); }
  @Patch(':id/read') markAsRead(@Param('id') id: string, @Req() req: any) { return this.svc.markAsRead(id, req.user.userId); }
  @Get('unread-count') getUnreadCount(@Req() req: any) { return this.svc.getUnreadCount(req.user.userId); }
}
