"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Extra } from '@/services/extras';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface ExtraEditModalProps {
  extra: Extra | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExtra: Partial<Extra>) => Promise<void>;
}

export function ExtraEditModal({ extra, isOpen, onClose, onSave }: ExtraEditModalProps) {
  const [editedExtra, setEditedExtra] = useState<Partial<Extra>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Set initial extra data
  useEffect(() => {
    if (extra) {
      setEditedExtra({
        ...extra,
        name: extra.name || '',
        sequence: extra.sequence ?? 0,
        active: extra.active ?? true,
        price: extra.price ?? 0,
        description: extra.description || '',
      });
      setError('');
    }
  }, [extra]);

  const handleSave = async () => {
    if (!editedExtra || !extra) return;

    setSaving(true);
    setError('');

    try {
      // Validate required fields
      if (!editedExtra.name?.trim()) {
        throw new Error('Extra name is required');
      }

      if (editedExtra.sequence === undefined || editedExtra.sequence < 0) {
        throw new Error('Sequence must be a non-negative number');
      }

      if (editedExtra.price !== undefined && editedExtra.price < 0) {
        throw new Error('Price must be a non-negative number');
      }

      // Call the onSave callback
      await onSave(editedExtra);
      onClose();
    } catch (error) {
      console.error('Error saving extra:', error);
      setError(error instanceof Error ? error.message : 'Failed to save extra. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Extra, value: string | number | boolean) => {
    setEditedExtra((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (!extra) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Extra {extra.id}</DialogTitle>
          <DialogDescription>
            Update the extra information below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Name: <span className="text-red-500">*</span>
            </label>
            <Input
              value={editedExtra.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Extra Name"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Sequence: <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={editedExtra.sequence || ''}
                onChange={(e) => handleChange('sequence', parseInt(e.target.value) || 0)}
                placeholder="Display Order"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Price:</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editedExtra.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Status:</label>
              <Select
                value={editedExtra.active ? 'true' : 'false'}
                onValueChange={(value) => handleChange('active', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">Description:</label>
            <Textarea
              value={editedExtra.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Back to extras
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#7b2326] hover:bg-[#8b2329] text-white"
          >
            {saving ? 'Saving...' : 'Save extra'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}