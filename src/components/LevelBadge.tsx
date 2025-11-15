
'use client';

import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
    level: number;
    size?: 'sm' | 'md' | 'lg';
}

const getTier = (level: number) => {
    if (level < 10) return { name: 'Bronze', color: 'text-yellow-600', bg: 'bg-yellow-600/10', border: 'border-yellow-700/20' };
    if (level < 20) return { name: 'Silver', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-500/20' };
    if (level < 30) return { name: 'Gold', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20' };
    if (level < 40) return { name: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-500/20' };
    if (level < 50) return { name: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/20' };
    return { name: 'Master', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/20' };
};

const LevelBadge = ({ level, size = 'md' }: LevelBadgeProps) => {
    const tier = getTier(level);

    const sizes = {
        sm: { container: 'h-6 px-2 gap-1', icon: 'h-3 w-3', text: 'text-xs' },
        md: { container: 'h-7 px-2.5 gap-1.5', icon: 'h-4 w-4', text: 'text-sm' },
        lg: { container: 'h-10 px-4 gap-2', icon: 'h-5 w-5', text: 'text-base' },
    };

    const currentSize = sizes[size];

    return (
        <div className={cn("inline-flex items-center rounded-full font-bold border", currentSize.container, tier.bg, tier.border, tier.color)}>
            <Shield className={currentSize.icon} />
            <span className={currentSize.text}>{level}</span>
        </div>
    );
};

export default LevelBadge;
