import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { Group, Image, Menu, UnstyledButton } from '@mantine/core';
import classes from './SelectPicker.module.css';
import { useFormContext } from 'react-hook-form';

type SelectPickerItem = {
    key: string;
    label: string;
};

interface SelectPickerProps {
    data: SelectPickerItem[];
    value?: string;
    name: string;
    disabled: boolean;
    // onChange?: (item: SelectPickerItem) => void;
}

export function SelectPicker({
    data,
    value,
    name
    // onChange,
}: SelectPickerProps) {
    const { setValue, watch } = useFormContext();
    const [opened, setOpened] = useState(false);
    const formValue = watch(name);
    const selected =
        data.find((item) => item.key === formValue) ??
        data.find((item) => item.key === value) ??
        data[0];
    const items = data.map((item) => (
        <Menu.Item
            onClick={() => setValue(name, item.key, { shouldDirty: true })}
            key={item.key}
        >
            {item.label}
        </Menu.Item>
    ));

    return (
        <Menu
            onOpen={() => setOpened(true)}
            onClose={() => setOpened(false)}
            radius="md"
            width="target"
            withinPortal
        >
            <Menu.Target>
                <UnstyledButton className={classes.control} data-expanded={opened || undefined}>
                    <Group gap="xs">
                        <span className={classes.label}>{selected.label}</span>
                    </Group>
                    <IconChevronDown size={16} className={classes.icon} stroke={1.5} />
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>{items}</Menu.Dropdown>
        </Menu>
    );
}