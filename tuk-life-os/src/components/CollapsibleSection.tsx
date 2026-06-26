import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';

export const CollapsibleSection = ({ title, icon: Icon = Database, children, defaultCollapsed = true }: { title: string, icon?: any, children: React.ReactNode, defaultCollapsed?: boolean }) => {
    const [isOpen, setIsOpen] = useState(!defaultCollapsed);
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
            <button className="w-full flex justify-between items-center font-bold text-lg text-slate-800 mb-4" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-indigo-500" />
                    {title}
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && children}
        </div>
    );
};
