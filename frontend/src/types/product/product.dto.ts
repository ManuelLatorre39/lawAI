export type ProductFeatureValueDto = {
  featureId: number;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN';
  value: string | number | boolean;
  required: boolean;
};

export type ProductDto = {
  id: number;
  name: string;
  description?: string;
  family: {
    id: number;
    name: string;
  };
  features: ProductFeatureValueDto[];
};