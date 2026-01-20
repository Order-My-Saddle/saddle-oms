"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/services/customers';
import { Button } from '@/components/ui/button';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function CustomerDetailModal({ customer, isOpen, onClose, onEdit }: CustomerDetailModalProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details - {customer.name}</DialogTitle>
          <DialogDescription>
            View customer information and details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Customer ID</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.id}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Full Name</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.name || '-'}
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">Address</label>
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
              {customer.address || '-'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">City</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.city || '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Country</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.country || '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">State</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.state || '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Zipcode</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.zipcode || '-'}
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">Email</label>
            <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
              {customer.email || '-'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Phone Number</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.phoneNo || '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Cell Number</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.cellNo || '-'}
              </p>
            </div>
          </div>

          {customer.fitter && (
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Associated Fitter</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {customer.fitter.name}
              </p>
            </div>
          )}

          {(customer.createdAt || customer.updatedAt) && (
            <div className="grid grid-cols-2 gap-4">
              {customer.createdAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Created</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {customer.updatedAt && (
                <div>
                  <label className="block font-semibold text-sm text-gray-600 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                    {new Date(customer.updatedAt).toLocaleDateString()}
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
              Edit Customer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}