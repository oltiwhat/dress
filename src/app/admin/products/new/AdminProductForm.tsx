'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminProductForm({ categories, loadError }: { categories: { id: string; name: string }[]; loadError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(loadError || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [form, setForm] = useState({ name: '', slug: '', sku: '', categoryId: '', basePrice: '', salePrice: '', description: '', size: 'S', color: 'Black', variantSku: '', stock: '0' });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const createCategory = async () => {
    setError('');
    setIsCreatingCategory(true);
    const name = categoryName.trim();
    const slug = toSlug(name);

    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createCategory', name, slug }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create category');

      const category = { id: result.id as string, name };
      setCategoryOptions((current) => [...current, category]);
      update('categoryId', category.id);
      setCategoryName('');
      setShowCategoryForm(false);
    } catch (categoryError) {
      setError(categoryError instanceof Error ? categoryError.message : 'Unable to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createProduct',
          ...form,
          basePrice: Number(form.basePrice),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          stock: Number(form.stock),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create product');
      router.push('/admin/products');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Link href="/admin/products" className="text-sm text-gray-600 hover:text-black">← Products</Link>
      <div className="mb-7 mt-5">
        <h1 className="font-serif text-3xl font-medium">Add Product</h1>
        <p className="mt-1 text-gray-600">Create a catalog item with its first size and color variant.</p>
      </div>
      {error && <p role="alert" className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!categoryOptions.length && !loadError && <p role="status" className="mb-5 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Create a category from the Category field before saving this product.</p>}
      <form onSubmit={handleSubmit} className="space-y-7 border border-gray-200 bg-white p-6">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 font-medium">Product details</legend>
          <Field label="Name"><input className="input" required value={form.name} onChange={(event) => { const name = event.target.value; update('name', name); if (!form.slug) update('slug', toSlug(name)); }} /></Field>
          <Field label="URL slug"><input className="input" required value={form.slug} onChange={(event) => update('slug', toSlug(event.target.value))} /></Field>
          <Field label="Product SKU"><input className="input" required value={form.sku} onChange={(event) => update('sku', event.target.value)} /></Field>
          <div>
            <Field label="Category"><select className="select" required value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}><option value="">Select category</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            {!showCategoryForm ? (
              <button type="button" className="mt-2 text-sm font-medium underline" onClick={() => setShowCategoryForm(true)}>
                Create a category
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  className="input min-w-0 flex-1"
                  aria-label="New category name"
                  placeholder="New category name"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  autoFocus
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => void createCategory()} disabled={isCreatingCategory || !toSlug(categoryName)}>
                  {isCreatingCategory ? 'Adding...' : 'Add'}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowCategoryForm(false); setCategoryName(''); }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          <Field label="Price"><input className="input" type="number" min="0.01" step="0.01" required value={form.basePrice} onChange={(event) => update('basePrice', event.target.value)} /></Field>
          <Field label="Sale price (optional)"><input className="input" type="number" min="0.01" step="0.01" value={form.salePrice} onChange={(event) => update('salePrice', event.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><textarea className="input min-h-28" value={form.description} onChange={(event) => update('description', event.target.value)} /></Field></div>
        </fieldset>

        <fieldset className="grid gap-5 border-t border-gray-200 pt-6 sm:grid-cols-2">
          <legend className="mb-4 font-medium">Initial variant</legend>
          <Field label="Size"><input className="input" required value={form.size} onChange={(event) => update('size', event.target.value)} /></Field>
          <Field label="Color"><input className="input" required value={form.color} onChange={(event) => update('color', event.target.value)} /></Field>
          <Field label="Variant SKU"><input className="input" required value={form.variantSku} onChange={(event) => update('variantSku', event.target.value)} /></Field>
          <Field label="Starting stock"><input className="input" type="number" min="0" step="1" required value={form.stock} onChange={(event) => update('stock', event.target.value)} /></Field>
        </fieldset>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
          <Link href="/admin/products" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={isSaving || categories.length === 0}>{isSaving ? 'Saving...' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}