// types/family.form.ts
export interface FamilyFeatureForm {
  id?: number;
  name: string;
  type: "TEXT" | "NUMBER" | "BOOLEAN";
  required: boolean;
}

export interface FamilyFormData {
  name: string;
  description?: string;
  features: FamilyFeatureForm[];
}
