// types/family.dto.ts
export interface FeatureDto {
  id?: number;              // exists in backend, not in form
  key?: string;              // stable identifier (slug-like)
  name: string;            // human-readable
  type: "TEXT" | "NUMBER" | "BOOLEAN";
  required: boolean;
}

export interface FamilyDto {
  id: number;
  name: string;
  description?: string;
  features: FeatureDto[];
  createdAt: string;
  updatedAt: string;
}
