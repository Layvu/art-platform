'use client';

import { useEffect, useMemo, useState } from 'react';

interface TimerProps {
    startTime: string | Date;
    durationMinutes: number;
    expiredText?: string;
    className?: string;
    onExpire?: () => void;
}

export function Timer({
    startTime,
    durationMinutes,
    expiredText = 'Время истекло',
    className = '',
    onExpire,
}: TimerProps) {
    const expiryDate = useMemo(
        () => new Date(startTime).getTime() + durationMinutes * 60 * 1000,
        [startTime, durationMinutes],
    );

    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, expiryDate - Date.now()));

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire?.();
            return;
        }

        const interval = setInterval(() => {
            const remaining = Math.max(0, expiryDate - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                onExpire?.();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate, timeLeft, onExpire]);

    if (timeLeft <= 0) {
        return <span className={`text-destructive font-bold ${className}`}>{expiredText}</span>;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return (
        <span className={`text-orange-600 font-medium ${className}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}
