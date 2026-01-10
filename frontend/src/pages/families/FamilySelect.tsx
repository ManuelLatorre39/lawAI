import { getFamilies } from "@/services/family.api";
import { Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

export const FamilySelect = ({ name }: { name: string }) => {
  const { setValue, watch } = useFormContext();
  const selected = watch(name);

  const { data: families } = useQuery({
    queryKey: ['families'],
    queryFn: getFamilies,
  });

  return (
    <Select
      label="Family"
      data={families?.map(f => ({
        value: f.id.toString(),
        label: f.name,
      })) ?? []}
      value={selected?.toString()}
      onChange={(val) => {
        setValue(name, Number(val));
        setValue('features', {}); // reset features when family changes
      }}
    />
  );
};
