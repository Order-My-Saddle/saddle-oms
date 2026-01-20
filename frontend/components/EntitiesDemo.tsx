import React, { useState } from 'react';
import { useCustomers, useFitters, useUsers, useBrands } from '../hooks/useEntities';

export default function EntitiesDemo() {
  const [customerPage, setCustomerPage] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const { data: customers, loading: loadingCustomers, totalPages: customerTotalPages } = useCustomers({
    orderBy: 'name',
    page: customerPage,
    filter: customerSearch
      ? `substringof('${customerSearch}',email) eq true or substringof('${customerSearch}',name) eq true`
      : '',
    partial: false,
  });

  const { data: fitters, loading: loadingFitters } = useFitters({ orderBy: 'username', page: 1, partial: false });
  const { data: users, loading: loadingUsers } = useUsers({ page: 1, partial: false });
  const { data: brands, loading: loadingBrands } = useBrands({ orderBy: 'name', page: 1, partial: false });

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h2>Customers</h2>
      <input
        type="text"
        placeholder="Zoek op naam of email"
        value={customerSearch}
        onChange={e => {
          setCustomerSearch(e.target.value);
          setCustomerPage(1);
        }}
        style={{ marginBottom: 8, padding: 4, width: '100%' }}
      />
      {loadingCustomers ? (
        <div>Loading customers...</div>
      ) : (
        <>
          <ul>
            {customers.map((c: any) => (
              <li key={c.id}>{c.name} ({c.email})</li>
            ))}
          </ul>
          <div style={{ marginTop: 8 }}>
            Pagina: {customerPage} / {customerTotalPages}
            <button disabled={customerPage === 1} onClick={() => setCustomerPage(p => p - 1)} style={{ marginLeft: 8 }}>
              Vorige
            </button>
            <button disabled={customerPage === customerTotalPages} onClick={() => setCustomerPage(p => p + 1)} style={{ marginLeft: 8 }}>
              Volgende
            </button>
          </div>
        </>
      )}

      <h2 style={{ marginTop: 32 }}>Fitters</h2>
      {loadingFitters ? (
        <div>Loading fitters...</div>
      ) : (
        <ul>
          {fitters.map((f: any) => (
            <li key={f.id}>{f.username || f.name}</li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 32 }}>Users</h2>
      {loadingUsers ? (
        <div>Loading users...</div>
      ) : (
        <ul>
          {users.map((u: any) => (
            <li key={u.id}>{u.email || u.username}</li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 32 }}>Brands</h2>
      {loadingBrands ? (
        <div>Loading brands...</div>
      ) : (
        <ul>
          {brands.map((b: any) => (
            <li key={b.id}>{b.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
