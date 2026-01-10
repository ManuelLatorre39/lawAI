export type ProductCreatePayload = {
  name: string;
  familyId: number;
  features: {
    featureId: number;
    value: string | number | boolean;
    type: "TEXT" | "NUMBER" | "BOOLEAN";
  }[];
};

export type ProductUpdatePayload = {
  name?: string;
  familyId?: number;
  features?: {
    featureId: number;
    value: string | number | boolean;
    type: "TEXT" | "NUMBER" | "BOOLEAN";
  }[];
};