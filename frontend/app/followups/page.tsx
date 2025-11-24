'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { MessageCircle, X, Send, CheckCircle2, User, Bot } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Campaign {
    id: number;
    name: string;
}

interface Conversation {
    id: number;
    lead_name: string;
    lead_id: number;
    speaker: string;
    message: string;
    timestamp: string;
}

interface LeadSummary {
    leadId: number;
    name: string;
    messageCount: number;
    lastMessage: string;
    lastTimestamp: string;
    status: 'Active' | 'Paused' | 'Goal Achieved';
}

export default function FollowupsPage() {
    const searchParams = useSearchParams();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [showConversationModal, setShowConversationModal] = useState(false);
    const [selectedLeadConversations, setSelectedLeadConversations] = useState<Conversation[]>([]);
    const [selectedLeadName, setSelectedLeadName] = useState('');
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const [followupMessage, setFollowupMessage] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    useEffect(() => {
        // Check for campaign parameter in URL
        const campaignParam = searchParams?.get('campaign');

        if (campaignParam && campaigns.length > 0) {
            const campaignId = parseInt(campaignParam);
            if (!isNaN(campaignId)) {
                fetchConversations(campaignId);
            }
        } else if (campaigns.length > 0 && !selectedCampaignId) {
            fetchConversations(campaigns[0].id);
        }
    }, [campaigns, searchParams]);

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

    const fetchConversations = async (campaignId: number) => {
        setSelectedCampaignId(campaignId);
        try {
            const res = await fetch(`http://localhost:8000/api/campaigns/${campaignId}/conversations`);
            if (res.ok) {
                const data = await res.json();
                // Backend returns array directly, not {conversations: [...]}
                setConversations(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const viewLeadConversation = (leadId: number, leadName: string) => {
        const leadConvs = conversations
            .filter(c => c.lead_id === leadId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setSelectedLeadConversations(leadConvs);
        setSelectedLeadName(leadName);
        setSelectedLeadId(leadId);
        setShowConversationModal(true);
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const handleMarkGoal = async () => {
        if (!selectedLeadId || !selectedCampaignId) return;

        try {
            console.log('Sending mark goal request for lead:', selectedLeadId);
            const res = await fetch(`http://localhost:8000/api/campaigns/${selectedCampaignId}/mark_goal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: selectedLeadId })
            });

            console.log('Mark goal response status:', res.status, 'ok:', res.ok);
            const data = await res.json();
            console.log('Mark goal response data:', data);

            if (res.ok) {
                alert('Goal marked as achieved!');
                setShowConversationModal(false);
                // Refresh conversations
                if (selectedCampaignId) {
                    fetchConversations(selectedCampaignId);
                }
            } else {
                console.error('Mark goal failed with status:', res.status);
                alert('Failed to mark goal. Please try again.');
            }
        } catch (error) {
            console.error('Error marking goal:', error);
            alert('Error marking goal: ' + error.message);
        }
    };

    const handleSendFollowup = async () => {
        console.log('[handleSendFollowup] Function called, selectedLeadId:', selectedLeadId, 'selectedCampaignId:', selectedCampaignId);
        if (!selectedLeadId || !selectedCampaignId) return;

        const message = followupMessage.trim();
        console.log('[handleSendFollowup] Message to send:', message);
        if (!message) {
            alert('Please enter a message');
            return;
        }

        try {
            console.log('Sending follow-up for lead:', selectedLeadId, 'message:', message);
            const res = await fetch(`http://localhost:8000/api/campaigns/${selectedCampaignId}/send_followup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: selectedLeadId, message })
            });

            console.log('Send followup response status:', res.status, 'ok:', res.ok);
            const data = await res.json();
            console.log('Send followup response data:', data);

            if (res.ok) {
                console.log('[ALERT] About to show success alert');
                alert('Follow-up sent!');
                setFollowupMessage(''); // Clear input
                // Refresh conversations
                if (selectedCampaignId) {
                    fetchConversations(selectedCampaignId);
                }
            } else {
                console.error('Send followup failed with status:', res.status);
                alert('Failed to send follow-up. Please try again.');
            }
        } catch (error) {
            console.error('Error sending follow-up:', error);
            alert('Error sending follow-up: ' + error.message);
        }
    };

    const leadSummaries = useMemo(() => {
        const leadMap = new Map<number, LeadSummary>();

        conversations.forEach(conv => {
            if (!leadMap.has(conv.lead_id)) {
                leadMap.set(conv.lead_id, {
                    leadId: conv.lead_id,
                    name: conv.lead_name,
                    messageCount: 0,
                    lastMessage: '',
                    lastTimestamp: conv.timestamp,
                    status: 'Active'
                });
            }

            const summary = leadMap.get(conv.lead_id)!;
            summary.messageCount++;

            if (new Date(conv.timestamp) > new Date(summary.lastTimestamp)) {
                summary.lastMessage = conv.message;
                summary.lastTimestamp = conv.timestamp;
            }
        });

        const summaries = Array.from(leadMap.values()).sort((a, b) =>
            new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
        );

        return summaries;
    }, [conversations]);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agent Follow-ups</h1>
                        <p className="text-gray-600">Monitor AI-driven conversations and lead engagement</p>
                    </div>

                    {/* Campaign Selector */}
                    {campaigns.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Campaign</label>
                            <select
                                value={selectedCampaignId || ''}
                                onChange={(e) => fetchConversations(Number(e.target.value))}
                                className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-md shadow-sm hover:border-gray-300 transition-colors"
                            >
                                {campaigns.map((camp) => (
                                    <option key={camp.id} value={camp.id}>{camp.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Leads List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {leadSummaries.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle size={40} className="text-gray-400" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</p>
                                <p className="text-sm text-gray-500">Start a campaign to begin nurturing leads with AI</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {leadSummaries.map((lead) => (
                                    <div
                                        key={lead.leadId}
                                        className="p-6 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Lead Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        <User size={20} className="text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{lead.name}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle size={14} />
                                                                {lead.messageCount} messages
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                Last: {formatTimeAgo(lead.lastTimestamp)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Last Message Preview */}
                                                <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                                                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                                        "{lead.lastMessage.substring(0, 150)}{lead.lastMessage.length > 150 ? '...' : ''}"
                                                    </p>
                                                </div>

                                                {/* Status and Actions */}
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${lead.status === 'Active'
                                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                        : lead.status === 'Paused'
                                                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                            : 'bg-green-100 text-green-700 border border-green-200'
                                                        }`}>
                                                        {lead.status === 'Active' && <MessageCircle size={12} className="mr-1" />}
                                                        {lead.status === 'Goal Achieved' && <CheckCircle2 size={12} className="mr-1" />}
                                                        {lead.status}
                                                    </span>
                                                    <button
                                                        onClick={() => viewLeadConversation(lead.leadId, lead.name)}
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                                                    >
                                                        View Conversation →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Conversation Modal */}
            {showConversationModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center flex-shrink-0 bg-gradient-to-r from-blue-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                                    <User size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedLeadName}</h2>
                                    <p className="text-sm text-gray-500">Conversation History</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConversationModal(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Conversation Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                            {selectedLeadConversations.map((conv, idx) => (
                                <div key={conv.id} className={`flex ${conv.speaker === 'agent' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                                    <div className={`flex gap-3 max-w-[75%] ${conv.speaker === 'lead' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${conv.speaker === 'agent'
                                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                            }`}>
                                            {conv.speaker === 'agent' ? (
                                                <Bot size={20} className="text-white" />
                                            ) : (
                                                <User size={20} className="text-white" />
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`flex flex-col ${conv.speaker === 'lead' ? 'items-end' : 'items-start'}`}>
                                            <div className={`rounded-2xl px-4 py-3 shadow-sm ${conv.speaker === 'agent'
                                                ? 'bg-white border-2 border-indigo-100 rounded-tl-none'
                                                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`text-xs font-bold ${conv.speaker === 'agent' ? 'text-indigo-600' : 'text-blue-100'
                                                        }`}>
                                                        {conv.speaker === 'agent' ? '🤖 AI Agent' : `${conv.lead_name}`}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${conv.speaker === 'agent' ? 'text-gray-800' : 'text-white'
                                                    }`}>
                                                    {conv.message}
                                                </p>
                                            </div>
                                            <p className="text-xs mt-1.5 px-2 text-gray-400">
                                                {new Date(conv.timestamp).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer - Message Input */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <div className="flex flex-col gap-3">
                                {/* Message Counter & Actions */}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MessageCircle size={16} />
                                        <span>{selectedLeadConversations.length} messages</span>
                                    </div>
                                    <button
                                        onClick={handleMarkGoal}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
                                    >
                                        <CheckCircle2 size={16} />
                                        <span>Mark as Goal Achieved</span>
                                    </button>
                                </div>

                                {/* Message Input Field */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={followupMessage}
                                        onChange={(e) => setFollowupMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && followupMessage.trim()) {
                                                handleSendFollowup();
                                            }
                                        }}
                                        placeholder="Type your follow-up message..."
                                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                    <button
                                        onClick={handleSendFollowup}
                                        disabled={!followupMessage.trim()}
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} />
                                        <span>Send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
