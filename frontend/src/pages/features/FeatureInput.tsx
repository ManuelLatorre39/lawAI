import type { FeatureDto } from "@/types/family.dto";
import { Checkbox, TextInput } from "@mantine/core";

export const FeatureInput = ({
  feature,
  value,
  onChange,
}: {
  feature: FeatureDto,
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) => {
  // const name = `features.${feature.id}`;

  switch (feature.type) {
    case 'NUMBER':
      return (
        <TextInput
          type="number"
          label={feature.name}
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );

    case 'BOOLEAN':
      return (
        <Checkbox
          label={feature.name}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );

    default:
      return (
        <TextInput
          type="text"
          label={feature.name}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};
