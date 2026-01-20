"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Leathertype } from '@/services/leathertypes';
import { Button } from '@/components/ui/button';

interface LeathertypeDetailModalProps {
  leathertype: Leathertype | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function LeathertypeDetailModal({ leathertype, isOpen, onClose, onEdit }: LeathertypeDetailModalProps) {
  if (!leathertype) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leathertype Details - {leathertype.name}</DialogTitle>
          <DialogDescription>
            View leather type information and details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Leathertype ID</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {leathertype.id}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Name</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {leathertype.name || '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Sequence</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {leathertype.sequence ?? '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Status</label>
              <p className={`text-sm p-2 rounded border inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                leathertype.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {leathertype.active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {leathertype.description && (
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Description</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {leathertype.description}
              </p>
            </div>
          )}

          {(leathertype.createdAt || leathertype.updatedAt) && (
            <div className="grid grid-cols-2 gap-4">
              {leathertype.createdAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Created</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(leathertype.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {leathertype.updatedAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(leathertype.updatedAt).toLocaleDateString()}
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
              Edit Leathertype
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}