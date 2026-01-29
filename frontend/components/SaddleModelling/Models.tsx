"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination } from '@/hooks';
import { getModelTableColumns } from '@/utils/modelTableColumns';
import { PageHeader } from '@/components/shared/PageHeader';
import { fetchModels, updateModel, deleteModel, createModel, type Model } from '@/services/models';
import { ModelDetailModal } from '@/components/shared/ModelDetailModal';
import { ModelEditModal } from '@/components/shared/ModelEditModal';
import { ModelAddModal } from '@/components/shared/ModelAddModal';

export default function Models() {
  const [searchTerm, setSearchTerm] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Use our hooks for filters and pagination
  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems, setPage } = usePagination(30, 1); // Match backend default page size
  
  // Fetch models with filters
  const fetchModelsData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching models with filters:', filters);
      const data = await fetchModels({
        page: pagination.currentPage,
        searchTerm,
        filters,
        orderBy: 'sequence',
        order: 'asc'
      });
      
      setModels(data['hydra:member'] || []);
      setTotalItems(data['hydra:totalItems'] || 0);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch models');
      setModels([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, searchTerm, filters, setTotalItems]);

  // Fetch models when dependencies change
  useEffect(() => {
    fetchModelsData();
  }, [fetchModelsData]);
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
    setPage(1); // Reset to page 1 when filters change
  };
  
  // Handle view model details
  const handleViewModel = (model: Model) => {
    setSelectedModel(model);
    setShowDetailModal(true);
  };

  // Handle edit model
  const handleEditModel = (model: Model) => {
    setSelectedModel(model);
    setShowEditModal(true);
  };

  // Handle delete model
  const handleDeleteModel = async (model: Model) => {
    if (window.confirm(`Are you sure you want to delete model "${model.name}"?`)) {
      try {
        await deleteModel(model.id);
        // Refresh the model list
        fetchModelsData();
      } catch (error) {
        console.error('Error deleting model:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete model');
      }
    }
  };

  // Handle save model (for edit modal)
  const handleSaveModel = async (updatedModel: Partial<Model>) => {
    if (!selectedModel) return;

    try {
      await updateModel(selectedModel.id, updatedModel);
      // Refresh the model list
      fetchModelsData();
      setShowEditModal(false);
      setSelectedModel(null);
    } catch (error) {
      console.error('Error updating model:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  // Handle add model
  const handleAddModel = () => {
    setShowAddModal(true);
  };

  // Handle save new model (for add modal)
  const handleSaveNewModel = async (newModel: Partial<Model>) => {
    try {
      await createModel(newModel);
      // Refresh the model list
      fetchModelsData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating model:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowAddModal(false);
    setSelectedModel(null);
  };

  // Handle edit from detail modal
  const handleEditFromDetail = () => {
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Saddles"
        description="Manage your saddle models"
        actions={
          <Button onClick={handleAddModel} className="bg-[#7b2326] hover:bg-[#8b2329] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Saddle
          </Button>
        }
      />


      <EntityTable
        entities={models}
        columns={getModelTableColumns(filters, handleFilterChange)}
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
        entityType="saddle"
        onView={handleViewModel}
        onEdit={handleEditModel}
        onDelete={handleDeleteModel}
      />

      {/* Model Detail Modal */}
      <ModelDetailModal
        model={selectedModel}
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        onEdit={handleEditFromDetail}
      />

      {/* Model Edit Modal */}
      <ModelEditModal
        model={selectedModel}
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSave={handleSaveModel}
      />

      {/* Model Add Modal */}
      <ModelAddModal
        isOpen={showAddModal}
        onClose={handleCloseModals}
        onSave={handleSaveNewModel}
      />
    </div>
  );
}
