"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Extra } from '@/services/extras';
import { Button } from '@/components/ui/button';

interface ExtraDetailModalProps {
  extra: Extra | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

const PRICE_TIERS = [
  { key: 'price1' as const, label: 'USD', symbol: '$' },
  { key: 'price2' as const, label: 'EUR', symbol: '€' },
  { key: 'price3' as const, label: 'GBP', symbol: '£' },
  { key: 'price4' as const, label: 'CAD', symbol: 'C$' },
  { key: 'price5' as const, label: 'AUD', symbol: 'A$' },
  { key: 'price6' as const, label: 'NOK', symbol: 'N€' },
  { key: 'price7' as const, label: 'DKK', symbol: 'D€' },
];

export function ExtraDetailModal({ extra, isOpen, onClose, onEdit }: ExtraDetailModalProps) {
  if (!extra) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Extra Details - {extra.name}</DialogTitle>
          <DialogDescription>
            View extra information and details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Name</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {extra.name || '-'}
              </p>
            </div>
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Sequence</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {extra.sequence ?? '-'}
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-2">Default Prices</label>
            <div className="grid grid-cols-4 gap-3">
              {PRICE_TIERS.map(({ key, label, symbol }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {symbol} {(extra[key] ?? 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {extra.description && (
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Description</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {extra.description}
              </p>
            </div>
          )}

          {(extra.createdAt || extra.updatedAt) && (
            <div className="grid grid-cols-2 gap-4">
              {extra.createdAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Created</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(extra.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {extra.updatedAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(extra.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              className="bg-[#7b2326] hover:bg-[#8b2329] text-white"
            >
              Edit Extra
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
