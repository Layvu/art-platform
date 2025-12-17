'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ScrollArea } from '../ui/scroll-area';
import { ChevronDownIcon, ChevronUpIcon, Search } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Label } from '@radix-ui/react-label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';

export default function AuthorFilter() {
    const [open, setOpen] = useState(false);
    const authors = Array.from({ length: 50 }).map((_, i, a) => `author ${i}`);

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
                        <InputGroupInput placeholder="Search..." />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    <ScrollArea className="h-46 w-full gap-2">
                        <RadioGroup>
                            {authors.map((author) => (
                                <React.Fragment key={author}>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value={author} id={author} />
                                        <Label htmlFor={author}>{author}</Label>
                                    </div>
                                </React.Fragment>
                            ))}
                        </RadioGroup>
                    </ScrollArea>

                    <Button type="submit" className="w-full">
                        Применить
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    );
}
