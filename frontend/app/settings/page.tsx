'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Settings as SettingsIcon } from 'lucide-react';

interface AIAgentSettings {
    followup_interval_days: number;
    max_followups: number;
    messaging_focus: string;
    response_style: string;
    urgency_level: string;
    custom_instructions: string;
}

const MESSAGING_FOCUS_OPTIONS = [
    'Property Features & Benefits',
    'Pricing & Payment Plans',
    'Location & Amenities',
    'Investment Opportunities'
];

const RESPONSE_STYLE_OPTIONS = [
    'Professional & Formal',
    'Friendly & Conversational',
    'Direct & Concise',
    'Detailed & Informative'
];

const URGENCY_LEVEL_OPTIONS = [
    'Low - Subtle, patient approach',
    'Medium - Moderate urgency',
    'High - Strong call to action'
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<AIAgentSettings>({
        followup_interval_days: 3,
        max_followups: 5,
        messaging_focus: 'Property Features & Benefits',
        response_style: 'Professional & Formal',
        urgency_level: 'Medium - Moderate urgency',
        custom_instructions: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/agent-settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            // Load from localStorage as fallback
            const stored = localStorage.getItem('aiAgentSettings');
            if (stored) {
                setSettings(JSON.parse(stored));
            }
        }
    };

    const handleChange = async (key: keyof AIAgentSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        // Auto-save to backend
        try {
            await fetch('http://localhost:8000/api/agent-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            localStorage.setItem('aiAgentSettings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving settings:', error);
            localStorage.setItem('aiAgentSettings', JSON.stringify(newSettings));
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-4xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">AI Agent Settings</h1>
                        <p className="text-gray-500">Configure how your AI agent behaves during lead nurturing conversations</p>
                    </div>

                    {/* Settings Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
                        {/* Nurturing Agent Settings Header */}
                        <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                            <SettingsIcon size={20} className="text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Nurturing Agent Settings</h2>
                        </div>

                        {/* Follow-up Interval */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Follow-up Interval (days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={settings.followup_interval_days}
                                onChange={(e) => handleChange('followup_interval_days', parseInt(e.target.value) || 3)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">How many days to wait between automated follow-up messages</p>
                        </div>

                        {/* Maximum Follow-ups */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Follow-ups (if no response)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={settings.max_followups}
                                onChange={(e) => handleChange('max_followups', parseInt(e.target.value) || 5)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">Maximum number of follow-up attempts before stopping</p>
                        </div>

                        {/* Messaging Focus */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Messaging Focus for Follow-ups
                            </label>
                            <select
                                value={settings.messaging_focus}
                                onChange={(e) => handleChange('messaging_focus', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {MESSAGING_FOCUS_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* AI Response Style */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                AI Response Style
                            </label>
                            <select
                                value={settings.response_style}
                                onChange={(e) => handleChange('response_style', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {RESPONSE_STYLE_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* Urgency Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Urgency Level
                            </label>
                            <select
                                value={settings.urgency_level}
                                onChange={(e) => handleChange('urgency_level', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {URGENCY_LEVEL_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1.5">Control the urgency level of follow-up messages</p>
                        </div>

                        {/* Custom AI Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom AI Instructions
                            </label>
                            <textarea
                                value={settings.custom_instructions}
                                onChange={(e) => handleChange('custom_instructions', e.target.value)}
                                rows={6}
                                placeholder="Enter any specific instructions for the AI agent's behavior, tone, or conversation handling..."
                                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">
                                Optional: Provide specific guidelines for how the AI should communicate with leads
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
