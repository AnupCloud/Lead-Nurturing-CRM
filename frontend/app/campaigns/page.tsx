'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import { Filter, X, ChevronLeft } from 'lucide-react';

interface Project {
    name: string;
}

const PROJECTS = ['Altura', 'Beachgate by Address', 'Damac Bay by Cavalli', 'DLF West Park', 'Godrej Vistas', 'Lumina Grand', 'Sobha Crest', 'Sobha Waves'];
const UNIT_TYPES = ['Studio', '2 bed', '3 bed', 'Duplex', '1 bed', '2 bed w study', '4 bed', 'Penthouse'];
const LEAD_STATUSES = ['Not Connected', 'Connected', 'Visit scheduled', 'Visit done not purchased', 'Purchased', 'Not interested'];

export default function CreateCampaignPage() {
    // Wizard state
    const [step, setStep] = useState(1);

    // Filter states
    const [selectedProject, setSelectedProject] = useState('');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [selectedUnitTypes, setSelectedUnitTypes] = useState<string[]>([]);
    const [selectedLeadStatuses, setSelectedLeadStatuses] = useState<string[]>([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filteredLeadsCount, setFilteredLeadsCount] = useState<number | null>(null);
    const [campaignDate, setCampaignDate] = useState<Date | null>(null);

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

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedProject) count++;
        if (budgetMin || budgetMax) count++;
        if (selectedUnitTypes.length > 0) count++;
        if (selectedLeadStatuses.length > 0) count++;
        if (dateFrom || dateTo) count++;
        return count;
    };

    const handleShortlistLeads = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedProject) params.append('project', selectedProject);
            if (selectedLeadStatuses.length > 0) params.append('statuses', selectedLeadStatuses.join(','));
            if (budgetMin) params.append('budget_min', budgetMin);
            if (budgetMax) params.append('budget_max', budgetMax);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (selectedUnitTypes.length > 0) params.append('unit_types', selectedUnitTypes.join(','));

            const res = await fetch(`http://localhost:8000/api/leads/filter?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setFilteredLeadsCount(data.count);
                setStep(2); // Move to next step
            }
        } catch (error) {
            console.error('Error filtering leads:', error);
        }
    };

    const clearAllFilters = () => {
        setSelectedProject('');
        setBudgetMin('');
        setBudgetMax('');
        setSelectedUnitTypes([]);
        setSelectedLeadStatuses([]);
        setDateFrom('');
        setDateTo('');
        setFilteredLeadsCount(null);
        setStep(1);
    };

    const activeFilters = getActiveFiltersCount();
    const isReadyToSearch = activeFilters >= 2;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
                        <p className="text-gray-500">Filter leads from your CRM to target for nurturing</p>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {/* Section Header */}
                        <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-200">
                            {step === 2 && (
                                <button onClick={() => setStep(1)} className="mr-2 text-gray-500 hover:text-gray-700">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <Filter size={20} className="text-gray-700" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                {step === 1 ? 'Shortlist Leads for Campaign' : 'Budget Range & Schedule'}
                            </h2>
                        </div>

                        {step === 1 ? (
                            // STEP 1: Filter Form
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Project Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Name Enquired
                                        </label>
                                        <select
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select project</option>
                                            {PROJECTS.map(project => (
                                                <option key={project} value={project}>{project}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Budget Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Budget Range
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                placeholder="Min budget"
                                                value={budgetMin}
                                                onChange={(e) => setBudgetMin(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max budget"
                                                value={budgetMax}
                                                onChange={(e) => setBudgetMax(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Unit Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {UNIT_TYPES.map(type => (
                                                <label key={type} className={`
                                                    flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-all
                                                    ${selectedUnitTypes.includes(type)
                                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                                                `}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUnitTypes.includes(type)}
                                                        onChange={() => toggleUnitType(type)}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm font-medium">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Lead Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lead Status (Select Multiple)
                                        </label>
                                        <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {LEAD_STATUSES.map(status => (
                                                <label key={status} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded-md transition-colors">
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

                                    {/* Last Conversation Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Conversation Date (Past 3 years)
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">From</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">To</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // STEP 2: Calendar & Schedule
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Calendar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Select Campaign Start Date
                                    </label>
                                    <Calendar
                                        selectedDate={campaignDate}
                                        onDateSelect={setCampaignDate}
                                    />

                                    {/* Selected Filters Summary */}
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h4 className="font-medium text-blue-900 mb-2">Campaign Target</h4>
                                        <div className="text-sm text-blue-800 space-y-1">
                                            <p><span className="font-medium">Project:</span> {selectedProject || 'Any'}</p>
                                            <p><span className="font-medium">Budget:</span> {budgetMin && budgetMax ? `${budgetMin} - ${budgetMax}` : 'Any'}</p>
                                            <p><span className="font-medium">Leads Matched:</span> {filteredLeadsCount}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Lead Status (Read-only or Refine) */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lead Status (Refine Selection)
                                        </label>
                                        <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {LEAD_STATUSES.map(status => (
                                                <label key={status} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded-md transition-colors">
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

                                    <div className="pt-4">
                                        <button
                                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-sm"
                                            disabled={!campaignDate}
                                        >
                                            Create Campaign
                                        </button>
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            {campaignDate ? `Scheduled for ${campaignDate.toDateString()}` : 'Please select a date to proceed'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 1 Actions */}
                        {step === 1 && (
                            <>
                                {isReadyToSearch && (
                                    <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800 text-sm font-medium">
                                            {activeFilters} filters selected
                                        </p>
                                        <p className="text-green-700 text-sm flex items-center mt-1">
                                            <span className="mr-1">✓</span> Ready to search leads
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={handleShortlistLeads}
                                        disabled={!isReadyToSearch}
                                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        Shortlist Leads
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

