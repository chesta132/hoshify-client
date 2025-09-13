import type { Dayjs } from "dayjs";

export interface Note {
  id: string;
  title: string;
  details: string;
  userId: string;
  isRecycled: boolean;
  deleteAt: Dayjs | null;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}

export interface Link {
  id: string;
  link: string;
  title: string;
  position: number;
  userId: string;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}

export interface Money {
  id: string;
  userId: string;
  total: string;
  income: string;
  outcome: string;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}

export interface Schedule {
  id: string;
  title: string;
  details: string;
  start: Dayjs;
  end: Dayjs;
  userId: string;
  isRecycled: boolean;
  deleteAt: Dayjs | null;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}

export type TodoStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELED";
export interface Todo {
  id: string;
  title: string;
  details: string;
  status: TodoStatus;
  dueDate: Dayjs;
  userId: string;
  isRecycled: boolean;
  deleteAt: Dayjs | null;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}

export type TransactionType = "INCOME" | "OUTCOME";
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  title: string;
  details: string;
  userId: string;
  isRecycled: boolean;
  deleteAt: Dayjs | null;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}

export type UserRole = "OWNER" | "DEVELOPER" | "USER";
export interface User {
  id: string;
  fullName: string;
  email?: string;
  gmail?: string;
  verified: boolean;
  role: UserRole;
  currency: string;
  timeToAllowSendEmail: Dayjs;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}

export interface InitiateUser extends User {
  todos: Todo[];
  notes: Note[];
  transactions: Transaction[];
  schedules: Schedule[];
  links: Link[];
  money: Money;
  updatedAt: Dayjs;
  createdAt: Dayjs;
}
