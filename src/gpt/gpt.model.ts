export interface GptDataModel {
  products: any;
  location: any;
  confirm: any;
  completed: boolean;
}

export type NameFuntions =
  | "showMedicines"
  | "saveOrder"
  | "addMedicine"
  | "updateMedicine"
  | "showOrder"
  | "deleteMedicine"
  | "addUserInfo"
  | "quoteProducts";
