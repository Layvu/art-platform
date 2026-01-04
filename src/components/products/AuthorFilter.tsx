'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ScrollArea } from '../ui/scroll-area';
import { ChevronDownIcon, ChevronUpIcon, Search } from 'lucide-react';
import { Label } from '@radix-ui/react-label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { useFetchAuthors } from '@/shared/hooks/useFetchData';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Spinner } from '../ui/spinner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';

type AuthorFilterProps = {
    initialAuthor?: string;
    onAuthorChange: (author?: string) => void;
};

export default function AuthorFilter({ initialAuthor, onAuthorChange }: AuthorFilterProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>(initialAuthor);

    // TODO пеерделать в infinite scroll
    // счас костыль 1000 записей
    // отсортировать по алфавиту
    const { data, isError, error, isFetching } = useFetchAuthors({ limit: 1000 });
    const authors = data?.docs;
    const filteredAuthors = authors?.filter((author) => author.name?.toLowerCase().includes(search.toLowerCase()));

    const onSaveClick = () => {
        if (!selectedAuthor) return;
        onAuthorChange(selectedAuthor);
        setOpen(false);
    };

    const onResetClick = () => {
        setSelectedAuthor(undefined);
        onAuthorChange(undefined);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary">
                    Автор
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
                <Command>
                    <CommandInput value={search} onValueChange={setSearch} placeholder="Найти автора" className="h-9" />
                    <CommandList className="mt-4">
                        <CommandEmpty>Такого автора нет.</CommandEmpty>
                        <CommandGroup>
                            {isFetching ? (
                                <Spinner />
                            ) : isError ? (
                                <div>Error: {error.message}</div>
                            ) : (
                                <ScrollArea className="max-h-46 h-fit w-full">
                                    <RadioGroup
                                        className="gap-0"
                                        value={selectedAuthor}
                                        onValueChange={setSelectedAuthor}
                                    >
                                        {filteredAuthors?.map((author) => {
                                            const value = author.name ?? author.id.toString();
                                            const isChecked = selectedAuthor === value;

                                            const select = () => {
                                                setSelectedAuthor(value);
                                            };

                                            return (
                                                <CommandItem
                                                    key={author.id}
                                                    value={value}
                                                    onSelect={select}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <RadioGroupItem
                                                        checked={isChecked}
                                                        value={value}
                                                        id={author.id.toString()}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            select();
                                                        }}
                                                        className="cursor-pointer"
                                                    />
                                                    <Label className="cursor-pointer" htmlFor={author.id.toString()}>
                                                        {author.name}
                                                    </Label>
                                                </CommandItem>
                                            );
                                        })}
                                    </RadioGroup>
                                </ScrollArea>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
                <div className="mt-4 flex gap-5">
                <Button
                    disabled={!selectedAuthor}
                    type="submit"
                    className="flex-1"
                    onClick={onSaveClick}
                >
                    Применить
                </Button>
                    <Button onClick={onResetClick} className="flex-1" variant="outline" disabled={!selectedAuthor}>
                        Сбросить все
                    </Button>
                </div>
            
            </PopoverContent>
        </Popover>
    );
}
