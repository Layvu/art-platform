import type { IOperationResult } from './api.interface';
import type { IAuthorSession } from './author.interface';
import type { ICustomerSession } from './customer.interface';

// TODO: добавить префикс "I" к генерируемым интерфейсам (Author -> IAuthor)
export interface IAuthResult extends IOperationResult {
    user?: IAuthorSession | ICustomerSession;
}

export enum UserType {
    CUSTOMER = 'customer',
    AUTHOR = 'author',
    ADMIN = 'admin',
}

export type UserRole = UserType.CUSTOMER | UserType.AUTHOR;
