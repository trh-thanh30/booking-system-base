export type OwnerContactField = "username" | "phone";
export type OwnerContactAvailability = {
  field: OwnerContactField;
  value: string;
  available: boolean;
};
