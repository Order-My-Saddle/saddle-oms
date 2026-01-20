"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from 'lucide-react';
import { createCustomer } from '@/services/api';
import { fetchFitters, Fitter } from '@/services/fitters';

interface CustomerFormProps {
  customer?: {
    id: string;
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    phone: string;
  };
  onClose: () => void;
  onSave?: (customer: any) => void;
}

const defaultFormData = {
  name: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  phone: '',
  notes: '',
  fitterId: '',
};

export function CustomerForm({ customer, onClose, onSave }: CustomerFormProps) {
  const [formData, setFormData] = useState(() => {
    if (!customer) return defaultFormData;
    
    return {
      ...defaultFormData,
      ...customer,
    };
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fitters, setFitters] = useState<Fitter[]>([]);
  const [loadingFitters, setLoadingFitters] = useState(true);

  // Fetch fitters on component mount
  useEffect(() => {
    const loadFitters = async () => {
      try {
        const response = await fetchFitters({ page: 1 });
        setFitters(response['hydra:member'] || []);
      } catch (error) {
        console.error('Error loading fitters:', error);
        setError('Failed to load fitters');
      } finally {
        setLoadingFitters(false);
      }
    };

    loadFitters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Customer name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Customer email is required');
      return;
    }
    
    if (!formData.fitterId) {
      setError('Please select a fitter');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Prepare customer data for API based on Customer entity structure
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipcode: formData.zipcode.trim(),
        country: formData.country.trim(),
        phone: formData.phone.trim(),
        fitter: `/fitters/${formData.fitterId}`, // IRI reference to the fitter
      };
      
      if (customer?.id) {
        // TODO: Implement update customer when needed
        console.log('Update customer:', customerData);
      } else {
        // Create new customer
        const newCustomer = await createCustomer(customerData);
        console.log('Customer created successfully:', newCustomer);
        onSave?.(newCustomer);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      setError(error instanceof Error ? error.message : 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <DialogContent className="max-w-[600px] h-[90vh] p-0 flex flex-col">
      <DialogHeader className="px-4 py-4 border-b bg-[#F5F5F5] flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <DialogTitle className="text-sm">
            {customer ? `Edit Customer: ${customer.name}` : 'Add New Customer'}
          </DialogTitle>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4 text-sm">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="h-9"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="h-9"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Phone</Label>
                <Input
                  className="h-9"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Fitter <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.fitterId}
                  onValueChange={(value) => handleInputChange('fitterId', value)}
                  disabled={loadingFitters}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={loadingFitters ? "Loading fitters..." : "Select a fitter"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fitters.map((fitter) => (
                      <SelectItem key={fitter.id} value={fitter.id.toString()}>
                        {fitter.name} ({fitter.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4 text-sm">Address Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Address</Label>
                <Input
                  className="h-9"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">City</Label>
                  <Input
                    className="h-9"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">State/Province</Label>
                  <Input
                    className="h-9"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Postal Code</Label>
                  <Input
                    className="h-9"
                    value={formData.zipcode}
                    onChange={(e) => handleInputChange('zipcode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Netherlands">Netherlands</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4 text-sm">Additional Notes</h3>
            <div className="space-y-2">
              <Label className="text-sm">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes about this customer..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Bottom Actions */}
      <div className="border-t p-4 bg-[#F5F5F5] flex justify-between">
        <Button variant="outline" className="h-9 text-sm" onClick={onClose}>
          Cancel
        </Button>
        <div className="space-x-2">
          <Button 
            type="submit"
            variant="destructive" 
            className="bg-[#8B0000] h-9 text-sm" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : (customer ? 'Update Customer' : 'Create Customer')}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}