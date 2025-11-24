'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Filter, Users, X, Plus } from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    project_interest: string;
    status: string;
    budget: number;
    unit_type?: string;
    last_contact_date?: string;
    last_conversation_summary?: string;
}

// Helper for case-insensitive status matching
const statusLower = (s: string) => s?.toLowerCase() || '';

const PROJECTS = ['Altura', 'Beachgate by Address', 'Damac Bay by Cavalli', 'DLF WestPark', 'Godrej Vistas', 'Lumina Grand', 'Sobha Crest', 'Sobha Waves'];
const LEAD_STATUSES = ['Not Connected', 'Connected', 'Visit scheduled', 'Visit done not purchased', 'Purchased', 'Not interested'];
const UNIT_TYPES = ['studio', '1 bed', '2 bed', '2 bed w study', '3 bed', '4 bed', 'Duplex', 'Penthouse'];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [leadCount, setLeadCount] = useState<number | null>(null);
    const [filterError, setFilterError] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

    // Filter state
    const [project, setProject] = useState('');
    const [selectedLeadStatuses, setSelectedLeadStatuses] = useState<string[]>([]);
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedUnitTypes, setSelectedUnitTypes] = useState<string[]>([]);

    useEffect(() => {
        fetchAllLeads();
    }, []);

    const fetchAllLeads = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/leads');
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
                setLeadCount(data.length);
                setIsFiltered(false);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (project) count++;
        if (selectedLeadStatuses.length > 0) count++;
        if (budgetMin || budgetMax) count++;
        if (dateFrom || dateTo) count++;
        if (selectedUnitTypes.length > 0) count++;
        return count;
    };

    const toggleUnitType = (type: string) => {
        setSelectedUnitTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleLeadStatus = (status: string) => {
        setSelectedLeadStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const applyFilters = async () => {
        const activeFilters = getActiveFiltersCount();

        if (activeFilters < 2) {
            setFilterError('Please select at least 2 filter criteria');
            return;
        }
        setFilterError('');

        try {
            const params = new URLSearchParams();
            if (project) params.append('project', project);
            if (selectedLeadStatuses.length > 0) params.append('statuses', selectedLeadStatuses.join(','));
            if (budgetMin) params.append('budget_min', budgetMin);
            if (budgetMax) params.append('budget_max', budgetMax);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (selectedUnitTypes.length > 0) params.append('unit_types', selectedUnitTypes.join(','));

            const res = await fetch(`http://localhost:8000/api/leads/filter?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLeads(data.leads || []);
                setLeadCount(data.count || 0);
                setIsFiltered(true);
            }
        } catch (error) {
            console.error('Error filtering leads:', error);
        }
    };

    const clearFilters = () => {
        setProject('');
        setSelectedLeadStatuses([]);
        setBudgetMin('');
        setBudgetMax('');
        setDateFrom('');
        setDateTo('');
        setSelectedUnitTypes([]);
        setFilterError('');
        fetchAllLeads();
    };

    const formatBudget = (budget: number) => {
        if (budget >= 10000000) {
            return `${(budget / 10000000).toFixed(2)} Cr`;
        } else if (budget >= 100000) {
            return `${(budget / 100000).toFixed(2)} L`;
        }
        return budget.toLocaleString();
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
                        <p className="text-gray-500">Filter and manage your property leads from CRM</p>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Filter size={20} className="text-gray-600" />
                                <h2 className="text-lg font-semibold text-gray-800">Filter Leads</h2>
                                <span className="text-sm text-gray-500">(Select at least 2 criteria)</span>
                            </div>
                            {isFiltered && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                                >
                                    <X size={16} />
                                    <span>Clear Filters</span>
                                </button>
                            )}
                        </div>

                        {/* Project Name Enquired */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name Enquired</label>
                            <select
                                className="w-full max-w-md border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={project}
                                onChange={(e) => setProject(e.target.value)}
                            >
                                <option value="">Select project</option>
                                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Budget Range */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Min"
                                        className="w-full border border-gray-300 rounded-lg pl-7 p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                        value={budgetMin}
                                        onChange={(e) => setBudgetMin(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Max"
                                        className="w-full border border-gray-300 rounded-lg pl-7 p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                        value={budgetMax}
                                        onChange={(e) => setBudgetMax(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Unit Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type</label>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                                {UNIT_TYPES.map(type => (
                                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedUnitTypes.includes(type)}
                                            onChange={() => toggleUnitType(type)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-900">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Lead Status (Select Multiple) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Status (Select Multiple)</label>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                                {LEAD_STATUSES.map(status => (
                                    <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeadStatuses.includes(status)}
                                            onChange={() => toggleLeadStatus(status)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-900">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Last Conversation Date (Past 3 years) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Conversation Date (Past 3 years)</label>
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <input
                                    type="date"
                                    placeholder="From date"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                                <input
                                    type="date"
                                    placeholder="To date"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter Status */}
                        {getActiveFiltersCount() >= 2 && !filterError && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-center">
                                    <p className="text-green-700 font-medium">
                                        {getActiveFiltersCount()} filters selected
                                    </p>
                                    <p className="text-green-600 text-sm mt-1 flex items-center justify-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Ready to search leads
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Filter Error */}
                        {filterError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {filterError}
                            </div>
                        )}

                        {/* Apply Filters Button */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex space-x-4">
                                <button
                                    onClick={applyFilters}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                                >
                                    Shortlist Leads
                                </button>
                                {isFiltered && leads.length > 0 && (
                                    <a
                                        href="/campaigns"
                                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex items-center"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create Campaign
                                    </a>
                                )}
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-gray-600 hover:text-gray-800 px-4 py-2"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Lead Count Display */}
                    {leadCount !== null && (
                        <div className={`border rounded-lg p-4 mb-6 flex items-center justify-center space-x-2 ${isFiltered ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                            <Users size={24} className={isFiltered ? 'text-green-600' : 'text-blue-600'} />
                            <p className={`font-medium ${isFiltered ? 'text-green-700' : 'text-blue-700'}`}>
                                <span className="text-2xl font-bold">{leadCount}</span> leads {isFiltered ? 'match your criteria' : 'in database'}
                            </p>
                        </div>
                    )}

                    {/* Leads Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Project Interest</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Budget</th>
                                    <th className="px-6 py-3">Unit Type</th>
                                    <th className="px-6 py-3">Last Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No leads found. Try adjusting your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => (
                                        <tr key={lead.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                                            <td className="px-6 py-4 text-gray-900">{lead.email}</td>
                                            <td className="px-6 py-4 text-gray-900">{lead.project_interest}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLower(lead.status) === 'purchased' ? 'bg-green-100 text-green-800' :
                                                    statusLower(lead.status) === 'not interested' ? 'bg-red-100 text-red-800' :
                                                        statusLower(lead.status) === 'visit scheduled' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{formatBudget(lead.budget)}</td>
                                            <td className="px-6 py-4 text-gray-900">{lead.unit_type || '-'}</td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {lead.last_contact_date ? new Date(lead.last_contact_date).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
