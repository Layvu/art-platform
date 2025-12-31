import type { ProductsSortOptions } from '@/shared/types/query-params.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { PRODUCTS_SORT_OPTIONS } from '@/shared/constants/products.constants';
import { Button } from '../ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

type SortBarProps = {
    sort?: string;
    onSortChange: (value: ProductsSortOptions | undefined) => void;
};
export default function SortBar({ sort, onSortChange }: SortBarProps) {
    const [open, setOpen] = React.useState<boolean>(false);

    return (
        <Select
            value={sort}
            onValueChange={(value) => onSortChange(value === 'default' ? undefined : (value as ProductsSortOptions))}
            open={open}
            onOpenChange={setOpen}
        >
            <SelectTrigger className="">
                <Button variant="secondary">
                    <SelectValue placeholder="По умолчанию" />
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </SelectTrigger>

            <SelectContent>
                {PRODUCTS_SORT_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                        {s.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
