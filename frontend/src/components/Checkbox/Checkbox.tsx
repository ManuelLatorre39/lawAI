import { useState } from 'react';
import { Checkbox, Text, UnstyledButton } from '@mantine/core';
import classes from './Checkbox.module.css';
import { useFormContext } from 'react-hook-form';

export function CheckboxText({ name, text, disabled }: { name: string, text: string, disabled?: boolean }) {
    const { setValue, watch } = useFormContext();
    const formValue = watch(name);

    return (
        <UnstyledButton onClick={() => setValue(name, !formValue, { shouldDirty: true })} className={classes.button}>
            <Checkbox
                checked={formValue}
                // onChange={() => { }}
                tabIndex={-1}
                size="sm"
                mr="xl"
                styles={{ input: { cursor: 'pointer' } }}
                aria-hidden
            />

            <div>
                <Text fw={500} mb={2} lh={1}>
                    {text}
                </Text>
            </div>
        </UnstyledButton>
    );
}