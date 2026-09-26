'use client';

import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', striped = false, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <table ref={ref} className={`w-full text-left text-sm text-slate-700 ${className}`} {...props}>
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = 'Table';

export function TableHeader({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>;
}

export function TableRow({
  children,
  className = '',
  onClick,
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-slate-50/70 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-3.5 whitespace-nowrap font-bold text-slate-600 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3.5 whitespace-nowrap align-middle ${className}`}>{children}</td>;
}
