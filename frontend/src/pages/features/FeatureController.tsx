import type { FeatureDto } from '@/types/family.dto';
import type { ProductFormData } from '@/types/product/product.form';
import { Controller, type Control} from 'react-hook-form';
import { FeatureInput } from './FeatureInput';

export const FeatureController = ({
    feature,
    control,
}: {
    feature: FeatureDto;
    control: Control<ProductFormData>;
}) => {
    if (!feature.id) return null;
    return (
        <Controller
            control={control}
            name={`features.${feature.id}.value`}
            render={({ field }) => (
                <FeatureInput
                    feature={feature}
                    value={field.value}
                    onChange={field.onChange}
                />
            )}
        />
    );
};
