import { uuid } from 'uuidv4';
import { Message } from './message.model';
import { IUserSocket } from './room.gateway';

export class Room {
  private messages: Message[] = [];

  constructor(
    private readonly id: string,
    private readonly name: string,
    private participants: IUserSocket[],
    private readonly createdTime: number,
  ) {}

  addParticipant(participant: IUserSocket) {
    this.participants = [
      ...this.participants.filter((p) => p.username !== participant.username),
      participant,
    ];
  }

  removeParticipant(p: IUserSocket) {
    this.participants = this.participants.filter(
      (participant) => participant.username !== p.username,
    );
  }

  addMessage(text: string, participant: IUserSocket) {
    this.messages.push(
      new Message(uuid(), text, participant.username, Date.now()),
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getParticipants(): IUserSocket[] {
    return this.participants;
  }

  getMessages(): Message[] {
    return this.messages;
  }
}
