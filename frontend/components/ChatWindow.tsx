'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What amenities does Lumina Grand offer?",
  "Tell me about the pricing and floor plans at Godrej Vistas",
  "What facilities are available at Sobha Crest?",
  "Can you describe the location advantages of Altura?",
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount - REMOVED to clear on refresh
  // useEffect(() => {
  //   const savedMessages = localStorage.getItem('chatMessages');
  //   if (savedMessages) {
  //     try {
  //       const parsed = JSON.parse(savedMessages);
  //       setMessages(parsed);
  //     } catch (error) {
  //       console.error('Error loading chat history:', error);
  //     }
  //   }
  // }, []);

  // Save messages to localStorage whenever they change - REMOVED to clear on refresh
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     localStorage.setItem('chatMessages', JSON.stringify(messages));
  //   }
  // }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      // localStorage.removeItem('chatMessages'); // No longer needed
    }
  };

  const sendMessage = async (messageText?: string, retryCount = 0) => {
    const text = messageText || input;
    if (!text.trim()) return;

    console.log('🚀 [ChatWindow] Sending message:', text);

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      console.log('📤 [ChatWindow] Making API call to /api/chat (attempt', retryCount + 1, ')');
      const requestPayload = {
        query: text,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      };
      console.log('📦 [ChatWindow] Request payload:', requestPayload);

      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      console.log('📨 [ChatWindow] Response status:', res.status);

      if (!res.ok) {
        // Handle non-200 responses with retry logic
        if (res.status >= 500 && retryCount < 2) {
          // Retry for server errors (up to 2 retries)
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s
          console.log(`⏳ [ChatWindow] Server error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          setLoading(false);
          return sendMessage(text, retryCount + 1);
        }
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      console.log('✅ [ChatWindow] Response data:', data);

      const agentMsg: Message = { role: 'agent', content: data.response };
      setMessages((prev) => [...prev, agentMsg]);
      console.log('💬 [ChatWindow] Agent response added to messages');
    } catch (error) {
      console.error('❌ [ChatWindow] Error sending message:', error);

      let errorMessage = 'Sorry, I encountered an error. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('500') || error.message.includes('502')) {
          errorMessage = 'Our AI assistant is temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Unable to connect to the server. Please check your connection and try again.';
        }
      }

      setMessages((prev) => [...prev, {
        role: 'agent',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
      console.log('🏁 [ChatWindow] Message send complete');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm mb-4">How can I help you today?</p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Ask about properties..."
            className="flex-1 p-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
