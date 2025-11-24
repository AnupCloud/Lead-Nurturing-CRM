'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FileText, Trash2, Upload, Download } from 'lucide-react';

interface Brochure {
    filename: string;
    size: number;
    uploaded_at: string;
}

export default function KnowledgeBasePage() {
    const [brochures, setBrochures] = useState<Brochure[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    useEffect(() => {
        fetchBrochures();
    }, []);

    const fetchBrochures = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/brochures');
            if (res.ok) {
                const data = await res.json();
                setBrochures(data.brochures || []);
            }
        } catch (error) {
            console.error('Error fetching brochures:', error);
        } finally {
            setLoading(false);
        }
    };

    const [deleting, setDeleting] = useState<string | null>(null);

    const deleteBrochure = async (filename: string) => {
        setDeleting(filename);

        try {
            const encodedFilename = encodeURIComponent(filename);
            const res = await fetch(`http://localhost:8000/api/brochures/${encodedFilename}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchBrochures();
                setSelectedFiles(selectedFiles.filter(f => f !== filename));
                alert(`Successfully deleted ${filename}`);
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                alert(`Failed to delete brochure: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting brochure:', error);
            alert(`Error deleting brochure: ${error instanceof Error ? error.message : 'Network error'}`);
        } finally {
            setDeleting(null);
        }
    };

    const [bulkDeleting, setBulkDeleting] = useState(false);

    const bulkDeleteBrochures = async () => {
        if (selectedFiles.length === 0) return;

        console.log('🗑️ Bulk delete initiated for files:', selectedFiles);

        setBulkDeleting(true);
        console.log('📤 Sending bulk delete request...');

        try {
            const url = 'http://localhost:8000/api/brochures/bulk-delete';
            console.log('🌐 Request URL:', url);
            console.log('📦 Request payload:', { filenames: selectedFiles });

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filenames: selectedFiles })
            });

            console.log('📨 Response status:', res.status, res.statusText);
            console.log('📨 Response ok:', res.ok);

            if (res.ok) {
                const data = await res.json();
                console.log('✅ Bulk delete successful:', data);
                await fetchBrochures();
                setSelectedFiles([]);
                alert(data.message || 'Files deleted successfully');
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('❌ Bulk delete failed:', errorData);
                alert(`Bulk delete failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('💥 Bulk delete error:', error);
            alert('Error deleting files');
        } finally {
            setBulkDeleting(false);
            console.log('🏁 Bulk delete completed');
        }
    };

    const toggleSelectAll = () => {
        if (selectedFiles.length === brochures.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(brochures.map(b => b.filename));
        }
    };

    const toggleFileSelection = (filename: string) => {
        if (selectedFiles.includes(filename)) {
            setSelectedFiles(selectedFiles.filter(f => f !== filename));
        } else {
            setSelectedFiles([...selectedFiles, filename]);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Knowledge Base</h1>
                            <p className="text-gray-500">Manage property brochures and documents</p>
                        </div>
                        {selectedFiles.length > 0 && (
                            <button
                                onClick={bulkDeleteBrochures}
                                disabled={bulkDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <Trash2 size={18} />
                                <span>
                                    {bulkDeleting
                                        ? 'Deleting...'
                                        : `Delete Selected (${selectedFiles.length})`
                                    }
                                </span>
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading brochures...</p>
                        </div>
                    ) : brochures.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No brochures uploaded</h3>
                            <p className="text-gray-500 mb-4">Upload brochures from the Dashboard to get started</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedFiles.length === brochures.length && brochures.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Document
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Uploaded
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {brochures.map((brochure) => (
                                        <tr
                                            key={brochure.filename}
                                            className={`hover:bg-gray-50 ${selectedFiles.includes(brochure.filename) ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.includes(brochure.filename)}
                                                    onChange={() => toggleFileSelection(brochure.filename)}
                                                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-blue-100 p-2 rounded-lg">
                                                        <FileText size={20} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{brochure.filename}</p>
                                                        <p className="text-xs text-gray-500">PDF Document</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatBytes(brochure.size)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(brochure.uploaded_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteBrochure(brochure.filename)}
                                                    disabled={deleting === brochure.filename}
                                                    className={`p-2 rounded-lg transition-colors ${deleting === brochure.filename
                                                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                        : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                        }`}
                                                    title={deleting === brochure.filename ? 'Deleting...' : 'Delete'}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
