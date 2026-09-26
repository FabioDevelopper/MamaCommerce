'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.js';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-white">
      <div className="text-xs text-slate-500 font-medium">
        {totalItems !== undefined && itemsPerPage !== undefined ? (
          <>
            Affichage de{' '}
            <span className="font-bold text-slate-700">
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
            </span>{' '}
            à{' '}
            <span className="font-bold text-slate-700">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            sur <span className="font-bold text-slate-700">{totalItems}</span> résultats
          </>
        ) : (
          <>
            Page <span className="font-bold text-slate-700">{currentPage}</span> sur{' '}
            <span className="font-bold text-slate-700">{totalPages}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Précédent
        </Button>

        <span className="text-xs font-semibold px-2 text-slate-600">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={<ChevronRight className="w-4 h-4" />}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
