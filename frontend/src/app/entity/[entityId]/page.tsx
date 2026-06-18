"use client";

import { useState, useEffect } from 'react';
import { fetchRecordsByEntityType, fetchEntityTypes, createEntityRecord } from '../../api';
import Link from 'next/link';

export default function EntityPage({ params }: { params: { entityId: string } }) {
  const { entityId } = params;
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
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create record");
    }
  };

  if (!entityType) return <div className="p-8">Loading...</div>;

  const fields = entityType.fields || [];
  let tableHeaders = fields.map((f: any) => f.name);
  if (tableHeaders.length === 0 && records.length > 0 && records[0].data) {
      tableHeaders = Object.keys(records[0].data);
  }

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
            {fields.map((field: any) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'BOOLEAN' ? (
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={(e) => setFormData({...formData, [field.name]: e.target.checked})}
                    className="mt-1"
                  />
                ) : (
                  <input
                    type={field.type === 'NUMBER' ? 'number' : 'text'}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                    className="w-full border rounded p-2"
                  />
                )}
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
                        {tableHeaders.map((header: string) => (
                            <th key={header} scope="col" className="px-6 py-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {records.map((record: any) => (
                        <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{record.id}</td>
                            {tableHeaders.map((header: string) => {
                                const val = record.data?.[header];
                                return (
                                    <td key={header} className="px-6 py-4">
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
