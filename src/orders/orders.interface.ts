export interface IProduct {
  codProduct: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  chatId: string;
  total: number;
  numOrder: number;
  products: IProduct[];
  state: string;
  createdAt?: Date;
  updatedAt?: string;
}
