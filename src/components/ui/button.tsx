import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Minus, Plus } from 'lucide-react';

import { cn } from '@/shared/utils/tailwind';

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-l font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    'bg-gradient-to-l from-orange-400 to-orange-500 text-primary-foreground hover:bg-primary/90 hover:from-orange-500 hover:to-orange-500',
                destructive:
                    'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline: 'border-2 border-orange-400 text-orange-400 [&:active]:bg-orange-50 hover:text-orange-500',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                empty: '',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export const counterVariants = cva(
    'relative flex w-full items-center justify-center gap-1 rounded-md transition isolate',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-l from-orange-400 to-orange-500 text-white',

                outline: [
                    'bg-transparent text-orange-400 border-transparent', // Делаем основной фон прозрачным

                    // 1. Слой Градиента (наша "рамка") - самый нижний слой
                    'before:absolute before:inset-0 before:-z-20',
                    'before:rounded-md before:bg-gradient-to-r before:from-orange-400 before:to-orange-500',

                    // 2. Слой Белого фона - лежит поверх градиента, но под контентом
                    // inset-[2px] создает отступ от края, имитируя толщину границы
                    'after:absolute after:inset-[2px] after:-z-10',
                    'after:rounded-[6px] after:bg-white',
                ].join(' '),
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function CounterButton({
    quantity,
    increase,
    decrease,
    id,
    variant,
}: {
    quantity: number;
    increase: (id: number) => void;
    decrease: (id: number) => void;
    id: number;
    variant?: VariantProps<typeof counterVariants>['variant'];
}) {
    return (
        <div className={cn(counterVariants({ variant }))}>
            <Button variant="empty" className="" onClick={() => decrease(id)} size="icon">
                <Minus />
            </Button>

            <div className="px-2 font-semibold select-none">{quantity}</div>

            <Button variant="empty" size="icon" className="" onClick={() => increase(id)}>
                <Plus />
            </Button>
        </div>
    );
}

export { Button, buttonVariants, CounterButton };
