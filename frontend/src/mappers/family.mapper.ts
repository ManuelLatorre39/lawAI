// mappers/family.mapper.ts
import type { CreateFamilyPayload, UpdateFamilyPayload } from "@/types/family.api";
import type { FamilyDto } from "@/types/family.dto";
import type { FamilyFormData } from "@/types/family.form";
import type { ProductDto } from "@/types/product/product.dto";
import type { ProductFormData } from "@/types/product/product.form";


export function mapFormToCreateFamilyPayload(
    form: FamilyFormData
): CreateFamilyPayload {
    return {
        name: form.name.trim(),
        description: form.description?.trim(),
        features: form.features.map((f) => ({
            name: f.name.trim(),
            type: f.type,
            required: f.required,
        })),
    };
}

export function mapFormToUpdateFamilyPayload(
    form: FamilyFormData
): UpdateFamilyPayload {
    return {
        name: form.name.trim(),
        description: form.description?.trim(),
        features: form.features.map((f) => ({
            name: f.name.trim(),
            type: f.type,
            required: f.required,
        })),
    };
}

export function mapFamilyDtoToFormData(dto: FamilyDto): FamilyFormData {
    return {
        name: dto.name,
        description: dto.description,
        features: dto.features.map((f) => ({
            name: f.name,
            type: f.type,
            required: f.required,
        })),
    };
}

export function mapProductDtoToFormData(
    dto: ProductDto
): ProductFormData {
    const features = Object.fromEntries(
        dto.features.map((fv) => {
            let value: string | number | boolean;

            switch (fv.type) {
                case 'TEXT':
                    value = fv.value ?? '';
                    break;
                case 'NUMBER':
                    value = fv.value ?? 0;
                    break;
                case 'BOOLEAN':
                    value = fv.value ?? false;
                    break;
            }

            return [
                String(fv.featureId),
                {
                    value,
                    type: fv.type,
                },
            ];
        })
    );

    return {
        name: dto.name,
        familyId: dto.family.id,
        features,
    };
}