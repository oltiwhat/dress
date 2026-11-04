'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatDateShort, formatPrice } from '@/lib/utils';

type AdminSection = 'products' | 'orders' | 'inventory' | 'customers' | 'settings' | 'order';

interface AdminSectionClientProps {
  section: AdminSection;
  records: any[];
  categories: { id: string; name: string }[];
  loadError?: string;
}

const titles: Record<AdminSection, string> = {
  products: 'Products',
  orders: 'Orders',
  inventory: 'Inventory',
  customers: 'Customers',
  settings: 'Store Settings',
  order: 'Order Details',
};

export function AdminSectionClient({ section, records, categories, loadError }: AdminSectionClientProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingValue, setNewSettingValue] = useState('');

  const performAction = async (payload: Record<string, unknown>) => {
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Action failed');
      setNotice('Changes saved.');
      router.refresh();
      return result;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action failed');
      return null;
    }
  };

  if (section === 'order') {
    const order = records[0];
    return (
      <div className="container py-8">
        <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-black">← All orders</Link>
        {!order ? <Unavailable message={loadError || 'Order not found.'} /> : (
          <div className="mt-6 max-w-4xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">{order.orderNumber}</p>
                <h1 className="font-serif text-3xl font-medium">Order details</h1>
                <p className="mt-2 text-gray-600">{order.firstName} {order.lastName} · {order.email} · {formatDateShort(order.createdAt)}</p>
              </div>
              <label className="flex items-center gap-3 text-sm">
                Status
                <select id="order-status" defaultValue={order.status} className="select w-auto border-gray-300">
                  {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map((status) => <option key={status}>{status}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  const select = document.getElementById('order-status') as HTMLSelectElement;
                  void performAction({ action: 'setOrderStatus', orderId: order.id, status: select.value });
                }}>Save</button>
              </label>
            </div>
            <Messages error={error} notice={notice} />
            <section className="mt-8 overflow-x-auto border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600"><tr><th className="p-4">Item</th><th className="p-4">Size / Color</th><th className="p-4">Qty</th><th className="p-4">Price</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item: any) => <tr key={item.id}><td className="p-4 font-medium">{item.product.name}</td><td className="p-4">{item.size} / {item.color}</td><td className="p-4">{item.quantity}</td><td className="p-4">{formatPrice(Number(item.price))}</td></tr>)}
                </tbody>
              </table>
              <div className="border-t border-gray-200 p-4 text-right font-medium">Total: {formatPrice(Number(order.total))}</div>
            </section>
            <section className="mt-6 border border-gray-200 bg-white p-5">
              <h2 className="font-medium">Ship to</h2>
              <p className="mt-2 text-sm text-gray-600">{order.address}<br />{order.city}, {order.postalCode}<br />{order.country}</p>
            </section>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium">{titles[section]}</h1>
          <p className="mt-1 text-gray-600">Manage your store {section === 'settings' ? 'configuration' : section}.</p>
        </div>
        {section === 'products' && <Link href="/admin/products/new" className="btn btn-primary">Add Product</Link>}
      </div>
      <Messages error={error || loadError || ''} notice={notice} />
      {loadError ? <Unavailable message={loadError} /> : (
        <section className="overflow-x-auto border border-gray-200 bg-white">
          {section === 'products' && <ProductsTable records={records} onAction={performAction} />}
          {section === 'orders' && <OrdersTable records={records} />}
          {section === 'inventory' && <InventoryTable records={records} onAction={performAction} />}
          {section === 'customers' && <CustomersTable records={records} />}
          {section === 'settings' && (
            <div className="divide-y divide-gray-200">
              <CategoryManager categories={categories} onCreate={performAction} />
              {records.map((setting) => <SettingRow key={setting.key} setting={setting} onSave={performAction} />)}
              <form className="grid gap-3 p-5 sm:grid-cols-[1fr_2fr_auto]" onSubmit={(event) => {
                event.preventDefault();
                void performAction({ action: 'saveSetting', key: newSettingKey, value: newSettingValue }).then((result) => {
                  if (result) { setNewSettingKey(''); setNewSettingValue(''); }
                });
              }}>
                <input className="input" placeholder="Setting key" value={newSettingKey} onChange={(event) => setNewSettingKey(event.target.value)} required />
                <input className="input" placeholder="Value" value={newSettingValue} onChange={(event) => setNewSettingValue(event.target.value)} required />
                <button className="btn btn-primary" type="submit">Add setting</button>
              </form>
            </div>
          )}
        </section>
      )}
      {section === 'products' && records.length === 0 && !loadError && <EmptyState text="No products have been added yet." />}
      {section === 'orders' && records.length === 0 && !loadError && <EmptyState text="No orders yet." />}
      {section === 'inventory' && records.length === 0 && !loadError && <EmptyState text="No inventory variants found." />}
      {section === 'customers' && records.length === 0 && !loadError && <EmptyState text="No customer accounts yet." />}
      {section === 'settings' && records.length === 0 && !loadError && <p className="sr-only">No saved settings.</p>}
      {section === 'products' && categories.length === 0 && !loadError && <p className="mt-3 text-sm text-amber-700">Create a category before adding products.</p>}
    </div>
  );
}

function ProductsTable({ records, onAction }: { records: any[]; onAction: (payload: Record<string, unknown>) => Promise<any> }) {
  return <table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">SKU</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y divide-gray-200">{records.map((product) => <tr key={product.id}><td className="p-4 font-medium">{product.name}</td><td className="p-4">{product.categoryName}</td><td className="p-4">{product.sku}</td><td className="p-4">{formatPrice(product.salePrice ?? product.basePrice)}</td><td className="p-4">{product.stock}</td><td className="p-4"><button onClick={() => void onAction({ action: 'setProductActive', productId: product.id, isActive: !product.isActive })} className="underline">{product.isActive ? 'Active · Deactivate' : 'Inactive · Activate'}</button></td></tr>)}</tbody></table>;
}

function OrdersTable({ records }: { records: any[] }) {
  return <table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Date</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Total</th></tr></thead><tbody className="divide-y divide-gray-200">{records.map((order) => <tr key={order.id}><td className="p-4"><Link className="font-medium underline" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td><td className="p-4">{order.firstName} {order.lastName}<span className="block text-xs text-gray-500">{order.email}</span></td><td className="p-4">{formatDateShort(order.createdAt)}</td><td className="p-4">{order.paymentStatus}</td><td className="p-4">{order.status}</td><td className="p-4">{formatPrice(order.total)}</td></tr>)}</tbody></table>;
}

function InventoryTable({ records, onAction }: { records: any[]; onAction: (payload: Record<string, unknown>) => Promise<any> }) {
  return <table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="p-4">Product</th><th className="p-4">Variant</th><th className="p-4">SKU</th><th className="p-4">Stock</th><th className="p-4">Update</th></tr></thead><tbody className="divide-y divide-gray-200">{records.map((variant) => <StockRow key={variant.id} variant={variant} onSave={onAction} />)}</tbody></table>;
}

function StockRow({ variant, onSave }: { variant: any; onSave: (payload: Record<string, unknown>) => Promise<any> }) {
  const [stock, setStock] = useState(String(variant.stock));
  return <tr><td className="p-4 font-medium">{variant.product.name}</td><td className="p-4">{variant.size} / {variant.color}</td><td className="p-4">{variant.sku}</td><td className="p-4"><input aria-label={`Stock for ${variant.product.name} ${variant.size} ${variant.color}`} className="input w-24" type="number" min="0" value={stock} onChange={(event) => setStock(event.target.value)} /></td><td className="p-4"><button className="btn btn-outline btn-sm" onClick={() => void onSave({ action: 'setStock', variantId: variant.id, stock: Number(stock) })}>Save stock</button></td></tr>;
}

function CustomersTable({ records }: { records: any[] }) {
  return <table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="p-4">Customer</th><th className="p-4">Email</th><th className="p-4">Orders</th><th className="p-4">Joined</th></tr></thead><tbody className="divide-y divide-gray-200">{records.map((customer) => <tr key={customer.id}><td className="p-4 font-medium">{customer.firstName || ''} {customer.lastName || ''}</td><td className="p-4">{customer.email}</td><td className="p-4">{customer.orderCount}</td><td className="p-4">{formatDateShort(customer.createdAt)}</td></tr>)}</tbody></table>;
}

function SettingRow({ setting, onSave }: { setting: any; onSave: (payload: Record<string, unknown>) => Promise<any> }) {
  const [value, setValue] = useState(setting.value);
  return <form className="grid gap-3 p-5 sm:grid-cols-[1fr_2fr_auto]" onSubmit={(event) => { event.preventDefault(); void onSave({ action: 'saveSetting', key: setting.key, value }); }}><label className="self-center text-sm font-medium" htmlFor={`setting-${setting.key}`}>{setting.key}</label><input id={`setting-${setting.key}`} className="input" value={value} onChange={(event) => setValue(event.target.value)} /><button className="btn btn-outline" type="submit">Save</button></form>;
}

function Messages({ error, notice }: { error: string; notice: string }) {
  return <>{error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p role="status" className="mb-4 border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</p>}</>;
}

function Unavailable({ message }: { message: string }) {
  return <div role="alert" className="mt-6 border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{message}</div>;
}

function EmptyState({ text }: { text: string }) {
  return <p className="border-x border-b border-gray-200 bg-white p-6 text-center text-sm text-gray-500">{text}</p>;
}

function CategoryManager({ categories, onCreate }: { categories: { id: string; name: string }[]; onCreate: (payload: Record<string, unknown>) => Promise<any> }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return (
    <section className="p-5">
      <h2 className="font-medium">Product Categories</h2>
      <p className="mt-1 text-sm text-gray-500">{categories.length ? categories.map((category) => category.name).join(', ') : 'No categories yet.'}</p>
      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]" onSubmit={async (event) => {
        event.preventDefault();
        const result = await onCreate({ action: 'createCategory', name, slug, description });
        if (result) { setName(''); setDescription(''); }
      }}>
        <input className="input" placeholder="Category name" value={name} onChange={(event) => setName(event.target.value)} required />
        <input className="input" placeholder="Description (optional)" value={description} onChange={(event) => setDescription(event.target.value)} />
        <button className="btn btn-primary" type="submit" disabled={!slug}>Add category</button>
      </form>
    </section>
  );
}