"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dataDir = path.join(__dirname, '../data');
const ORDERS_FILE = path.join(dataDir, 'ordersData.json');
const CUSTOMERS_FILE = path.join(dataDir, 'customersData.json');
const FITTERS_FILE = path.join(dataDir, 'fittersData.json');
const SUPPLIERS_FILE = path.join(dataDir, 'suppliersData.json');
function extractIdFromRef(ref, type) {
    const match = ref.match(new RegExp(`/${type}/([\\w-]+)$`));
    return match ? match[1] : ref;
}
function collectReferencedIds(orders) {
    const customerIds = new Set();
    const fitterIds = new Set();
    const supplierIds = new Set();
    function addFitterRefs(fitter) {
        if (!fitter)
            return;
        if (typeof fitter === 'object') {
            if (fitter.id)
                fitterIds.add(fitter.id);
            if (fitter['@id'])
                fitterIds.add(extractIdFromRef(fitter['@id'], 'fitters'));
            if (fitter['$ref'])
                fitterIds.add(extractIdFromRef(fitter['$ref'], 'fitters'));
        }
        else if (typeof fitter === 'string') {
            fitterIds.add(extractIdFromRef(fitter, 'fitters'));
        }
    }
    function addCustomerRefs(customer) {
        if (!customer)
            return;
        if (typeof customer === 'object') {
            if (customer.id)
                customerIds.add(customer.id);
            if (customer['@id'])
                customerIds.add(extractIdFromRef(customer['@id'], 'customers'));
            if (customer['$ref'])
                customerIds.add(extractIdFromRef(customer['$ref'], 'customers'));
        }
        else if (typeof customer === 'string') {
            customerIds.add(extractIdFromRef(customer, 'customers'));
        }
    }
    function addSupplierRefs(supplier) {
        if (!supplier)
            return;
        if (typeof supplier === 'object') {
            if (supplier.id)
                supplierIds.add(supplier.id);
            if (supplier['@id'])
                supplierIds.add(extractIdFromRef(supplier['@id'], 'suppliers'));
            if (supplier['$ref'])
                supplierIds.add(extractIdFromRef(supplier['$ref'], 'suppliers'));
        }
        else if (typeof supplier === 'string') {
            supplierIds.add(extractIdFromRef(supplier, 'suppliers'));
        }
    }
    for (const order of orders) {
        addCustomerRefs(order.customer);
        addFitterRefs(order.fitter);
        addSupplierRefs(order.supplier);
    }
    return { customerIds, fitterIds, supplierIds };
}
function loadEntities(file) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const member = raw['hydra:member'] || [];
    return { hydra: { member }, raw };
}
function saveEntities(file, entities, raw) {
    raw['hydra:member'] = entities;
    fs.writeFileSync(file, JSON.stringify(raw, null, 2));
}
function createCustomer(id) {
    return {
        '@id': `/customers/${id}`,
        '@type': 'Customer',
        id,
        name: `Generated Customer ${id}`,
        email: null,
        deletedAt: null,
        createdAt: null,
        updatedAt: null,
        address: null,
        city: null,
        zipcode: '',
        state: null,
        cellNo: '',
        phoneNo: '',
        country: null,
        typeName: 'Customer',
        createdBy: null,
        updatedBy: null,
        type: 'Customer',
        deleted: false
    };
}
function createFitter(id) {
    return {
        '@id': `/fitters/${id}`,
        '@type': 'Fitter',
        id,
        name: `Generated Fitter ${id}`,
        username: '',
        enabled: true,
        deletedAt: null,
        createdAt: null,
        updatedAt: null,
        email: '',
        address: '',
        city: '',
        zipcode: '',
        state: null,
        cellNo: '',
        phoneNo: '',
        country: null,
        currency: '',
        typeName: 'Fitter',
        createdBy: null,
        updatedBy: null,
        type: 'Fitter',
        deleted: false
    };
}
function createSupplier(id) {
    return {
        '@id': `/suppliers/${id}`,
        '@type': 'Supplier',
        id,
        name: `Generated Supplier ${id}`,
        username: '',
        enabled: true,
        deletedAt: null,
        createdAt: null,
        updatedAt: null,
        email: '',
        address: '',
        city: '',
        zipcode: '',
        state: null,
        cellNo: '',
        phoneNo: '',
        country: null,
        currency: '',
        typeName: 'Supplier',
        createdBy: null,
        updatedBy: null,
        type: 'Supplier',
        deleted: false
    };
}
function main() {
    const ordersRaw = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const orders = ordersRaw['hydra:member'] || [];
    const { customerIds, fitterIds, supplierIds } = collectReferencedIds(orders);
    // Customers
    const { hydra: customersHydra, raw: customersRaw } = loadEntities(CUSTOMERS_FILE);
    const existingCustomerIds = new Set(customersHydra.member.map((c) => c.id));
    // Fitters
    const { hydra: fittersHydra, raw: fittersRaw } = loadEntities(FITTERS_FILE);
    const existingFitterIds = new Set(fittersHydra.member.map((f) => f.id));
    // Write debug info to file
    fs.writeFileSync(path.join(__dirname, 'fitterIdDebug.json'), JSON.stringify({
        referencedFitterIds: Array.from(fitterIds),
        existingFitterIds: Array.from(existingFitterIds)
    }, null, 2));
    // Suppliers
    const { hydra: suppliersHydra, raw: suppliersRaw } = loadEntities(SUPPLIERS_FILE);
    const existingSupplierIds = new Set(suppliersHydra.member.map((s) => s.id));
    let addedCustomers = 0;
    for (const id of customerIds) {
        if (!existingCustomerIds.has(id)) {
            customersHydra.member.push(createCustomer(id));
            addedCustomers++;
        }
    }
    saveEntities(CUSTOMERS_FILE, customersHydra.member, customersRaw);
    console.log(`Added ${addedCustomers} customers.`);
    let addedFitters = 0;
    for (const id of fitterIds) {
        if (!existingFitterIds.has(id)) {
            fittersHydra.member.push(createFitter(id));
            addedFitters++;
        }
    }
    saveEntities(FITTERS_FILE, fittersHydra.member, fittersRaw);
    console.log(`Added ${addedFitters} fitters.`);
    let addedSuppliers = 0;
    for (const id of supplierIds) {
        if (!existingSupplierIds.has(id)) {
            suppliersHydra.member.push(createSupplier(id));
            addedSuppliers++;
        }
    }
    saveEntities(SUPPLIERS_FILE, suppliersHydra.member, suppliersRaw);
    console.log(`Added ${addedSuppliers} suppliers.`);
}
main();
