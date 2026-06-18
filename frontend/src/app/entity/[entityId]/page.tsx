"use client";

import { useState, useEffect, use } from 'react';
import { fetchRecordsByEntityType, fetchEntityTypes, createEntityRecord } from '../../api';
import Link from 'next/link';

type FieldDef = {
  key?: string;
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
};

function fieldKey(field: FieldDef): string {
  return field.key || field.name;
}

export default function EntityPage({ params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = use(params);
  const [entityType, setEntityType] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [entityId]);

  const loadData = async () => {
    try {
      const types = await fetchEntityTypes();
      const type = types.find((t: any) => t.id === entityId);
      if (type) setEntityType(type);

      const recs = await fetchRecordsByEntityType(entityId);
      setRecords(recs);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEntityRecord(entityId, formData);
      setIsCreating(false);
      setFormData({});
      setError(null);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create record");
    }
  };

  if (!entityType) return <div className="p-8">Loading...</div>;

  const fields: FieldDef[] = entityType.fields || [];
  let tableHeaders = fields.map((f) => ({ key: fieldKey(f), label: f.name }));
  if (tableHeaders.length === 0 && records.length > 0 && records[0].data) {
    tableHeaders = Object.keys(records[0].data).map((k) => ({ key: k, label: k }));
  }

  const renderInput = (field: FieldDef) => {
    const key = fieldKey(field);
    const set = (value: any) => setFormData({ ...formData, [key]: value });
    switch (field.type) {
      case 'BOOLEAN':
        return (
          <input type="checkbox" checked={formData[key] || false}
            onChange={(e) => set(e.target.checked)} className="mt-1" />
        );
      case 'DATE':
        return (
          <input type="date" required={field.required} value={formData[key] || ''}
            onChange={(e) => set(e.target.value)} className="w-full border rounded p-2" />
        );
      case 'SELECT':
        return (
          <select required={field.required} value={formData[key] || ''}
            onChange={(e) => set(e.target.value)} className="w-full border rounded p-2">
            <option value="">Select...</option>
            {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case 'MULTI_SELECT':
        return (
          <select multiple value={formData[key] || []}
            onChange={(e) => set(Array.from(e.target.selectedOptions, (o) => o.value))}
            className="w-full border rounded p-2">
            {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return (
          <input type={field.type === 'NUMBER' ? 'number' : 'text'} required={field.required}
            value={formData[key] || ''} onChange={(e) => set(e.target.value)}
            className="w-full border rounded p-2" />
        );
    }
  };

  return (
    <div className="p-8 font-[family-name:var(--font-geist-sans)] max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Platform</Link>
            <h1 className="text-3xl font-bold">{entityType.name} Records</h1>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isCreating ? 'Cancel' : '+ New Record'}
          </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-800 rounded mb-4">{error}</div>}

      {isCreating && (
        <div className="mb-8 p-6 bg-white rounded shadow border">
          <h2 className="text-xl font-bold mb-4">Create New {entityType.name}</h2>
          <form onSubmit={handleCreateRecord} className="space-y-4">
            {fields.map((field) => (
              <div key={fieldKey(field)}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderInput(field)}
              </div>
            ))}
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Record</button>
          </form>
        </div>
      )}

      {records.length === 0 ? (
        <div className="p-4 bg-gray-50 text-gray-800 rounded">No records found for this entity type.</div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        {tableHeaders.map((header) => (
                            <th key={header.key} scope="col" className="px-6 py-3">{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {records.map((record: any) => (
                        <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{record.id}</td>
                            {tableHeaders.map((header) => {
                                const val = record.data?.[header.key];
                                return (
                                    <td key={header.key} className="px-6 py-4">
                                        {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
