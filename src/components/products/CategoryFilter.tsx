'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { URL_SEPARATOR } from '@/shared/constants/constants';
import { PRODUCT_CATEGORIES } from '@/shared/constants/products.constants';

import { Checkbox } from '../ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { ScrollArea } from '../ui/scroll-area';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

type CategoryFilterProps = {
    category?: string;
    onCategoryChange: (category?: string) => void;
};
export default function CategoryFilter({ category, onCategoryChange }: CategoryFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [newCategories, setNewCategories] = useState<string[]>(
        category ? category.split(URL_SEPARATOR).filter(Boolean) : [],
    );


    const onSaveClick = () => {
        onCategoryChange(
            newCategories?.length ? newCategories.join(URL_SEPARATOR) : undefined, // чтобы убрать параметр из URL
        );
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary">Категория:
                 {/* {currentCategories.length ? 'есть' : 'нет'}  */}
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
                <Command>
                    <CommandInput placeholder="Найти категорию" className="h-9" />
                    <CommandList className='mt-4'>
                        <CommandEmpty>Такой категории нет.</CommandEmpty>
                        <CommandGroup>
                            <ScrollArea className="h-46 w-full">
                                {PRODUCT_CATEGORIES.map((category) => {
                                    const isChecked = newCategories.includes(category.value);

                                    const toggle = () => {
                                        setNewCategories((prev) =>
                                            prev.includes(category.value)
                                                ? prev.filter((c) => c !== category.value)
                                                : [...prev, category.value],
                                        );
                                    };

                                    return (
                                        <CommandItem
                                            className="cursor-pointer"
                                            key={category.value}
                                            value={category.label}
                                            onSelect={toggle}
                                        >
                                            <Checkbox
                                                id={category.value}
                                                checked={isChecked}
                                                // Клик по чекбоксу переключает так же
                                                // нельзя без этого тк CommandItem не считает за чилдрена чекбокс
                                                onCheckedChange={toggle}
                                                // Блокируем всплытие, чтобы CommandItem не срабатывал дважды
                                                onClick={(e) => e.stopPropagation()}
                                                className='cursor-pointer'
                                            />
                                            {category.label}
                                        </CommandItem>
                                    );
                                })}
                            </ScrollArea>
                        </CommandGroup>
                    </CommandList>
                </Command>
                <Button onClick={onSaveClick} className="w-full mt-4" disabled={!newCategories.length}>
                    Применить
                </Button>
            </PopoverContent>
        </Popover>
    );
}
