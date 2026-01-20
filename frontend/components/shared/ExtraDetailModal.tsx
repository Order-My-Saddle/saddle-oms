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
              <label className="block font-semibold text-sm text-gray-600 mb-1">Extra ID</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {extra.id}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Name</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {extra.name || '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Sequence</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {extra.sequence ?? '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Price</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {extra.price !== undefined ? `$${extra.price.toFixed(2)}` : '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Status</label>
              <p className={`text-sm p-2 rounded border inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                extra.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {extra.active ? 'Active' : 'Inactive'}
              </p>
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