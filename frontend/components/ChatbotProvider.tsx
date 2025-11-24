'use client';

import FloatingChatWidget from './FloatingChatWidget';
import { usePathname } from 'next/navigation';

export default function ChatbotProvider() {
  const pathname = usePathname();

  // Don't show chatbot on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return <FloatingChatWidget />;
}
