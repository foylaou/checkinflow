import { getDataSource } from "./data-source";
import { Repository } from "typeorm";
import { Event } from "./entities/Event";
import { User } from "./entities/User";
import { Admin } from "./entities/Admin";
import { Checkin } from "./entities/Checkin";

// 取得活動倉庫
export const getEventRepository = async (): Promise<Repository<Event>> => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Event);
};

// 取得使用者倉庫
export const getUserRepository = async (): Promise<Repository<User>> => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(User);
};

// 取得管理員倉庫
export const getAdminRepository = async (): Promise<Repository<Admin>> => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Admin);
};

// 取得簽到記錄倉庫
export const getCheckinRepository = async (): Promise<Repository<Checkin>> => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(Checkin);
};
