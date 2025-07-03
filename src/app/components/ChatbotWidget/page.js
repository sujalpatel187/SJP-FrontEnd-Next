'use client';

import React, { useState, useRef, useEffect } from 'react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I assist you today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Scroll to bottom when chat is opened
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen]);

  const isLongMessage = (text) => {
    const lines = text.split('\n');
    return lines.length > 5 || text.length > 300;
  };

  const truncateMessage = (text) => {
    const lines = text.split('\n');
    if (lines.length > 5) {
      return lines.slice(0, 5).join('\n');
    }
    if (text.length > 300) {
      return text.substring(0, 300);
    }
    return text;
  };

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/askquery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputValue }),
      });

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || "I apologize, but I'm unable to process your request at the moment.",
        sender: "bot"
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm experiencing connectivity issues. Please try again.",
        sender: "bot"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[420px] h-[580px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in">
          
          {/* Header with Glassmorphism Effect */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-xl border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-indigo-400/20 backdrop-blur-sm"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl tracking-tight">SJP Assistant</h3>
                  <p className="text-white/80 text-sm font-medium">Online now</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleChat}
                  className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages Container with Custom Scrollbar */}
          <div className="h-[380px] overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/80 backdrop-blur-sm scrollbar-thin scrollbar-thumb-slate-300/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-400/70">
            {messages.map((message, index) => {
              const isExpanded = expandedMessages.has(message.id);
              const shouldShowExpandButton = message.sender === 'bot' && isLongMessage(message.text);
              const displayText = shouldShowExpandButton && !isExpanded 
                ? truncateMessage(message.text) 
                : message.text;

              return (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-50 slide-in-from-bottom-2`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-[280px] px-5 py-3 text-sm leading-relaxed relative ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-3xl rounded-br-lg shadow-xl shadow-purple-500/30 border border-white/10'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 rounded-3xl rounded-bl-lg shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-200'
                    }`}
                  >
                    {message.sender === 'user' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl rounded-br-lg pointer-events-none"></div>
                    )}
                    <div className="relative z-10">
                      <div className="whitespace-pre-wrap">{displayText}</div>
                      {shouldShowExpandButton && (
                        <button
                          onClick={() => toggleMessageExpansion(message.id)}
                          className="mt-2 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200 flex items-center space-x-1"
                        >
                          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                          <svg 
                            className={`w-3 h-3 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start animate-in fade-in-50 slide-in-from-bottom-2">
                <div className="bg-white/90 backdrop-blur-sm text-slate-700 rounded-3xl rounded-bl-lg shadow-lg border border-slate-200/50 px-5 py-3 max-w-[280px]">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="px-6 py-5 bg-white/90 backdrop-blur-xl border-t border-slate-200/30">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-5 py-4 bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400/50 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 rounded-2xl pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="relative p-4 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 relative z-10 transform group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Toggle Button */}
      <button
        onClick={toggleChat}
        className="relative w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center group hover:scale-110 overflow-hidden"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-3 right-3 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-4 right-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Icon with smooth transitions */}
        <div className="relative z-10">
          {isOpen ? (
            <svg className="w-6 h-6 transition-all duration-300 transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 transition-all duration-300 transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </div>

        {/* Pulse ring effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-white/30 scale-100 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      </button>

      {/* Enhanced Notification Indicator */}
      {!isOpen && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center">
          <div className="relative">
            <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg border-2 border-white animate-pulse"></div>
            <div className="absolute inset-0 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-1 w-3 h-3 bg-white/90 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;