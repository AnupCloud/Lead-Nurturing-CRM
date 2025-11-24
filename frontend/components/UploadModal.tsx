'use client';

import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (fileList) {
            setFiles(Array.from(fileList));
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Upload successful!');
                setFiles([]);
                setTimeout(onClose, 2000);
            } else {
                setMessage(data.message || 'Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage('Upload failed. Please check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Upload Brochures</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center mb-4 bg-gray-50">
                    <Upload size={40} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">Select multiple PDF files</p>
                    <input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
                    >
                        Select PDFs
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                            Selected Files ({files.length})
                        </p>
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-2">
                                    <FileText size={16} className="text-blue-600" />
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <span className="text-xs text-gray-500">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Remove"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {message && (
                    <p className={`text-sm mb-4 ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={files.length === 0 || uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
