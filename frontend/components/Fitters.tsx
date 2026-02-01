"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination, useEntityData } from '@/hooks';
import { getFitterTableColumns } from '@/utils/fitterTableColumns';
import { PageHeader } from '@/components/shared/PageHeader';
import { updateFitter, deleteFitter, type Fitter } from '@/services/fitters';
import { FitterDetailModal } from '@/components/shared/FitterDetailModal';
import { FitterEditModal } from '@/components/shared/FitterEditModal';
import { logger } from '@/utils/logger';

export default function Fitters() {
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedFitter, setSelectedFitter] = useState<Fitter | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionError, setActionError] = useState('');

  // Use our hooks for filters and pagination
  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems, setPage } = usePagination(30, 1);

  // Use our data fetching hook
  const {
    data: fitters = [],
    loading,
    error,
    totalItems,
    refetch
  } = useEntityData<Fitter>({
    entity: 'fitters',
    page: pagination.currentPage,
    orderBy: 'name',
    extraParams: {
      searchTerm,
      ...filters
    },
    autoFetch: true
  });

  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
    setPage(1); // Reset to page 1 when filters change
  };
  
  // Handle view fitter details
  const handleViewFitter = (fitter: Fitter) => {
    setSelectedFitter(fitter);
    setShowDetailModal(true);
  };

  // Handle edit fitter
  const handleEditFitter = (fitter: Fitter) => {
    setSelectedFitter(fitter);
    setShowEditModal(true);
  };

  // Handle delete fitter
  const handleDeleteFitter = async (fitter: Fitter) => {
    if (window.confirm(`Are you sure you want to delete fitter "${fitter.username}"?`)) {
      try {
        await deleteFitter(fitter.id);
        // Refresh the fitter list
        refetch();
      } catch (error) {
        logger.error('Error deleting fitter:', error);
        setActionError(error instanceof Error ? error.message : 'Failed to delete fitter');
      }
    }
  };

  // Handle save fitter (for edit modal)
  const handleSaveFitter = async (updatedFitter: Partial<Fitter>) => {
    if (!selectedFitter) return;

    try {
      await updateFitter(selectedFitter.id, updatedFitter);
      // Refresh the fitter list
      refetch();
      setShowEditModal(false);
      setSelectedFitter(null);
    } catch (error) {
      logger.error('Error updating fitter:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setSelectedFitter(null);
  };

  // Handle edit from detail modal
  const handleEditFromDetail = () => {
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader 
        title="Fitters" 
        description="Manage your fitters" 
        actions={
          <button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Fitter
          </button>
        } 
      />


      <EntityTable
        entities={fitters}
        columns={getFitterTableColumns(filters, handleFilterChange)}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        headerFilters={filters}
        onFilterChange={handleFilterChange}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: Math.max(1, Math.ceil(totalItems / pagination.itemsPerPage)),
          onPageChange: setPage,
          totalItems: totalItems,
          itemsPerPage: pagination.itemsPerPage,
        }}
        loading={loading}
        error={error}
        entityType="fitter"
        onView={handleViewFitter}
        onEdit={handleEditFitter}
        onDelete={handleDeleteFitter}
      />

      {/* Fitter Detail Modal */}
      <FitterDetailModal
        fitter={selectedFitter}
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        onEdit={handleEditFromDetail}
      />

      {/* Fitter Edit Modal */}
      <FitterEditModal
        fitter={selectedFitter}
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSave={handleSaveFitter}
      />
    </div>
  );
}