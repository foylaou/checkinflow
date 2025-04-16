import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne
} from "typeorm";
import { Generated } from "typeorm";
import type { Checkin } from "./Checkin";
import type { Admin } from "./Admin";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id!: string;  // 注意這裡改為 string 類型

  @Column({ length: 255, type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "datetime", nullable: false })
  start_time!: Date;

  @Column({ type: "datetime", nullable: false })
  end_time!: Date;

  @Column({ length: 255, type: "varchar", nullable: true })
  location!: string;

  @Column({ type: "int", nullable: true })
  max_participants?: number;

  @Column({ length: 50, type: "varchar", default: "會議" })
  event_type!: string;

  @Column({ type: "bit", default: false })
  location_validation!: boolean;

  @Column({ type: "bit", default: false })
  require_checkout!: boolean;

  @Column({ length: 255, type: "varchar", nullable: true })
  qrcode_url!: string;

  @Column({ type: "int", nullable: false })
  created_by!: number;

  @CreateDateColumn({ type: "datetime" })
  created_at!: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;

  // 關聯，使用懶加載避免循環依賴
  @OneToMany("Checkin", (checkin: Checkin) => checkin.event)
  checkins!: Checkin[];

  @ManyToOne("Admin", (admin: Admin) => admin.events)
  admin!: Admin;
}
