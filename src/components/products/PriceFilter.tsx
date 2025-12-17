'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Label } from '@radix-ui/react-label';

export default function PriceFilter() {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary">
                    Цена
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
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
    );
}
