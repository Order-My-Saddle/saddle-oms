"use client";

import React, { useState, useEffect } from 'react';
import { Order } from '@/types/Order';
import { OrdersTable } from '@/components/shared/OrdersTable';
import { TableHeaderFilter } from '@/components/TableHeaderFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Eye, AlertTriangle } from 'lucide-react';
// Simple date formatting function
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
import { getFitterName, getCustomerName, getSupplierName, getSeatSize, getStatus, getUrgent, getDate } from '../utils/orderHydration';
import { getOrderTableColumns } from '../utils/orderTableColumns';
import { seatSizes, statuses, orderStatuses } from '../utils/orderConstants';
import { logger } from '@/utils/logger';
import { getEnrichedOrders, searchByOrderId } from '../services/enrichedOrders';
import { useFitters } from '../hooks/useEntities';
import { extractDynamicFactories, extractDynamicSeatSizes } from '../utils/orderProcessing';

export default function Reports() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [headerFilters, setHeaderFilters] = useState<Record<string, string>>({});
  
  // Extract unique factory names from orders for filter dropdown
  const suppliers = React.useMemo(() => {
    return extractDynamicFactories(orders);
  }, [orders]);
  
  // Fetch fitters for dropdown
  const { data: fittersData } = useFitters({ partial: true });
  const fittersList = fittersData.map((fitter: any) => ({
    label: fitter.name || fitter.username || 'Unknown Fitter',
    value: fitter.name || fitter.username || fitter.id
  }));
  
  // Extract unique saddle names (brand + model) from orders
  const modelsList = React.useMemo(() => {
    const saddles = new Set<string>();
    orders.forEach(order => {
      const brand = order.brand_name || order.brandName || '';
      const model = order.model_name || order.modelName || '';
      const saddleName = [brand, model].filter(Boolean).join(' - ');
      if (saddleName.trim()) {
        saddles.add(saddleName.trim());
      }
    });
    return Array.from(saddles).sort().map(name => ({ label: name, value: name }));
  }, [orders]);

  // Extract unique customer countries from orders
  const dynamicCountries = React.useMemo(() => {
    const countriesSet = new Set<string>();
    orders.forEach(order => {
      const country = order.customer_country || order.customerCountry;
      if (country && typeof country === 'string' && country.trim()) {
        countriesSet.add(country.trim());
      }
    });
    return Array.from(countriesSet).sort();
  }, [orders]);

  useEffect(() => {
    setLoading(true);
    // Build filters for API Platform
    const filters: Record<string, any> = {};
    Object.keys(headerFilters).forEach(key => {
      if (headerFilters[key] && headerFilters[key] !== '') {
        // Map frontend filter keys to API keys if needed
        if (key === 'orderId') {
          filters.orderId = headerFilters[key];
        } else if (key === 'reference') {
          filters.reference = headerFilters[key];
        } else if (key === 'customer') {
          filters.customerName = headerFilters[key];
        } else if (key === 'status') {
          filters.orderStatus = headerFilters[key];
        } else if (key === 'fitter') {
          filters.fitterName = headerFilters[key];
        } else if (key === 'supplier') {
          filters.supplierName = headerFilters[key];
        } else if (key === 'urgent') {
          // Convert string boolean to actual boolean for API Platform BooleanFilter
          if (headerFilters[key] === 'true') {
            filters.urgent = true;
          } else if (headerFilters[key] === 'false') {
            filters.urgent = false;
          }
        } else if (key === 'seatSize') {
          filters.seatSizes = headerFilters[key];
        } else if (key === 'customerCountry') {
          filters.customerCountry = headerFilters[key];
        }
      }
    });

    getEnrichedOrders({ 
      page, 
      partial: true,
      filters
    })
      .then(data => {
        let memberArr: any[] = [];
        if (data['hydra:member']) {
          memberArr = data['hydra:member'];
        } else if (Array.isArray(data)) {
          memberArr = data;
        }
        setOrders(memberArr);
        setTotalPages(data['hydra:view']?.['hydra:last'] ? parseInt(new URL(data['hydra:view']['hydra:last'], 'http://dummy').searchParams.get('page') || '1') : 1);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load orders from API');
        setLoading(false);
      });
  }, [page, headerFilters]);

  const [groupBySaddle, setGroupBySaddle] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({
    orderId: '',
    reference: '',
    seatSize: '',
    customer: '',
    orderStatus: '',
    urgent: '',
    fitter: '',
    supplier: '',
  });
  const [selectedFitter, setSelectedFitter] = useState('all-fitters');
  const [selectedStatus, setSelectedStatus] = useState('all-statuses');
  const [selectedSaleType, setSelectedSaleType] = useState('all-types');
  const [selectedCustomer, setSelectedCustomer] = useState('all-customers');
  const [selectedFactory, setSelectedFactory] = useState('all-factories');
  const [selectedSaddle, setSelectedSaddle] = useState('all-saddles');
  const [selectedCustomerCountry, setSelectedCustomerCountry] = useState('all-customer-countries');
  const [selectedFitterCountry, setSelectedFitterCountry] = useState('all-fitter-countries');
  const [selectedSeatSize, setSelectedSeatSize] = useState('all-sizes');
  const [selectedUrgent, setSelectedUrgent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingOrderData, setIsLoadingOrderData] = useState(false);
  const [orderDataError, setOrderDataError] = useState<string | null>(null);

  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [orderedDate, setOrderedDate] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [paymentDate, setPaymentDate] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

  // Extract unique seat sizes from orders (handles both snake_case and camelCase)
  const dynamicSeatSizes = React.useMemo(() => {
    return extractDynamicSeatSizes(orders);
  }, [orders]);

  const columns = getOrderTableColumns(
    headerFilters,
    (key, value) => {
      setHeaderFilters(prev => ({ ...prev, [key]: value }));
      setPage(1); // Reset to page 1 when filters change
    },
    suppliers,
    dynamicSeatSizes
  );

  const fetchCompleteOrderData = async (order: any): Promise<any> => {
    setIsLoadingOrderData(true);
    setOrderDataError(null);

    try {
      const orderId = order.orderId || order.id;
      logger.log('Fetching complete order data for:', orderId);

      let result;

      // Fetch by order ID (now all IDs are integers)
      if (orderId) {
        try {
          result = await searchByOrderId(orderId);
          if (result['hydra:member'] && result['hydra:member'].length > 0) {
            logger.log('Successfully fetched order by ID:', orderId);
            return result['hydra:member'][0];
          }
        } catch (error) {
          logger.warn('Failed to fetch by Order ID:', error);
        }
      }

      // If fetch fails, throw an error
      throw new Error(`Order not found with ID: ${orderId}`);

    } catch (error) {
      logger.error('Error fetching complete order data:', error);
      setOrderDataError(error instanceof Error ? error.message : 'Failed to load order data');

      // Return the original order data as fallback
      logger.log('Falling back to table row data');
      return order;
    } finally {
      setIsLoadingOrderData(false);
    }
  };

  // Data normaliseren net als in Dashboard/Orders
  const processedOrders = (orders || []).map((order: any) => ({
    ...order,
    id: order.id || order.orderId || '',
    orderId: order.orderId || order.id || '',
    reference: order.reference || '',
    seatSize: getSeatSize(order),
    seatSizes: order.seatSizes || [],
    name: order.name || '',
    orderStatus: order.orderStatus || '',
    orderTime: order.orderTime || order.createdAt || '',
    createdAt: order.createdAt || '',
    status: order.orderStatus || '',
    urgent: order.urgent === true || order.urgency === 1 || order.urgency === true || false,
    isUrgent: order.urgent === true || order.urgency === 1 || order.urgency === true || false,
    customer: getCustomerName(order) || '',
    fitter: getFitterName(order) || '',
    supplier: getSupplierName(order) || ''
  }));

  // Filteren op genormaliseerde data
  const filteredOrders = processedOrders.filter(order => {
    const matchesOrderId = !headerFilters.orderId || (order.orderId || '').toLowerCase().includes(headerFilters.orderId.toLowerCase());
    const matchesReference = !headerFilters.reference || (order.reference || '').toLowerCase().includes(headerFilters.reference.toLowerCase());
    const matchesSeatSize = !headerFilters.seatSize || getSeatSize(order) === headerFilters.seatSize;
    const matchesOrderStatus = !headerFilters.orderStatus || getStatus(order) === headerFilters.orderStatus;
    const matchesFitter = !headerFilters.fitter || getFitterName(order).toLowerCase().includes(headerFilters.fitter.toLowerCase());
    const matchesUrgent = !headerFilters.urgent || ((orderUrgent => {
      const val = getUrgent(orderUrgent);
      if (val === null || val === undefined || val === '') return 'false';
      if (val === true || val === 'true' || val === 'Yes') return 'true';
      if (val === false || val === 'false' || val === 'No') return 'false';
      return String(val);
    })(order) === headerFilters.urgent);
    const matchesCustomer = !headerFilters.customer || getCustomerName(order).toLowerCase().includes(headerFilters.customer.toLowerCase());
    const matchesSupplier = !headerFilters.supplier || (order.supplier || '').toLowerCase().includes(headerFilters.supplier.toLowerCase());
    const matchesSaddle = !headerFilters.saddle || (order.modelName || order.model || '').toLowerCase().includes(headerFilters.saddle.toLowerCase());
    const matchesCustomerCountry = !headerFilters.customerCountry || (order.customerCountry || order.customer_country || order.customer?.country || '').toLowerCase().includes(headerFilters.customerCountry.toLowerCase());

    let matchesDate = true;
    if (date.from || date.to) {
      const orderDate = new Date(getDate(order));
      if (date.from && orderDate < date.from) matchesDate = false;
      if (date.to && orderDate > date.to) matchesDate = false;
    }

    return (
      matchesOrderId &&
      matchesReference &&
      matchesSeatSize &&
      matchesOrderStatus &&
      matchesFitter &&
      matchesUrgent &&
      matchesCustomer &&
      matchesSupplier &&
      matchesSaddle &&
      matchesCustomerCountry &&
      matchesDate
    );
  });

  // Tijdelijke log om te debuggen
  useEffect(() => {
    logger.log('API orders:', orders);
    logger.log('Processed orders:', processedOrders);
    logger.log('Filtered orders:', filteredOrders);
    logger.log('Header filters:', headerFilters);
    logger.log('Date filter:', date);
    logger.log('Ordered date filter:', orderedDate);
    logger.log('Payment date filter:', paymentDate);
  }, [orders, processedOrders, filteredOrders, headerFilters, date, orderedDate, paymentDate]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Order Reports</h2>

      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32">Ordered from</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {orderedDate.from ? formatDate(orderedDate.from) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderedDate.from}
                    onSelect={(date) => setOrderedDate(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span>to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {orderedDate.to ? formatDate(orderedDate.to) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderedDate.to}
                    onSelect={(date) => setOrderedDate(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Date from</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date.from ? formatDate(date.from) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date.from}
                    onSelect={(selectedDate) => setDate(prev => ({ ...prev, from: selectedDate }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span>to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date.to ? formatDate(date.to) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date.to}
                    onSelect={(selectedDate) => setDate(prev => ({ ...prev, to: selectedDate }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Payment from</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate.from ? formatDate(paymentDate.from) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentDate.from}
                    onSelect={(selectedDate) => setPaymentDate(prev => ({ ...prev, from: selectedDate }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span>to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate.to ? formatDate(paymentDate.to) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentDate.to}
                    onSelect={(selectedDate) => setPaymentDate(prev => ({ ...prev, to: selectedDate }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Fitters</label>
              <Select value={selectedFitter} onValueChange={(value) => {
                setSelectedFitter(value);
                setHeaderFilters(prev => ({
                  ...prev,
                  fitter: value === 'all-fitters' ? '' : value
                }));
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-fitters">All Fitters</SelectItem>
                  {fittersList.map(fitter => (
                    <SelectItem key={fitter.value} value={fitter.label}>{fitter.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Order statuses</label>
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value);
                setHeaderFilters(prev => ({
                  ...prev,
                  status: value === 'all-statuses' ? '' : value
                }));
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  {orderStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Saletypes</label>
              <Select value={selectedSaleType} onValueChange={setSelectedSaleType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Customers</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customers">All Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32">Factories</label>
              <Select value={selectedFactory} onValueChange={(value) => {
                setSelectedFactory(value);
                setHeaderFilters(prev => ({
                  ...prev,
                  supplier: value === 'all-factories' ? '' : value
                }));
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-factories">All Factories</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.value} value={supplier.label}>{supplier.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Saddles</label>
              <Select value={selectedSaddle} onValueChange={(value) => {
                setSelectedSaddle(value);
                setHeaderFilters(prev => ({
                  ...prev,
                  saddle: value === 'all-saddles' ? '' : value
                }));
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-saddles">All Saddles</SelectItem>
                  {modelsList.map(model => (
                    <SelectItem key={model.value} value={model.label}>{model.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Customer Countries</label>
              <Select value={selectedCustomerCountry} onValueChange={(value) => {
                setSelectedCustomerCountry(value);
                setHeaderFilters(prev => ({
                  ...prev,
                  customerCountry: value === 'all-customer-countries' ? '' : value
                }));
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customer-countries">All Countries</SelectItem>
                  {dynamicCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Fitter Countries</label>
              <Select value={selectedFitterCountry} onValueChange={setSelectedFitterCountry}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-fitter-countries">All Countries</SelectItem>
                  {dynamicCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Seatsizes</label>
              <Select value={selectedSeatSize} onValueChange={(value) => {
                setSelectedSeatSize(value);
                setHeaderFilters(prev => ({
                  ...prev,
                  seatSize: value === 'all-sizes' ? '' : value
                }));
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-sizes">All Sizes</SelectItem>
                  {dynamicSeatSizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">Urgent</label>
              <Select value={selectedUrgent} onValueChange={(value) => {
                setSelectedUrgent(value);
                setHeaderFilters(prev => ({
                  ...prev,
                  urgent: value === 'all' ? '' : value === 'urgent' ? 'true' : 'false'
                }));
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Please select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="not-urgent">Not Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-8">
              <label className="w-32"></label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="groupBySaddle"
                  checked={groupBySaddle}
                  onCheckedChange={(checked) => setGroupBySaddle(checked as boolean)}
                />
                <label htmlFor="groupBySaddle">Group by saddle</label>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <Button variant="destructive" className="bg-[#8B0000]">
                Generate report
              </Button>
              <Button variant="destructive" className="bg-[#8B0000]">
                Export report
              </Button>
              
              {/* Reset All Filters Button */}
              {(Object.keys(headerFilters).some(key => headerFilters[key]) || 
                selectedFitter !== 'all-fitters' || 
                selectedStatus !== 'all-statuses' || 
                selectedFactory !== 'all-factories' || 
                selectedSeatSize !== 'all-sizes' || 
                selectedUrgent !== 'all' ||
                date.from || date.to) && (
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    logger.log('Resetting all Reports filters');
                    // Reset header filters
                    setHeaderFilters({});
                    // Reset dropdown states
                    setSelectedFitter('all-fitters');
                    setSelectedStatus('all-statuses');
                    setSelectedSaleType('all-types');
                    setSelectedCustomer('all-customers');
                    setSelectedFactory('all-factories');
                    setSelectedSaddle('all-saddles');
                    setSelectedCustomerCountry('all-customer-countries');
                    setSelectedFitterCountry('all-fitter-countries');
                    setSelectedSeatSize('all-sizes');
                    setSelectedUrgent('all');
                    // Reset dates
                    setDate({ from: undefined, to: undefined });
                    // Reset pagination
                    setPage(1);
                    setSearchTerm('');
                  }}
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="border rounded-lg">
          <OrdersTable
            orders={filteredOrders}
            columns={columns}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            headerFilters={headerFilters}
            onFilterChange={(key: string, value: string) => setHeaderFilters(prev => ({ ...prev, [key]: value }))}
            onViewOrder={(order) => logger.log('View order:', order)}
            onEditOrder={async (order) => {
              logger.log('Edit order:', order);
              try {
                // Fetch complete order data from API
                const completeOrderData = await fetchCompleteOrderData(order);
                logger.log('Complete order data fetched for Reports:', completeOrderData);
                // For now, just log the data. In a real implementation, 
                // you'd open an EditOrder modal here similar to Dashboard/Orders
              } catch (error) {
                logger.error('Failed to fetch order data for editing:', error);
              }
            }}
            onApproveOrder={(order) => logger.log('Approve order:', order)}
            onDeleteOrder={(order) => logger.log('Delete order:', order)}
            seatSizes={seatSizes}
            statuses={statuses}
            fitters={fittersList}
            dateFrom={date.from}
            setDateFrom={from => setDate(d => ({ ...d, from }))}
            dateTo={date.to}
            setDateTo={to => setDate(d => ({ ...d, to }))}
            loading={loading}
            error={error}
            pagination={{
              currentPage: page,
              totalPages: totalPages,
              onPageChange: setPage,
              totalItems: filteredOrders.length,
              itemsPerPage: 10,
            }}
          />
        </div>
      )}
    </div>
  );
}

// TODO: Replace static import with API fetch when backend is ready