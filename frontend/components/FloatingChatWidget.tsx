'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show welcome popup after 1.5 seconds on every page load
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 1500);

    // Auto-hide welcome popup after 6 seconds
    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 7500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setShowWelcome(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Welcome Popup */}
      {showWelcome && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-bounce-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-xs relative">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">
                  Hey! I'm PropLens AI Assistant 👋
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Ask me anything about our properties, amenities, or schedule a viewing!
                </p>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute bottom-[-8px] right-8 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
        </div>
      )}

      {/* Chat Window */}
      <div
        ref={chatRef}
        className={`fixed bottom-24 right-6 w-[420px] h-[600px] z-50 transition-all duration-300 transform origin-bottom-right ${isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
          }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">PropLens AI</h3>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow />
          </div>
        </div>
      </div>

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
        >
          <MessageCircle size={28} className="text-white" />
          {/* Pulse effect */}
          <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-75"></span>
        </button>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
