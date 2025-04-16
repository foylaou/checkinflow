import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";

import type { Checkin } from "./Checkin";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, type: "varchar", nullable: false, unique: true })
  line_user_id!: string;

  @Column({ length: 100, type: "varchar", nullable: false })
  name!: string;

  @Column({ length: 20, type: "varchar", nullable: false })
  phone!: string;

  @Column({ length: 255, type: "varchar", nullable: false })
  company!: string;

  @Column({ length: 100, type: "varchar", nullable: false })
  department!: string;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  // 關聯，使用字符串引用避免循環依賴
  @OneToMany("Checkin", (checkin: Checkin) => checkin.user)
  checkins!: Checkin[];
}
