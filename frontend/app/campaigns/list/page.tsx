'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import { Play, MessageCircle, Calendar, CheckCircle, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Campaign {
    id: number;
    name: string;
    target_project: string;
    channel: string;
    status: string;
    messages_sent: number;
    leads_count: number;
    created_at: string;
    executed_at?: string;
}

export default function CampaignsListPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [executingCampaignId, setExecutingCampaignId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/campaigns/list');
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data.campaigns || []);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    };

    const handleExecuteCampaign = async (campaignId: number) => {
        if (!confirm('Execute this campaign? This will send AI-generated messages to all matched leads.')) {
            return;
        }

        setExecutingCampaignId(campaignId);
        try {
            const res = await fetch(`http://localhost:8000/api/campaigns/${campaignId}/execute`, {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Campaign executed successfully! ${data.messages_sent} messages sent.`);
                fetchCampaigns(); // Refresh list
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to execute campaign');
            }
        } catch (error) {
            console.error('Error executing campaign:', error);
            alert('Error executing campaign');
        } finally {
            setExecutingCampaignId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (campaign: Campaign) => {
        const status = campaign.status || 'draft';

        const badges = {
            draft: {
                color: 'bg-gray-100 text-gray-700',
                text: 'Draft',
                icon: null
            },
            running: {
                color: 'bg-blue-100 text-blue-700',
                text: 'Running',
                icon: <Play size={12} className="mr-1" />
            },
            completed: {
                color: 'bg-green-100 text-green-700',
                text: 'Completed',
                icon: <CheckCircle size={12} className="mr-1" />
            },
            paused: {
                color: 'bg-yellow-100 text-yellow-700',
                text: 'Paused',
                icon: null
            }
        };

        const badge = badges[status as keyof typeof badges] || badges.draft;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.icon}
                {badge.text}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">All Campaigns</h1>
                            <p className="text-gray-500">Manage and execute your lead nurturing campaigns</p>
                        </div>
                        <button
                            onClick={() => router.push('/campaigns')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Create New Campaign
                        </button>
                    </div>

                    {/* Campaigns List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        {campaigns.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No campaigns yet</p>
                                <p className="text-sm mt-1">Create your first campaign to start nurturing leads</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {campaigns.map((campaign) => {
                                    const isDraft = campaign.status === 'draft' || !campaign.executed_at;
                                    const isExecuting = executingCampaignId === campaign.id;

                                    return (
                                        <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900 text-lg">
                                                            {campaign.name}
                                                        </h3>
                                                        {getStatusBadge(campaign)}
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4 mt-3">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-medium">Project</p>
                                                            <p className="text-sm text-gray-900 mt-1">{campaign.target_project}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-medium">Leads</p>
                                                            <p className="text-sm text-gray-900 mt-1">{campaign.leads_count}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-medium">Messages Sent</p>
                                                            <p className="text-sm text-gray-900 mt-1">{campaign.messages_sent}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-medium">Created</p>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                {formatDate(campaign.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col space-y-2 ml-6">
                                                    {isDraft ? (
                                                        <button
                                                            onClick={() => handleExecuteCampaign(campaign.id)}
                                                            disabled={isExecuting}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2 whitespace-nowrap"
                                                        >
                                                            {isExecuting ? (
                                                                <>
                                                                    <Loader size={16} className="animate-spin" />
                                                                    <span>Executing...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Play size={16} />
                                                                    <span>Execute Campaign</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => router.push(`/followups?campaign=${campaign.id}`)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 whitespace-nowrap"
                                                        >
                                                            <MessageCircle size={16} />
                                                            <span>View Conversations</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
