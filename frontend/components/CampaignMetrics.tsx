'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, CheckCircle } from 'lucide-react';

export default function CampaignMetrics() {
    const [data, setData] = useState({
        leads_shortlisted: 0,
        messages_sent: 0,
        responses: 0,
        goals_achieved: 0
    });

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/metrics');
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };
        fetchMetrics();
    }, []);

    const metrics = [
        { label: "Leads Shortlisted", value: data.leads_shortlisted, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Messages Sent", value: data.messages_sent, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Responses", value: data.responses, icon: BarChart3, color: "text-orange-600", bg: "bg-orange-100" },
        { label: "Goals Achieved", value: data.goals_achieved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${metric.bg} ${metric.color}`}>
                        <metric.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">{metric.label}</p>
                        <h3 className="text-2xl font-bold text-gray-800">{metric.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
