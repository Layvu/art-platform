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

    const currentCategories = category ? category.split(URL_SEPARATOR).filter(Boolean) : [];

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
                    <CommandInput placeholder="Search..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
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
                                            />
                                            {category.label}
                                        </CommandItem>
                                    );
                                })}
                            </ScrollArea>
                        </CommandGroup>
                    </CommandList>
                </Command>
                {/*фильтр как-то реализован https://ui.shadcn.com/docs/components/combobox */}
                {/* <InputGroup>
                        <InputGroupInput placeholder="Search..." />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    <ScrollArea className="h-46 w-full">
                        {PRODUCT_CATEGORIES.map((c) => {
                            // читаем состояние текущего чекбокса на основе фильтров
                            const isChecked = currentCategories.includes(c.value);
                            return (
                                <div key={c.value} className="flex items-center gap-3 mb-2">
                                    <Checkbox
                                        id={c.value}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                            const newCategories = checked
                                                ? [...new Set([...currentCategories, c.value])] // добавляем
                                                : currentCategories.filter((v) => v !== c.value); // удаляем

                                            onCategoryChange(
                                                newCategories.length ? newCategories.join(URL_SEPARATOR) : undefined, // чтобы убрать параметр из URL
                                            );
                                        }}
                                    />
                                    <Label htmlFor={c.value}>{c.label}</Label>
                                </div>
                            );
                        })}
                    </ScrollArea> */}

                <Button type="submit" onClick={onSaveClick} className="w-full">
                    Применить
                </Button>
            </PopoverContent>
        </Popover>
    );
}
