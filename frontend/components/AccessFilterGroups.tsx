"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EntityTable } from '@/components/shared/EntityTable';
import { useTableFilters, usePagination, useEntityData } from '@/hooks';
import { getAccessFilterGroupTableColumns } from '@/utils/accessFilterGroupsTableColumns';
import { PageHeader } from '@/components/shared/PageHeader';
import { createAccessFilterGroup, updateAccessFilterGroup, deleteAccessFilterGroup, type AccessFilterGroup } from '@/services/access-filter-groups';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export default function AccessFilterGroups() {
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedAccessFilterGroup, setSelectedAccessFilterGroup] = useState<AccessFilterGroup | null>(null);

  // Use our hooks for filters and pagination
  const { filters, updateFilter } = useTableFilters<Record<string, string>>({});
  const { pagination, setTotalItems } = usePagination(10, 1);

  // Use our data fetching hook with optimistic updates
  const {
    data: accessFilterGroups = [],
    loading,
    error,
    refetch,
    updateEntityOptimistically,
    removeEntityOptimistically
  } = useEntityData<AccessFilterGroup>({
    entity: 'access_filter_groups',
    page: pagination.currentPage,
    orderBy: 'name',
    autoFetch: true
  });

  // Update total items when data changes
  useEffect(() => {
    if (accessFilterGroups) {
      setTotalItems(accessFilterGroups.length);
    }
  }, [accessFilterGroups, setTotalItems]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value);
  };

  // Handle view access filter group details
  const handleViewAccessFilterGroup = (accessFilterGroup: AccessFilterGroup) => {
    // Placeholder - view functionality to be implemented
    logger.log('View access filter group:', accessFilterGroup);
  };

  // Handle edit access filter group
  const handleEditAccessFilterGroup = (accessFilterGroup: AccessFilterGroup) => {
    // Placeholder - edit functionality to be implemented
    logger.log('Edit access filter group:', accessFilterGroup);
  };

  // Handle add new access filter group
  const handleAddAccessFilterGroup = () => {
    // Placeholder - add functionality to be implemented
    logger.log('Add new access filter group');
  };

  // Handle delete access filter group
  const handleDeleteAccessFilterGroup = async (accessFilterGroup: AccessFilterGroup) => {
    if (window.confirm(`Are you sure you want to delete access filter group "${accessFilterGroup.name}"?`)) {
      // Apply optimistic removal immediately
      removeEntityOptimistically(accessFilterGroup.id);

      try {
        await deleteAccessFilterGroup(accessFilterGroup.id);

        // Show success toast
        toast.success(`Access filter group "${accessFilterGroup.name}" deleted successfully`);

        // Force a fresh fetch to ensure data consistency
        setTimeout(() => {
          refetch(true);
        }, 100);

      } catch (error) {
        logger.error('Error deleting access filter group:', error);

        // Show error toast
        toast.error(`Failed to delete access filter group: ${error instanceof Error ? error.message : 'Unknown error'}`);

        // Revert optimistic update on error by refetching
        refetch(true);
      }
    }
  };


  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Access Filter Groups"
        description="Manage access filter groups"
        actions={
          <Button onClick={handleAddAccessFilterGroup} className="bg-[#7b2326] hover:bg-[#8b2329] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Access Filter Group
          </Button>
        }
      />

      <EntityTable
        entities={accessFilterGroups}
        columns={getAccessFilterGroupTableColumns(filters, handleFilterChange)}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        headerFilters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination}
        loading={loading}
        error={error}
        entityType="access-filter-group"
        onView={handleViewAccessFilterGroup}
        onEdit={handleEditAccessFilterGroup}
        onDelete={handleDeleteAccessFilterGroup}
      />
    </div>
  );
}