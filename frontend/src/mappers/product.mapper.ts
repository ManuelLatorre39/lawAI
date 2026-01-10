import type { ProductCreatePayload, ProductUpdatePayload } from "@/types/product/product.api";
import type { ProductFormData } from "@/types/product/product.form";

export function mapFormToCreateProductPayload(
  data: ProductFormData
): ProductCreatePayload {
  console.log(data.features)
  return {
    name: data.name,
    familyId: data.familyId!,
    features: Object.entries(data.features).map(
      ([featureId, { value, type }]) => ({
        featureId: Number(featureId),
        type,
        value,
      })
    ),
  };
}

export function mapFormToUpdateProductPayload(
  form: ProductFormData
): ProductUpdatePayload {
  return {
    name: form.name.trim(),
    // description: form.description?.trim(),
    familyId: form.familyId!,
    features: Object.entries(form.features).map(
      ([featureId, { value, type }]) => ({
        featureId: Number(featureId),
        type,
        value,
      })
    ),
  };
}