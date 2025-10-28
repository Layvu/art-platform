import type { ICustomerWithoutPassword } from './customer.interface';

export interface IAuthResult {
    success: boolean;
    user?: ICustomerWithoutPassword;
    error?: string;
}
