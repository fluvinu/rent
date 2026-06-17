"use client";

import { useState } from 'react';
import { createEntityType } from '../../api';
import Link from 'next/link';

export default function CreateEntityPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<any[]>([{ name: '', type: 'TEXT', required: false }]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addField = () => setFields([...fields, { name: '', type: 'TEXT', required: false }]);

  const updateField = (index: number, key: string, val: any) => {
    const newFields = [...fields];
    newFields[index][key] = val;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEntityType({ name, description, fields });
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to create entity type");
    }
  };

  return (
    <div className="p-8 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Platform</Link>
        <h1 className="text-3xl font-bold">Create Entity Type</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-800 rounded mb-4">{error}</div>}
      {success && (
        <div className="p-4 bg-green-50 text-green-800 rounded mb-4">
          Entity Type created successfully! <Link href="/" className="underline font-bold">Go back home</Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow border">
        <div>
          <label className="block text-sm font-medium text-gray-700">Entity Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="e.g. Employee"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Optional description"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Fields</label>
            <button type="button" onClick={addField} className="text-sm text-blue-600 hover:underline">+ Add Field</button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded bg-gray-50">
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Field Name (e.g. email)"
                    value={field.name}
                    onChange={(e) => updateField(index, 'name', e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                    className="border rounded p-2 text-sm bg-white"
                  >
                    {['TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'JSON'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`req-${index}`}
                    checked={field.required}
                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                  />
                  <label htmlFor={`req-${index}`} className="text-sm text-gray-700">Required</label>
                </div>
                <button type="button" onClick={() => removeField(index)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded font-bold hover:bg-green-700">
          Create Entity Type
        </button>
      </form>
    </div>
  );
}
