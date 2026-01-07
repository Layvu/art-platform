'use client';

import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/shared/utils/tailwind';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                // базовое состояние
                'peer size-4 shrink-0 rounded-[4px] border border-zinc-300 bg-white shadow-xs outline-none transition',

                // checked
                'data-[state=checked]:border-zinc-300 data-[state=checked]:bg-white',

                // focus / disabled
                'focus-visible:ring-2 focus-visible:ring-ring/50',
                'disabled:cursor-not-allowed disabled:opacity-50',

                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center">
                <CheckIcon className="size-3" stroke="black" strokeWidth={3} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
