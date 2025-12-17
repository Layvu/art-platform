import React from 'react';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Checkbox } from '../ui/checkbox';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export default function Filters() {
    const categories = Array.from({ length: 50 }).map((_, i, a) => `category ${i}`);
    const authors = Array.from({ length: 50 }).map((_, i, a) => `author ${i}`);

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">Цена</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <form className="flex flex-col gap-5">
                        <div className="flex gap-2 h-10">
                            <Input type="number" placeholder="от" />
                            <Input type="number" placeholder="до" />
                        </div>
                        <RadioGroup>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="100" id="r1" />
                                <Label htmlFor="r1">До 100 Р</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="500" id="r2" />
                                <Label htmlFor="r2">До 500 Р</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="1000" id="r3" />
                                <Label htmlFor="r3">До 1000 Р</Label>
                            </div>
                        </RadioGroup>
                        <Button type="submit" className="w-full">
                            Применить
                        </Button>
                    </form>
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">Категория</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <form className="flex flex-col gap-5">
                        {/*фильтр как-то реализован https://ui.shadcn.com/docs/components/combobox */}
                        <InputGroup>
                            <InputGroupInput placeholder="Search..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                        <ScrollArea className="h-46 w-full" >
                            {categories.map((category) => (
                                <React.Fragment key={category}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Checkbox id={category} />
                                        <Label htmlFor={category}>{category}</Label>
                                    </div>
                                </React.Fragment>
                            ))}
                        </ScrollArea>

                        <Button type="submit" className="w-full">
                            Применить
                        </Button>
                    </form>
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">Автор</Button>
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
        </>
    );
}
