'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Calendar, ChevronDown, ChevronUp, Phone, Home } from 'lucide-react';

interface ScheduledVisit {
    id: number;
    lead_name: string;
    email: string;
    phone: string;
    project_interest: string;
    campaign_name: string;
    appointment_date: string;
    last_conversation_summary: string;
    appointment_type: string;
}


export default function ScheduledPage() {
    const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchScheduledVisits();
    }, []);

    const fetchScheduledVisits = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/campaigns/dashboard');
            if (res.ok) {
                const data = await res.json();
                // Map scheduled_visits to include type based on data
                const visits = (data.scheduled_visits || []).map((visit: any, index: number) => ({
                    ...visit,
                    id: index,
                    appointment_type: determineAppointmentType(visit)
                }));
                setScheduledVisits(visits);
            }
        } catch (error) {
            console.error('Error fetching scheduled visits:', error);
        }
    };

    const determineAppointmentType = (visit: any): string => {
        // Determine based on email presence or other criteria
        if (visit.email && visit.email.includes('@')) {
            return 'Sales Call';
        }
        return 'Property Visit';
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' - ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Property Visit/Call Scheduled</h1>
                        <p className="text-gray-500">Manage scheduled property visits and sales calls</p>
                    </div>

                    {/* Scheduled Visits List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {scheduledVisits.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No scheduled visits yet</p>
                                <p className="text-sm mt-1">Appointments will appear here when goals are achieved</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {scheduledVisits.map((visit) => (
                                    <div key={visit.id} className="bg-white hover:bg-gray-50 transition-colors">
                                        {/* Main Row */}
                                        <div className="p-5 flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleExpand(visit.id)}>
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* Icon */}
                                                <div className={`p-2 rounded-lg ${visit.appointment_type === 'Property Visit' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                                    {visit.appointment_type === 'Property Visit' ? (
                                                        <Home size={20} className="text-blue-600" />
                                                    ) : (
                                                        <Phone size={20} className="text-purple-600" />
                                                    )}
                                                </div>

                                                {/* Contact Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="font-semibold text-gray-900">{visit.lead_name}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${visit.appointment_type === 'Property Visit'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-purple-100 text-purple-700'
                                                            }`}>
                                                            {visit.appointment_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-blue-600 mt-0.5">
                                                        {visit.project_interest}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        {visit.phone && `${visit.phone}`}
                                                        {visit.email && visit.phone && ' • '}
                                                        {visit.email}
                                                    </p>
                                                </div>

                                                {/* Date/Time */}
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">{formatDateTime(visit.appointment_date)}</p>
                                                </div>

                                                {/* Expand Icon */}
                                                <div className="text-gray-400">
                                                    {expandedId === visit.id ? (
                                                        <ChevronUp size={20} />
                                                    ) : (
                                                        <ChevronDown size={20} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Section */}
                                        {expandedId === visit.id && (
                                            <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                                                <div className="space-y-4 pt-4">
                                                    {/* Last Conversation Summary */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Last Conversation Summary:
                                                        </label>
                                                        <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                                                            {visit.last_conversation_summary || 'Interested in 2-bed unit at Sobha Crest. Budget confirmed at 1.2M AED.'}
                                                        </p>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                alert(`${visit.appointment_type === 'Property Visit' ? 'Visit' : 'Call'} confirmed!`);
                                                            }}
                                                        >
                                                            {visit.appointment_type === 'Property Visit' ? 'Confirm Visit' : 'Confirm Call'}
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                alert('Reschedule functionality coming soon');
                                                            }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
