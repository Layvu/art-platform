interface ISearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: ISearchBarProps) {
    return (
        <input
            type="text"
            placeholder="Поиск..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
        />
    );
}
