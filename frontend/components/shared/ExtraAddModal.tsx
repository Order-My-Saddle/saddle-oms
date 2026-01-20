"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Extra } from '@/services/extras';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface ExtraAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newExtra: Partial<Extra>) => Promise<void>;
}

export function ExtraAddModal({ isOpen, onClose, onSave }: ExtraAddModalProps) {
  const [newExtra, setNewExtra] = useState<Partial<Extra>>({
    name: '',
    sequence: 0,
    active: true,
    price: 0,
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewExtra({
        name: '',
        sequence: 0,
        active: true,
        price: 0,
        description: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Validate required fields
      if (!newExtra.name?.trim()) {
        throw new Error('Extra name is required');
      }

      if (newExtra.sequence === undefined || newExtra.sequence < 0) {
        throw new Error('Sequence must be a non-negative number');
      }

      if (newExtra.price === undefined || newExtra.price < 0) {
        throw new Error('Price must be a non-negative number');
      }

      // Call the onSave callback
      await onSave(newExtra);
      onClose();
    } catch (error) {
      console.error('Error saving extra:', error);
      setError(error instanceof Error ? error.message : 'Failed to save extra. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Extra, value: string | number | boolean) => {
    setNewExtra((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Extra</DialogTitle>
          <DialogDescription>
            Create a new saddle extra below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Extra Name: <span className="text-red-500">*</span>
            </label>
            <Input
              value={newExtra.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Extra Name"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Description:
            </label>
            <Textarea
              value={newExtra.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Price: <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newExtra.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Sequence:
              </label>
              <Input
                type="number"
                min="0"
                value={newExtra.sequence || ''}
                onChange={(e) => handleChange('sequence', parseInt(e.target.value) || 0)}
                placeholder="Display Order"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Status:</label>
              <Select
                value={newExtra.active ? 'true' : 'false'}
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
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#7b2326] hover:bg-[#8b2329] text-white"
          >
            {saving ? 'Creating...' : 'Create extra'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}