import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";
// 解決循環依賴問題 - 使用類型導入而不是值導入
import type { Event } from "./Event";

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, type: "varchar", nullable: false, unique: true })
  username!: string;

  @Column({ length: 255, type: "varchar", nullable: false })
  password!: string; // 存儲加密後的密碼

  @Column({ length: 100, type: "varchar", nullable: false })
  name!: string;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  // 關聯，使用字符串引用避免循環依賴
  @OneToMany("Event", (event: Event) => event.admin)
  events!: Event[];
}
