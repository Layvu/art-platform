import { Input } from '@/components/ui/input';

import { Label } from '../ui/label';

interface ISearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

// TODO: после внедрения shadcn компонент стал бессмысленным, можно удалить
export default function SearchBar({ value, onChange }: ISearchBarProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-gray-700">Поиск</Label>
            <Input
                className="max-w-[320px]"
                placeholder="Поиск..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
