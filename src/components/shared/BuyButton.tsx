'use client';
import React from 'react';
import { Button } from '../ui/button';
import { Minus, Plus } from 'lucide-react';

export default function BuyButton({handleMinus, handlePlus, quantity}: {
  handleMinus: () => void;
  handlePlus: () => void;
  quantity: number
}) {
    return (
        <div className="flex p-0.5 w-full gap-1 items-center justify-between text-white rounded-lg bg-my-button-primary-default">
            <Button className="p-0 w-9" onClick={handleMinus} variant="empty">
                <Minus width={36} height={36} />
            </Button>
            <div className="px-2">{quantity}</div>
            <Button className="p-0 w-9" onClick={handlePlus} variant="empty">
                <Plus width={36} height={36} />
            </Button>
        </div>
    );
}
