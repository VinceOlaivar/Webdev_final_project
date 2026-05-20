import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import '../css/GlobalChat.css';

interface Message {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

export default function GlobalChat() {
  const { user, profile } = useAuth() as any;
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('global-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((current) => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch admin username if the user is an admin
  useEffect(() => {
    const fetchAdminUsername = async () => {
      if (user) {
        const { data } = await supabase.from('admins').select('username').eq('id', user.id).maybeSingle();
        if (data) {
          setAdminUsername(data.username);
        } else {
          setAdminUsername(null);
        }
      }
    };
    fetchAdminUsername();
  }, [user]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    await supabase.from('messages').insert([{
      user_id: user.id,
      username: adminUsername || profile?.username || user.email?.split('@')[0] || 'Player',
      content: messageText,
    }]);
  };

  return (
    <section className="global-chat-container">
      <div className="chat-header">
        <h2 className="chat-title">💬 Global Arcade Chat</h2>
      </div>
      <div className="messages-window">
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <span className="chat-username">{msg.username}</span>
            <span className="chat-content">{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {user ? (
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Say something to the lobby..." className="chat-input" maxLength={150} />
          <Button type="submit" size="sm">Send</Button>
        </form>
      ) : (
        <p className="chat-login-prompt">Sign in to join the conversation!</p>
      )}
    </section>
  );
}