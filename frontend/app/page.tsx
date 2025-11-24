'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import UploadModal from '@/components/UploadModal';
import { Upload, BarChart3, Users, MessageSquare, CheckCircle, Calendar } from 'lucide-react';

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

interface ScheduledVisit {
  lead_name: string;
  email: string;
  phone: string;
  campaign_name: string;
  appointment_date: string;
  last_conversation_summary: string;
}

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    leads_shortlisted: 0,
    messages_sent: 0,
    unique_responses: 0,
    goals_achieved: 0
  });
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([]);
  const [username, setUsername] = useState('A');

  useEffect(() => {
    fetchDashboard();
    const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
    if (storedUsername) setUsername(storedUsername.charAt(0).toUpperCase());
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
        setScheduledVisits(data.scheduled_visits || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const metricCards = [
    { label: "Leads", value: metrics.leads_shortlisted, icon: Users, color: "text-blue-600", bg: "bg-blue-100", subtitle: "Shortlisted" },
    { label: "Sent", value: metrics.messages_sent, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100", subtitle: "Messages" },
    { label: "Responses", value: metrics.unique_responses, icon: BarChart3, color: "text-orange-600", bg: "bg-orange-100", subtitle: "Unique" },
    { label: "Goals", value: metrics.goals_achieved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", subtitle: "Achieved" },
  ];

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">Campaign Dashboard</h2>
            <select
              value={selectedCampaign || ''}
              onChange={(e) => setSelectedCampaign(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>{camp.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              <span>Upload Brochure</span>
            </button>
            <button
              onClick={() => window.location.href = '/campaigns'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              New Campaign
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {username}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((metric, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${metric.bg} ${metric.color}`}>
                  <metric.icon size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">{metric.value}</h3>
                  <p className="text-sm text-gray-500">{metric.subtitle} {metric.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scheduled Visits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex items-center space-x-2">
              <Calendar size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Property Visits / Calls Scheduled</h3>
            </div>

            {scheduledVisits.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No scheduled visits yet</p>
                <p className="text-sm">Appointments will appear here when goals are achieved</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {scheduledVisits.map((visit, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{visit.lead_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{visit.email}</div>
                          <div className="text-xs text-gray-500">{visit.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{visit.campaign_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{formatDate(visit.appointment_date)}</td>
                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">{visit.last_conversation_summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      </main>
    </div>
  );
}
