import React from 'react';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '../ui/button';

type SortBarProps<T extends string> = {
    sort?: T;
    options: readonly { value: T; label: string }[];
    onSortChange: (value: T | undefined) => void;
};

export default function SortBar<T extends string>({ sort, options, onSortChange }: SortBarProps<T>) {
    const [open, setOpen] = React.useState(false);

    return (
        <Select
            value={sort ?? 'default'}
            onValueChange={(value) => onSortChange(value === 'default' ? undefined : (value as T))}
            open={open}
            onOpenChange={setOpen}
        >
            <SelectTrigger>
                <Button variant="secondary">
                    <SelectValue placeholder="По умолчанию" />
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </SelectTrigger>

            <SelectContent>
                {/* <SelectItem value="default">По умолчанию</SelectItem> */}
                {options.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                        {s.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
