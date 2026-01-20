"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination, useEntityData } from '@/hooks';
import { getWarehouseTableColumnsFiltered } from '@/utils/warehouseTableColumns';
import { PageHeader } from '@/components/shared/PageHeader';
import { Warehouse, deleteWarehouse } from '@/services/warehouses';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';

export default function Warehouses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const { role } = useUserRole();
  
  // Use our hooks for filters and pagination
  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems } = usePagination(30, 1);
  
  // Use our data fetching hook
  const { 
    data: warehouses = [], 
    loading, 
    error,
    refetch 
  } = useEntityData<Warehouse>({
    entity: 'warehouses',
    page: pagination.currentPage,
    orderBy: 'username',
    autoFetch: true
  });

  // Update total items when data changes
  useEffect(() => {
    if (warehouses) {
      setTotalItems(warehouses.length);
    }
  }, [warehouses, setTotalItems]);
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
  };
  
  // Handle view warehouse details
  const handleViewWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDetailsOpen(true);
  };
  
  // Handle edit warehouse
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsEditOpen(true);
  };
  
  // Handle delete warehouse
  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteOpen(true);
  };
  
  // Confirm delete warehouse
  const confirmDeleteWarehouse = async () => {
    if (!selectedWarehouse) return;
    
    try {
      await deleteWarehouse(selectedWarehouse.id);
      refetch();
      setIsDeleteOpen(false);
      setSelectedWarehouse(null);
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
      // TODO: Show error notification
    }
  };
  
  // Handle create new warehouse
  const handleCreateWarehouse = () => {
    setSelectedWarehouse(null);
    setIsEditOpen(true);
  };

  // Check permissions
  const canEdit = hasScreenPermission(role, 'WAREHOUSE_EDIT');
  const canDelete = hasScreenPermission(role, 'WAREHOUSE_DELETE');
  const canCreate = hasScreenPermission(role, 'WAREHOUSE_CREATE');

  // Get table columns with filters (EntityTable handles actions separately)
  const columns = getWarehouseTableColumnsFiltered(filters, updateFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage and track all warehouses"
        actions={
          canCreate ? (
            <Button onClick={handleCreateWarehouse} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Warehouse
            </Button>
          ) : undefined
        }
      />

      <div className="bg-white rounded-lg border">
        <EntityTable
          entities={warehouses}
          columns={columns}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          headerFilters={filters}
          onFilterChange={handleFilterChange}
          pagination={pagination}
          entityType="warehouse"
          onView={handleViewWarehouse}
          onEdit={canEdit ? handleEditWarehouse : undefined}
          onDelete={canDelete ? handleDeleteWarehouse : undefined}
        />
      </div>

      {/* Warehouse Details Modal */}
      {isDetailsOpen && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Warehouse Details</h3>
            <div className="space-y-3">
              <div>
                <label className="font-medium text-gray-700">Username:</label>
                <p className="text-gray-900">{selectedWarehouse.username}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Name:</label>
                <p className="text-gray-900">{selectedWarehouse.name || '-'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Location:</label>
                <p className="text-gray-900">{selectedWarehouse.location || '-'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Status:</label>
                <p className="text-gray-900">{selectedWarehouse.status || '-'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Enabled:</label>
                <p className="text-gray-900">{selectedWarehouse.enabled ? 'Yes' : 'No'}</p>
              </div>
              {selectedWarehouse.createdAt && (
                <div>
                  <label className="font-medium text-gray-700">Created:</label>
                  <p className="text-gray-900">{new Date(selectedWarehouse.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Warehouse</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete warehouse "{selectedWarehouse.name || selectedWarehouse.username}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteWarehouse}
              >
                Delete Warehouse
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}