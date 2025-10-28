export interface ICustomer {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    password: string;
    addresses?: ICustomerAddress[];
    createdAt?: string;
}

export interface ICustomerAddress {
    label: string;
    addressLine: string;
    city: string;
    postalCode: string;
}

export type ICustomerWithoutPassword = Omit<ICustomer, 'password'>;
