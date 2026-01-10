import { getFamilyById } from "@/services/family.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { ProductFormData } from "@/types/product/product.form";
import { FeatureController } from "./FeatureController";

export const DynamicFeatureFields = ({ familyId }: { familyId: number }) => {
  const { control, setValue } = useFormContext<ProductFormData>();

  const { data: family } = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => getFamilyById(familyId),
    enabled: !!familyId,
  });

  useEffect(() => {
    if (!family) return;

    const featuresState: ProductFormData['features'] =
      Object.fromEntries(
        family.features.map((f) => [
          String(f.id),
          {
            type: f.type,
            value:
              f.type === 'BOOLEAN'
                ? false
                : f.type === 'NUMBER'
                  ? 0
                  : '',
          },
        ])
      );

    setValue('features', featuresState);
  }, [family, setValue]);

  if (!family) return null;

  return (
    <div className="space-y-2">
      {family.features.map(feature => (
        <FeatureController key={feature.id} feature={feature} control={control} />
      ))}
    </div>
  );
};
