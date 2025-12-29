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

type AuthorFilterProps = {
    initialAuthor?: string;
    onAuthorChange: (author: string) => void;
};

export default function AuthorFilter({ initialAuthor, onAuthorChange }: AuthorFilterProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>(initialAuthor);

    // TODO пеерделать в infinite scroll
    // счас костыль 1000 записей
    // отсортировать по алфавиту
    const { data, isError, error, isPlaceholderData, isFetching } = useFetchAuthors({ limit: 1000 });
    const authors = data?.docs;
    const filteredAuthors = authors?.filter((author) => author.name?.toLowerCase().includes(search.toLowerCase()));

    const onSaveClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAuthor) return;
        onAuthorChange(selectedAuthor);
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
                <form className="flex flex-col gap-5">
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Найти автора"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <InputGroupAddon align="inline-end">
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    {isFetching ? (
                        <Spinner />
                    ) : !filteredAuthors || filteredAuthors.length === 0 ? (
                        <div>Авторов нет</div>
                    ) : isError ? (
                        <div>Error: {error.message}</div>
                    ) : (
                        <>
                            <ScrollArea className="max-h-46 h-fit w-full gap-2">
                                <RadioGroup value={selectedAuthor} onValueChange={setSelectedAuthor}>
                                    {filteredAuthors?.map((author) => (
                                        <React.Fragment key={author.id}>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    value={author.name ? author.name : author.id.toString()}
                                                    id={author.id.toString()}
                                                />
                                                <Label htmlFor={author.id.toString()}>{author.name}</Label>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </RadioGroup>
                            </ScrollArea>

                            <Button
                                disabled={!selectedAuthor}
                                type="submit"
                                className="w-full"
                                onClick={(e) => onSaveClick(e)}
                            >
                                Применить
                            </Button>
                        </>
                    )}
                </form>
            </PopoverContent>
        </Popover>
    );
}
