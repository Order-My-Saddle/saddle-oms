"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Fitter } from '@/services/fitters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface FitterEditModalProps {
  fitter: Fitter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedFitter: Partial<Fitter>) => Promise<void>;
}

export function FitterEditModal({ fitter, isOpen, onClose, onSave }: FitterEditModalProps) {
  const [editedFitter, setEditedFitter] = useState<Partial<Fitter>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fitter) {
      setEditedFitter({
        ...fitter,
        // Ensure all fields are properly set
        username: fitter.username || '',
        firstName: fitter.firstName || '',
        lastName: fitter.lastName || '',
        email: fitter.email || '',
        address: fitter.address || '',
        city: fitter.city || '',
        country: fitter.country || '',
        state: fitter.state || '',
        zipcode: fitter.zipcode || '',
        phoneNo: fitter.phoneNo || '',
        cellNo: fitter.cellNo || '',
        enabled: fitter.enabled ?? true,
      });
      setError('');
    }
  }, [fitter]);

  const handleSave = async () => {
    if (!editedFitter || !fitter) return;

    setSaving(true);
    setError('');

    try {
      // Log the complete editedFitter data before validation
      console.log('FitterEditModal: Complete editedFitter data before validation:', JSON.stringify(editedFitter, null, 2));
      console.log('FitterEditModal: Address field analysis:', {
        addressValue: editedFitter.address,
        addressType: typeof editedFitter.address,
        addressLength: editedFitter.address?.length,
        addressTrimmed: editedFitter.address?.trim(),
        addressTrimmedLength: editedFitter.address?.trim().length,
        isAddressEmpty: !editedFitter.address?.trim(),
      });

      // Validate required fields
      if (!editedFitter.username?.trim()) {
        throw new Error('Username is required');
      }

      if (!editedFitter.email?.trim()) {
        throw new Error('Email is required');
      }

      if (!editedFitter.address?.trim()) {
        console.error('FitterEditModal: Address validation failed - address field is empty or whitespace');
        throw new Error('Address is required');
      }

      if (!editedFitter.city?.trim()) {
        throw new Error('City is required');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedFitter.email)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('FitterEditModal: All validations passed, calling onSave with data:', JSON.stringify(editedFitter, null, 2));

      // Call the onSave callback
      await onSave(editedFitter);
      onClose();
    } catch (error) {
      console.error('Error saving fitter:', error);
      setError(error instanceof Error ? error.message : 'Failed to save fitter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Fitter, value: string | boolean) => {
    setEditedFitter((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (!fitter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Fitter {fitter.username}</DialogTitle>
          <DialogDescription>
            Update the fitter information below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Username: <span className="text-red-500">*</span>
            </label>
            <Input
              value={editedFitter.username || ''}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                First Name:
              </label>
              <Input
                value={editedFitter.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="First Name"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Last Name:
              </label>
              <Input
                value={editedFitter.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Email: <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={editedFitter.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email Address"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Status: <span className="text-red-500">*</span>
            </label>
            <Select
              value={editedFitter.enabled ? 'true' : 'false'}
              onValueChange={(value) => handleChange('enabled', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Enabled</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block font-semibold text-sm text-gray-600 mb-1">
              Address: <span className="text-red-500">*</span>
            </label>
            <Input
              value={editedFitter.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Street Address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                City: <span className="text-red-500">*</span>
              </label>
              <Input
                value={editedFitter.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Country:
              </label>
              <Select
                value={editedFitter.country || undefined}
                onValueChange={(value) => handleChange('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="NL">Netherlands</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                  <SelectItem value="AT">Austria</SelectItem>
                  <SelectItem value="BE">Belgium</SelectItem>
                  <SelectItem value="CH">Switzerland</SelectItem>
                  <SelectItem value="DK">Denmark</SelectItem>
                  <SelectItem value="FI">Finland</SelectItem>
                  <SelectItem value="IE">Ireland</SelectItem>
                  <SelectItem value="NO">Norway</SelectItem>
                  <SelectItem value="PT">Portugal</SelectItem>
                  <SelectItem value="SE">Sweden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                State:
              </label>
              <Input
                value={editedFitter.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State/Province"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Zipcode:
              </label>
              <Input
                value={editedFitter.zipcode || ''}
                onChange={(e) => handleChange('zipcode', e.target.value)}
                placeholder="Postal/Zip Code"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Phone Number:
              </label>
              <Input
                type="tel"
                value={editedFitter.phoneNo || ''}
                onChange={(e) => handleChange('phoneNo', e.target.value)}
                placeholder="Phone Number"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-600 mb-1">
                Cell Number:
              </label>
              <Input
                type="tel"
                value={editedFitter.cellNo || ''}
                onChange={(e) => handleChange('cellNo', e.target.value)}
                placeholder="Cell Number"
              />
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
            Back to fitters
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#7b2326] hover:bg-[#8b2329] text-white"
          >
            {saving ? 'Saving...' : 'Save fitter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}