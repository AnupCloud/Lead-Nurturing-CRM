'use client';

import { useState, useEffect } from 'react';
import { Filter, MoreHorizontal } from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    project_interest: string;
    status: string;
    budget: string;
    last_contact_date: string;
}

export default function LeadList() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/leads');
                if (res.ok) {
                    const data = await res.json();
                    setLeads(data);
                }
            } catch (error) {
                console.error('Error fetching leads:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading leads...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-800">Leads</h2>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Filter size={18} />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Project</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Budget</th>
                            <th className="px-4 py-3">Last Contact</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr key={lead.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                                <td className="px-4 py-3 text-gray-600">{lead.project_interest}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${lead.status === 'Connected' ? 'bg-green-100 text-green-700' :
                                            lead.status === 'Not Connected' ? 'bg-red-100 text-red-700' :
                                                lead.status === 'Visit Scheduled' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{lead.budget}</td>
                                <td className="px-4 py-3 text-gray-600">{lead.last_contact_date}</td>
                                <td className="px-4 py-3">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
