'use client';

import { useState, useCallback } from 'react';
import { searchProductSaddles } from '@/services/productSaddles';
import { ProductSaddle } from '@/types/ProductSaddle';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function FindSaddlePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [saddle, setSaddle] = useState<ProductSaddle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSaddle(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchProductSaddles(term.trim());

      if (result['hydra:member'] && result['hydra:member'].length > 0) {
        setSaddle(result['hydra:member'][0]);
      } else {
        setSaddle(null);
        setError('No saddle found with that serial number');
      }
    } catch (err) {
      setError('Error searching for saddle. Please try again.');
      setSaddle(null);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      return value.name || value.title || JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Find saddle</h1>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter saddle serial number..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-10 text-base py-6"
        />
      </div>

      {loading && (
        <div className="text-center text-muted-foreground">
          Searching...
        </div>
      )}

      {error && (
        <div className="text-center text-destructive mb-4">
          {error}
        </div>
      )}

      {saddle && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Created at</Label>
                  <span>{formatDate(saddle.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Special notes</Label>
                  <span>{saddle.specialNotes || '-'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Name</Label>
                  <span>{saddle.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">ID</Label>
                  <span>{saddle.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Stock</Label>
                  <span>{saddle.stock}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Serial</Label>
                  <span className="font-mono">{saddle.serial}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Model</Label>
                  <span>{getDisplayValue(saddle.model)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Preset</Label>
                  <span>{getDisplayValue(saddle.preset)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Leather type</Label>
                  <span>{getDisplayValue(saddle.leatherType)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Demo</Label>
                  <Switch checked={saddle.demo} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Customizable Product</Label>
                  <Switch checked={saddle.customizableProduct} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Product has been ordered</Label>
                  <Switch checked={saddle.productHasBeenOrdered} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Sponsored</Label>
                  <Switch checked={saddle.sponsored} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Created at</Label>
                  <span>{formatDate(saddle.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {saddle.optionItems && saddle.optionItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Option items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {saddle.optionItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Label className="text-muted-foreground">{getDisplayValue(item.name)}</Label>
                      <span>{getDisplayValue(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}