import type { ICredentials } from './auth.interface';
import type { Customer } from './payload-types';

export type ICustomerCreateInput = Omit<Customer, 'id' | 'user' | 'createdAt' | 'updatedAt'> & ICredentials;
export type ICustomerUpdateInput = Partial<ICustomerCreateInput> & Pick<Customer, 'id'>;

export type ICustomerAddress = Exclude<Customer['addresses'], undefined | null>[number];
