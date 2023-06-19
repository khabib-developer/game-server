import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IUserCreationAttributes {
  username: string;
  password: string;
}

@Table
export class User extends Model<User, IUserCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: false, allowNull: false })
  username: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;
}
