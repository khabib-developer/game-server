import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDto } from 'src/user/user.service';
import { RoomService } from './room.service';
import { uuid } from 'uuidv4';

export interface IUserSocket extends UserDto {
  socketId: string;

  roomId: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001'],
    credentials: true,
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private roomService: RoomService,
  ) {}

  private connectedClients: IUserSocket[] = [];

  @UseGuards(JwtAuthGuard)
  handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('token='))
        .split('=')[1];

      const user = this.jwtService.verify(token);
      const roomId = this.roomService.getGenesisRoom().getId();
      const connectedUser = { ...user, socketId: client.id, roomId };
      this.connectedClients.push(connectedUser);
      this.roomService.addParticipant(roomId, connectedUser);
      this.server.emit(
        'connected',
        this.roomService.getGenesisRoom(),
        this.roomService.getRooms(),
      );
    } catch (error) {
      console.log(error);
      this.server.emit('error', 'wrong token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected');

    const participant = this.connectedClients.find(
      (c) => c.socketId === client.id,
    );

    const room = this.roomService.getRoomById(participant.roomId);

    this.roomService.removeParticipant(room.getId(), participant);

    this.connectedClients = this.connectedClients.filter(
      (user) => user.socketId !== client.id,
    );
    this.server.emit('updatedRooms', this.roomService.getRooms());
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    const users = this.roomService
      .getRoomById(payload.roomId)
      .getParticipants();
    const participant = this.connectedClients.find(
      (c) => c.username === payload.username,
    );
    if (participant) {
      this.roomService.addMessage(payload.roomId, participant, payload.text);
      this.sendMessage(users, 'message', payload);
    }
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, payload: any) {
    const participant = this.connectedClients.find(
      (c) => c.username === payload.username,
    );
    if (participant) {
      const newRoom = this.roomService.addRoom(payload.name, participant);
      this.server.emit('createRoom', this.roomService.getRooms(), newRoom);
    }
  }

  @SubscribeMessage('switchRoom')
  switchRoom(client: Socket, payload: any) {
    const participant = this.connectedClients.find(
      (c) => c.username === payload.username,
    );
    const currentRoom = this.roomService.getRoomById(payload.currentRoomId);
    const nextRoom = this.roomService.getRoomById(payload.roomId);

    if (participant && currentRoom && nextRoom) {
      this.roomService.removeParticipant(currentRoom.getId(), participant);
      this.roomService.addParticipant(nextRoom.getId(), participant);
      console.log(
        this.connectedClients.filter((c) => c.socketId === client.id),
      );
      this.sendMessage(
        this.connectedClients.filter((c) => c.socketId === client.id),
        'switchRoom',
        nextRoom,
      );
      this.server.emit('updatedRooms', this.roomService.getRooms());
    }
  }

  sendMessage(users: IUserSocket[], event: string, payload: any) {
    users.forEach((user) => {
      this.server.to(user.socketId).emit(event, payload);
    });
  }
}
