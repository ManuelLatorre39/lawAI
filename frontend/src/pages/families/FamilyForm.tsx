import { FormProvider, useForm } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { CheckboxText } from "@/components/Checkbox/Checkbox"
import { FloatingLabelInput } from "@/components/FloatingLabelInput/FloatingLabelInput"
import { SelectPicker } from "@/components/SelectPicker/SeletPicker"
import { Button } from "@mantine/core"
import type { FamilyFormData } from "@/types/family.form";


interface FamilyFormProps {
    defaultValues?: FamilyFormData;
    onSubmit: (data: FamilyFormData) => void;
    readOnly?: boolean;
    submitLabel?: string;
}

export const FamilyForm = ({
    defaultValues,
    onSubmit,
    readOnly = false,
    submitLabel = "Save",
}: FamilyFormProps) => {
    const methods = useForm<FamilyFormData>({
        defaultValues: defaultValues ?? {
            name: "",
            description: "",
            features: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "features",
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="m-4 mt-10 flex flex-col space-y-2">

                    <FloatingLabelInput
                        label="Family name"
                        placeholder={"My new family name"}
                        name="name"
                        disabled={readOnly}
                    />

                    <FloatingLabelInput
                        label="Description"
                        placeholder={"Up to 250 characters"}
                        name="description"
                        disabled={readOnly}
                    />

                    {/* Features */}
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">

                                <FloatingLabelInput
                                    label={`Feature #${index + 1}`}
                                    placeholder="Color, Weight, etc."
                                    name={`features.${index}.name`}
                                    disabled={readOnly}
                                />

                                <SelectPicker
                                    name={`features.${index}.type`}
                                    disabled={readOnly}
                                    data={[
                                        { key: "TEXT", label: "Text" },
                                        { key: "NUMBER", label: "Number" },
                                        { key: "BOOLEAN", label: "Boolean" },
                                    ]}
                                />

                                <CheckboxText
                                    name={`features.${index}.required`}
                                    disabled={readOnly}
                                    text="Required"
                                />

                                {!readOnly && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => remove(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {!readOnly && (
                        <Button
                            type="button"
                            onClick={() =>
                                append({ name: "", type: "TEXT", required: false })
                            }
                        >
                            Add new feature
                        </Button>
                    )}

                    {!readOnly && (
                        <Button type="submit">
                            {submitLabel}
                        </Button>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};
