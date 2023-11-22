export interface GptDataModel {
  products: any;
  location: any;
  confirm: any;
  completed: boolean;
}

export type NameFuntions =
  | "identifyProducts"
  | "identifyLocation"
  | "confirm"
  | "build";
