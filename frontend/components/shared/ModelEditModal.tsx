"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Model } from '@/services/models';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { fetchBrands, Brand } from '@/services/brands';

interface ModelEditModalProps {
  model: Model | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedModel: Partial<Model>) => Promise<void>;
}

export function ModelEditModal({ model, isOpen, onClose, onSave }: ModelEditModalProps) {
  const [editedModel, setEditedModel] = useState<Partial<Model>>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load brands when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBrands();
    }
  }, [isOpen]);

  // Set initial model data
  useEffect(() => {
    if (model) {
      setEditedModel({
        ...model,
        name: model.name || '',
        brandName: model.brandName || '',
        sequence: model.sequence || 0,
        active: model.active ?? true,
      });
      setError('');
    }
  }, [model]);

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
    if (!editedModel || !model) return;

    setSaving(true);
    setError('');

    try {
      // Validate required fields
      if (!editedModel.name?.trim()) {
        throw new Error('Model name is required');
      }

      if (!editedModel.brandName?.trim()) {
        throw new Error('Brand is required');
      }

      if (editedModel.sequence === undefined || editedModel.sequence < 0) {
        throw new Error('Sequence must be a non-negative number');
      }

      // Call the onSave callback
      await onSave(editedModel);
      onClose();
    } catch (error) {
      console.error('Error saving model:', error);
      setError(error instanceof Error ? error.message : 'Failed to save model. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Model, value: string | number | boolean) => {
    setEditedModel((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (!model) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Model {model.id}</DialogTitle>
          <DialogDescription>
            Update the saddle model information below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Model Name: <span className="text-red-500">*</span>
            </label>
            <Input
              value={editedModel.name || ''}
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
              value={editedModel.brandName || ''}
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
                value={editedModel.sequence || ''}
                onChange={(e) => handleChange('sequence', parseInt(e.target.value) || 0)}
                placeholder="Display Order"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">Status:</label>
              <Select
                value={editedModel.active ? 'true' : 'false'}
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
            Back to models
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#7b2326] hover:bg-[#8b2329] text-white"
          >
            {saving ? 'Saving...' : 'Save model'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}