import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React from 'react';

export const SearchInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search...' }) => (
    <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 rounded-full border-0 bg-muted/70 pl-9 focus-visible:ring-1 focus-visible:ring-ring"
        />
    </div>
);
