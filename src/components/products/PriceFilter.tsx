'use client';

import React, { useState } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { isValidPrice } from '@/shared/utils/isValidPrice';

import { Input } from '../ui/input';

type PriceFilterProps = {
    priceFrom?: number;
    priceTo?: number;
    onPriceChange: (priceFrom?: number, priceTo?: number) => void;
};

export default function PriceFilter({ priceFrom, priceTo, onPriceChange }: PriceFilterProps) {
    const [open, setOpen] = useState(false);
    const [priceFromValue, setPriceFromValue] = useState(priceFrom);
    const [priceToValue, setPriceToValue] = useState(priceTo);

    const isActive = priceFrom || priceTo;

    const onSaveClick = () => {
        onPriceChange(priceFromValue, priceToValue);
        setOpen(false);
    };

    const onResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPriceFromValue(undefined);
        setPriceToValue(undefined);
        onPriceChange(undefined, undefined);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant={`${isActive ? 'activeFilter' : 'filter'}`}>
                    Цена
                    {isActive && (
                        <Button variant="default" size="icon" className="rounded-full w-6 h-6" onClick={onResetClick}>
                            <X />
                        </Button>
                    )}
                    {/* {open ? <ChevronUpIcon /> : <ChevronDownIcon />} */}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
                <div className="flex flex-col gap-5">
                    <div className="flex gap-2 h-10">
                        <Input
                            type="number"
                            placeholder="от"
                            value={priceFromValue}
                            onChange={(e) => setPriceFromValue(Number(e.target.value))}
                        />

                        <Input
                            type="number"
                            placeholder="до"
                            value={priceToValue}
                            onChange={(e) => setPriceToValue(Number(e.target.value))}
                        />
                    </div>
                    {/* <RadioGroup
                        value={priceToValue?.toString()}
                        onValueChange={(price) => setPriceToValue(Number(price))}
                    >
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
                    </RadioGroup> */}

                    <div className="flex gap-5">
                        <Button
                            onClick={onResetClick}
                            className="flex-1"
                            variant="secondary"
                            disabled={!isValidPrice(priceFromValue) && !isValidPrice(priceToValue)}
                        >
                            Сбросить
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={onSaveClick}
                            disabled={!isValidPrice(priceFromValue) && !isValidPrice(priceToValue)}
                        >
                            Применить
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
