'use client';

import React from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center text-slate-400 mb-4">
        {icon || <PackageOpen className="w-7 h-7 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
