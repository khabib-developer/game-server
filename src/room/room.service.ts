import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Room } from './room.model';
import { uuid } from 'uuidv4';
import { IUserSocket } from './room.gateway';

export const GENESIS__ROOM = 'Lobby';

@Injectable()
export class RoomService {
  private rooms: Room[] = [];

  constructor() {
    this.rooms.push(new Room(uuid(), GENESIS__ROOM, [], Date.now()));
  }

  addRoom(name: string, participant: IUserSocket) {
    const candidate = this.rooms.find((room) => room.getName() === name);
    if (candidate)
      throw new HttpException(
        'Room with this name is already exists',
        HttpStatus.BAD_REQUEST,
      );

    const newRoom = new Room(uuid(), name, [participant], Date.now());
    this.rooms.push(newRoom);
    return newRoom;
  }

  getRoomById(id: string) {
    return this.rooms.find((room) => room.getId() === id);
  }

  addParticipant(id: string, participant: IUserSocket) {
    const room = this.getRoomById(id);
    if (room) room.addParticipant(participant);
  }

  removeParticipant(id: string, participant: IUserSocket) {
    const room = this.getRoomById(id);
    if (room) {
      if (
        room.getParticipants().length === 1 &&
        room.getId() !== this.getGenesisRoom().getId()
      ) {
        this.removeRoom(room.getId());
      }
      room.removeParticipant(participant);
    }
  }

  addMessage(id: string, participant: IUserSocket, text: string) {
    const room = this.getRoomById(id);
    if (room) room.addMessage(text, participant);
  }

  removeRoom(id: string) {
    this.rooms = this.rooms.filter((room) => room.getId() !== id);
  }

  getRooms() {
    return this.rooms.map((room) => ({
      id: room.getId(),
      name: room.getName(),
      users: room.getParticipants().length,
    }));
  }

  getGenesisRoom() {
    return this.rooms.find((room) => room.getName() === GENESIS__ROOM);
  }
}
