export type ProductFormFeatureValue = {
  featureId: number;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN';
  value: string | number | boolean;
};

export type ProductFormData = {
  name: string;
  familyId: number | null;
  features: {
    [featureId: string]: {
      value: string | number | boolean;
      type: 'TEXT' | 'NUMBER' | 'BOOLEAN';
    };
  };
};