export type ProductActionStatus = "AVAILABLE" | "REVIEW_REQUIRED";

export type ProductAction = Readonly<{
  id: string;
  label: string;
  description: string;
  status: ProductActionStatus;
  href?: string;
  external?: boolean;
  notice?: string;
}>;
