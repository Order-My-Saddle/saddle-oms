"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Model } from '@/services/models';
import { Button } from '@/components/ui/button';

interface ModelDetailModalProps {
  model: Model | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function ModelDetailModal({ model, isOpen, onClose, onEdit }: ModelDetailModalProps) {
  if (!model) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Model Details - {model.name}</DialogTitle>
          <DialogDescription>
            View saddle model information and details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Model ID</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {model.id}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Model Name</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {model.name || '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Brand</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {model.brand?.name || model.brandName || '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Sequence</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {model.sequence}
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">Status</label>
            <p className={`text-sm p-2 rounded border inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              model.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {model.active ? 'Active' : 'Inactive'}
            </p>
          </div>

          {(model.createdAt || model.updatedAt) && (
            <div className="grid grid-cols-2 gap-4">
              {model.createdAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Created</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {model.updatedAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(model.updatedAt).toLocaleDateString()}
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
              Edit Model
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}