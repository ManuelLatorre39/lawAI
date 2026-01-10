import { useState } from 'react';
import { TextInput, type TextInputProps } from '@mantine/core';
import classes from './FloatingLabelInput.module.css';
import { useFormContext } from 'react-hook-form';

interface FloatingLabelInputProps extends TextInputProps {
    label: string;
    placeholder?: string;
    name: string;
    error?: string;
}

export function FloatingLabelInput({
    label,
    placeholder,
    error,
    name,
    ...props }: FloatingLabelInputProps) {
    const { register, watch } = useFormContext();
    const fieldValue = watch(name); // << RHF value
    const [focused, setFocused] = useState(false);

    const floating =
        (fieldValue && fieldValue.trim().length !== 0) ||
        focused ||
        undefined;

    return (
        <TextInput
            label={label}
            placeholder={placeholder}
            required
            classNames={classes}
            {...register(name)}
            // value={value}
            // onChange={(event) => setValue(event.currentTarget.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            mt="md"
            autoComplete="nope"
            data-floating={floating}
            labelProps={{ 'data-floating': floating }}
            {...props}
        />
    );
}