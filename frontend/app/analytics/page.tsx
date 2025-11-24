'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Users, MessageSquare, BarChart3, CheckCircle } from 'lucide-react';

interface Campaign {
    id: number;
    name: string;
}

interface Metrics {
    leads_shortlisted: number;
    messages_sent: number;
    unique_responses: number;
    goals_achieved: number;
}

export default function AnalyticsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
    const [metrics, setMetrics] = useState<Metrics>({
        leads_shortlisted: 0,
        messages_sent: 0,
        unique_responses: 0,
        goals_achieved: 0
    });

    useEffect(() => {
        fetchDashboard();
    }, [selectedCampaign]);

    const fetchDashboard = async () => {
        try {
            const url = selectedCampaign
                ? `http://localhost:8000/api/campaigns/dashboard?campaign_id=${selectedCampaign}`
                : 'http://localhost:8000/api/campaigns/dashboard';

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data.campaigns || []);
                setMetrics(data.metrics || {});
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        }
    };

    const metricCards = [
        {
            label: "Leads Shortlisted",
            value: metrics.leads_shortlisted,
            icon: Users,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            label: "Messages Sent",
            value: metrics.messages_sent,
            icon: MessageSquare,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            label: "Unique Responses",
            value: metrics.unique_responses,
            icon: BarChart3,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600"
        },
        {
            label: "Goals Achieved",
            value: metrics.goals_achieved,
            icon: CheckCircle,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Campaign Analytics</h1>
                        <p className="text-gray-500">Detailed analytics and performance metrics for your lead nurturing campaigns</p>
                    </div>

                    {/* Campaign Selector */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Analytics</h2>
                        <select
                            value={selectedCampaign || ''}
                            onChange={(e) => setSelectedCampaign(e.target.value ? Number(e.target.value) : null)}
                            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a campaign</option>
                            {campaigns.map((camp) => (
                                <option key={camp.id} value={camp.id}>{camp.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {metricCards.map((metric, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${metric.iconBg}`}>
                                        <metric.icon size={24} className={metric.iconColor} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{metric.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
