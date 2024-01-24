export interface GptDataModel {
  products: any;
  location: any;
  confirm: any;
  completed: boolean;
}

export type NameFuntions =
  | "showProducts"
  | "saveOrder"
  | "addProduct"
  | "updateProduct"
  | "showOrder"
  | "deleteProduct"
  | "addUserInfo"
  | "quoteProducts";
