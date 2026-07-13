export type StockControl = {
  code: string;
  label: string;
  groupLabel: string;
  productCode: string | null;
  variantLabel: string | null;
  isAvailable: boolean;
};
