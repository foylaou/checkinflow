import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
// 解決循環依賴問題 - 使用類型導入而不是值導入
import  { User } from "./User";
import  { Event } from "./Event";

@Entity("checkins")
export class Checkin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  user_id!: number;

  @Column({ type: "int", nullable: false })
  event_id!: number;

  @Column({ type: "datetime", nullable: false })
  checkin_time!: Date;

  @Column({ type: "datetime", nullable: true })
  checkout_time!: Date;

  @Column({ length: 255, type: "varchar", nullable: true })
  geolocation!: string;

  @Column({ type: "bit", default: true })
  is_valid!: boolean;

  @Column({ length: 50, type: "varchar", default: "出席" })
  status!: string;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  // 關聯，使用字符串引用避免循環依賴
  @ManyToOne(() => User, (user) => user.checkins)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Event, (event) => event.checkins)
  @JoinColumn({ name: "event_id" })
  event!: Event;
}
