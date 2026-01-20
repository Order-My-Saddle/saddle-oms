"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Model } from '@/services/models';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { fetchBrands, Brand } from '@/services/brands';

interface ModelAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newModel: Partial<Model>) => Promise<void>;
}

export function ModelAddModal({ isOpen, onClose, onSave }: ModelAddModalProps) {
  const [newModel, setNewModel] = useState<Partial<Model>>({
    name: '',
    brandName: '',
    sequence: 0,
    active: true,
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load brands when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBrands();
      // Reset form when modal opens
      setNewModel({
        name: '',
        brandName: '',
        sequence: 0,
        active: true,
      });
      setError('');
    }
  }, [isOpen]);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const data = await fetchBrands({
        page: 1,
        orderBy: 'name',
        order: 'asc',
        extraParams: { active: true }
      });
      setBrands(data['hydra:member'] || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Validate required fields
      if (!newModel.name?.trim()) {
        throw new Error('Model name is required');
      }

      if (!newModel.brandName?.trim()) {
        throw new Error('Brand is required');
      }

      if (newModel.sequence === undefined || newModel.sequence < 0) {
        throw new Error('Sequence must be a non-negative number');
      }

      // Call the onSave callback
      await onSave(newModel);
      onClose();
    } catch (error) {
      console.error('Error saving model:', error);
      setError(error instanceof Error ? error.message : 'Failed to save model. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Model, value: string | number | boolean) => {
    setNewModel((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Model</DialogTitle>
          <DialogDescription>
            Create a new saddle model below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Model Name: <span className="text-red-500">*</span>
            </label>
            <Input
              value={newModel.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Model Name"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Brand: <span className="text-red-500">*</span>
            </label>
            <Select
              value={newModel.brandName || ''}
              onValueChange={(value) => handleChange('brandName', value)}
              disabled={loadingBrands}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select brand"} />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Sequence: <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={newModel.sequence || ''}
                onChange={(e) => handleChange('sequence', parseInt(e.target.value) || 0)}
                placeholder="Display Order"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Status:</label>
              <Select
                value={newModel.active ? 'true' : 'false'}
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
            {saving ? 'Creating...' : 'Create model'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}