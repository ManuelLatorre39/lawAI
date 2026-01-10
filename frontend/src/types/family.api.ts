import type { FeatureDto } from "./family.dto";

export interface CreateFamilyPayload {
    name: string;
    description?: string;
    features: FeatureDto[];
}

export interface UpdateFamilyPayload {
    name?: string;
    description?: string;
    features?: FeatureDto[];
}

