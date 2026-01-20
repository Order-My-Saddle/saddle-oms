"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination } from '@/hooks';
import { getPresetTableColumns } from '@/utils/presetTableColumns';
import { PageHeader } from '@/components/shared/PageHeader';
import { fetchPresets, updatePreset, deletePreset, createPreset, type Preset } from '@/services/presets';
import { PresetDetailModal } from '@/components/shared/PresetDetailModal';
import { PresetEditModal } from '@/components/shared/PresetEditModal';
import { PresetAddModal } from '@/components/shared/PresetAddModal';

export default function Presets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Use our hooks for filters and pagination
  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems, setPage } = usePagination(30, 1);
  
  // Fetch presets with filters
  const fetchPresetsData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching presets with filters:', filters);
      const data = await fetchPresets({
        page: pagination.currentPage,
        searchTerm,
        filters,
        orderBy: 'sequence',
        order: 'asc'
      });
      
      setPresets(data['hydra:member'] || []);
      setTotalItems(data['hydra:totalItems'] || 0);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch presets');
      setPresets([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, searchTerm, filters, setTotalItems]);

  // Fetch presets when dependencies change
  useEffect(() => {
    fetchPresetsData();
  }, [fetchPresetsData]);
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
    setPage(1); // Reset to page 1 when filters change
  };
  
  // Handle view preset details
  const handleViewPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    setIsDetailModalOpen(true);
  };

  // Handle edit preset
  const handleEditPreset = (preset: Preset) => {
    setSelectedPreset(preset);
    setIsEditModalOpen(true);
  };

  // Handle edit from detail modal
  const handleEditFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Handle save preset
  const handleSavePreset = async (updatedPreset: Partial<Preset>) => {
    if (!selectedPreset) return;

    try {
      await updatePreset(selectedPreset.id, updatedPreset);

      // Update local state
      setPresets(prev =>
        prev.map(item =>
          item.id === selectedPreset.id
            ? { ...item, ...updatedPreset }
            : item
        )
      );

      // Refresh data to ensure consistency
      await fetchPresetsData();
    } catch (error) {
      console.error('Error updating preset:', error);
      throw error; // Re-throw to let modal handle the error display
    }
  };

  // Handle delete preset
  const handleDeletePreset = async (preset: Preset) => {
    if (window.confirm(`Are you sure you want to delete the preset "${preset.name}"?`)) {
      try {
        await deletePreset(preset.id);

        // Remove from local state
        setPresets(prev => prev.filter(item => item.id !== preset.id));

        // Refresh data to ensure consistency
        await fetchPresetsData();
      } catch (error) {
        console.error('Error deleting preset:', error);
        setError('Failed to delete preset. Please try again.');
      }
    }
  };

  // Handle add preset
  const handleAddPreset = () => {
    setIsAddModalOpen(true);
  };

  // Handle save new preset (for add modal)
  const handleSaveNewPreset = async (newPreset: Partial<Preset>) => {
    try {
      await createPreset(newPreset);
      // Refresh the preset list
      fetchPresetsData();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creating preset:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedPreset(null);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader 
        title="Presets" 
        description="Manage your saddle configuration presets" 
        actions={
          <Button onClick={handleAddPreset} className="bg-[#7b2326] hover:bg-[#8b2329] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Preset
          </Button>
        } 
      />


      <EntityTable
        entities={presets}
        columns={getPresetTableColumns(filters, handleFilterChange)}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        headerFilters={filters}
        onFilterChange={handleFilterChange}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: setPage,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
        }}
        loading={loading}
        error={error}
        entityType="preset"
        onView={handleViewPreset}
        onEdit={handleEditPreset}
        onDelete={handleDeletePreset}
      />

      {/* Detail Modal */}
      <PresetDetailModal
        preset={selectedPreset}
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        onEdit={handleEditFromDetail}
      />

      {/* Edit Modal */}
      <PresetEditModal
        preset={selectedPreset}
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSave={handleSavePreset}
      />

      {/* Add Modal */}
      <PresetAddModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveNewPreset}
      />
    </div>
  );
}
