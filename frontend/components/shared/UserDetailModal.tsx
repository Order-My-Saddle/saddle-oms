"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '@/types/Role';
import { Button } from '@/components/ui/button';
import { getRoleDisplayName } from '@/utils/rolePermissions';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function UserDetailModal({ user, isOpen, onClose, onEdit }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details - {user.username}</DialogTitle>
          <DialogDescription>
            View user information and details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">User ID</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {user.id}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Username</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {user.username || '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Email</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {user.email || '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Role</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">First Name</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {user.firstName || '-'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Last Name</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {user.lastName || '-'}
              </p>
            </div>
          </div>

          {/* Additional fields can be added here */}
        </div>

        <div className="flex justify-end gap-2 mt-6">
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
              Edit User
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}