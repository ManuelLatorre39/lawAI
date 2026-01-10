import { FloatingLabelInput } from '@/components/FloatingLabelInput/FloatingLabelInput';
import type { ProductFormData } from '@/types/product/product.form';
import { Button } from '@mantine/core';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { FamilySelect } from '../families/FamilySelect';
import { DynamicFeatureFields } from '../features/DynamicFeatureFields';

export const ProductForm = ({
    defaultValues,
    onSubmit,
    readOnly = false,
    submitLabel = "Save",
}: {
    defaultValues?: ProductFormData;
    onSubmit: (data: ProductFormData) => void;
    readOnly?: boolean;
    submitLabel?: string;
}) => {
    const methods = useForm<ProductFormData>({
        defaultValues: defaultValues ?? {
            name: '',
            familyId: null,
            features: {},
        },
    });

    const familyId = useWatch({
        control: methods.control,
        name: 'familyId',
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <FloatingLabelInput
                    label="Product name"
                    name="name"
                    placeholder='MyProduct V1'
                />

                <FamilySelect name="familyId" />

                {familyId && (
                    <DynamicFeatureFields familyId={familyId} />
                )}

                {!readOnly && <Button type="submit">{submitLabel}</Button>}
            </form>
        </FormProvider>
    );
};
