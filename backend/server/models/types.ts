import { Document } from 'mongoose';
import { ITransaction } from './transaction.model';
import { ITask } from './List/list.model';

export interface IList extends Document {
  id: string;
  name: string;
  department: string;
  tasks: ITask[];
}

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  department: string;
  role: 'Admin' | 'User';
  isApproved: boolean;
}

export interface IDecodedUser {
  userId: string;
  userRole: string;
  userName: string;
}

export interface IReportPeriod {
  start: string;
  end: string;
}

export interface IActiveProject {
  id: string;
  name: string;
}

export interface IReportTask {
  id: string;
  name: string;
  article?: string;
  price?: string;
  quantity?: number;
  date: Date;
  unit?: string;
  comment?: string;
  deliveryDate?: string;
  orderedBy?: string;
  status?: string;
  payment?: string;
  listParent: IActiveProject;
}

export interface IDebit {
  amount: number;
  date: Date;
  check: string;
  department: string;
}

export interface IReport {
  materials: IReportTask[];
  month: IReportPeriod;
  debit: ITransaction[];
  credit: number;
  department: string;
  activeProjects: IActiveProject[];
  payment: string;
}

export interface IMongoTask extends Document {
  _id: string;
  name: string;
  article?: string;
  price?: number;
  quantity?: number;
  date: Date;
  unit?: string;
  comment?: string;
  deliveryDate?: Date;
  orderedBy?: string;
  status?: string;
  payment?: string;
}

export interface IMongoList extends Document {
  _id: string;
  name: string;
  department: string;
  tasks: IMongoTask[];
}

export interface IReportMaterial {
  id: string;
  name: string;
  article?: string;
  price: string;
  quantity: number;
  date: Date;
  unit?: string;
  comment?: string;
  deliveryDate?: string;
  orderedBy?: string;
  status?: string;
  payment?: string;
  listParent: IActiveProject;
  transaction?: string | null;
}

export interface IReportDebit {
  amount: number;
  date: Date;
  check: string;
  department: string;
}
