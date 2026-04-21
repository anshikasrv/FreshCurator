'use client';
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface ChatProps {
  orderId: string;
}

interface Message {
  _id?: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt?: string;
}

export default function OrderChat({ orderId }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId || !session) return;
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:4000';
    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('get_history', orderId);
    socketRef.current.emit('join_order_room', orderId);

    socketRef.current.on('chat_history', (history: Message[]) => {
      setMessages(history);
    });

    socketRef.current.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [orderId, session]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    
    socketRef.current.emit('send_message', {
      orderId,
      senderName: session?.user?.name || 'User',
      senderRole: (session?.user as any)?.role || 'User',
      content: input
    });
    setInput('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-24 z-[50]">
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-2xl">forum</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[320px] sm:w-[360px] h-[450px] bg-white shadow-2xl rounded-3xl border border-outline-variant/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
      <div className="bg-secondary p-4 flex justify-between items-center text-white">
        <h3 className="font-headline font-bold flex items-center gap-2">
           <span className="material-symbols-outlined">support_agent</span>
           Order Chat
        </h3>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-container-lowest">
        {messages.length === 0 && <p className="text-center text-xs text-on-surface-variant my-10">No messages yet. Send one!</p>}
        {messages.map((m, i) => {
          const isMe = m.senderName === session?.user?.name;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
               <span className="text-[10px] text-on-surface-variant mb-0.5 px-1">{m.senderName} ({m.senderRole})</span>
               <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-secondary text-white rounded-tr-none' : 'bg-surface-container-low border border-outline-variant/10 rounded-tl-none'}`}>
                 {m.content}
               </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t bg-white">
        <div className="flex items-center gap-2 relative">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
          <button type="submit" disabled={!input.trim()} className="bg-secondary text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform absolute right-1">
             <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
