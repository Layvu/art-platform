'use client';

import React, { useState } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { URL_SEPARATOR } from '@/shared/constants/constants';
import { PRODUCT_CATEGORIES } from '@/shared/constants/products.constants';

import { Checkbox } from '../ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { ScrollArea } from '../ui/scroll-area';

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

    const onResetClick = () => {
        setNewCategories([]);
        onCategoryChange(undefined);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary">
                    Категория:
                    {/* {currentCategories.length ? 'есть' : 'нет'}  */}
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start" side="bottom" avoidCollisions={false}>
                <Command>
                    <CommandInput placeholder="Найти категорию" className="h-9" />
                    <CommandList className="mt-4">
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
                                                className="cursor-pointer"
                                            />
                                            {category.label}
                                        </CommandItem>
                                    );
                                })}
                            </ScrollArea>
                        </CommandGroup>
                    </CommandList>
                </Command>
                <div className="mt-4 flex gap-5">
                    <Button onClick={onSaveClick} className="flex-1" disabled={!newCategories.length}>
                        Применить
                    </Button>
                    <Button
                        onClick={onResetClick}
                        className="flex-1"
                        variant="outline"
                        disabled={!newCategories.length}
                    >
                        Сбросить все
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
