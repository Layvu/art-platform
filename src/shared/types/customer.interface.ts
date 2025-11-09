import type { UserType } from './auth.interface';
import type { Customer } from './payload-types';

export type ICustomerFormData = Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>;
export type ICustomerCreateInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type ICustomerUpdateInput = Partial<ICustomerCreateInput>;
export type ICustomerWithoutPassword = Omit<Customer, 'password'>;

export type ICustomerAddress = Exclude<Customer['addresses'], undefined | null>[number];

// Для сессии покупателя - минимум данных
export interface ICustomerSession {
    id: number; // User id
    type: UserType.CUSTOMER;
}
