// src/components/ChatBox.tsx

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Message } from '../types';
import { FiSend } from 'react-icons/fi';

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([{ user: 'ChatBot', text: 'Hi, how can i assist you today?' }]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false); // State to manage typing animation
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { user: 'User', text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true); // Start typing animation

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat`, { message: input });
      const botMessage: Message = { user: 'ChatBot', text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = { user: 'ChatBot', text: 'Sorry, something went wrong!' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false); // Stop typing animation
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[400px] w-full p-3 rounded-xl border border-gray-300 shadow-lg bg-white">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.user === 'User' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`p-2 rounded-lg max-w-[80%] text-sm text-start ${
                msg.user === 'User' ? 'bg-blue-200 text-gray-800' : 'bg-green-900 text-white-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="p-2 rounded-lg max-w-[80%] text-sm text-start bg-gray-300 text-gray-700">
              {isTyping ? (
                <div className="typing-indicator">
                  <span className='italic'>Typing...</span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                '...'
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center mt-2 border-t pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full text-black p-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className={`ml-2 p-2 text-white rounded-lg ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={isLoading}
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;