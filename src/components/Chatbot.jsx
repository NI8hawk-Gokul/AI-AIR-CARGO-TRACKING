import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, Bot, User, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { trackShipment, getAIDelayPredictions, runShipmentAIAnalysis } from '../services/dataService';

export default function Chatbot() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hello! I am your AI Logistics Assistant. Ask me about any shipment (e.g., 157-89692853) or upload a document.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const lowercaseInput = currentInput.toLowerCase();
    const awbMatch = currentInput.match(/(\d{3}-\d{8})|([A-Z]{2,3}\d{4,8})|(\d{8,11})/i);

    if (awbMatch) {
      const foundAwb = awbMatch[0];
      try {
        const result = await trackShipment(foundAwb);
        let aiResponse = '';
        if (result.success) {
          let d = result.data;
          
          if (d.status !== 'Delivered' && d.status !== 'Arrived' && !d.aiAnalysisRun) {
            d = await runShipmentAIAnalysis(d.awb);
          }

          const lastEvent = d.events[d.events.length - 1];
          aiResponse = `**Real-Time Data for ${d.awb}:**
          
• **Carrier:** ${d.carrier}
• **Status:** ${d.status}
• **Route:** ${d.origin} ➔ ${d.destination}
• **Weight/Pieces:** ${d.weight} / ${d.pieces}
• **Latest Update:** ${lastEvent.status} at ${lastEvent.location} (${lastEvent.time})`;

          if (d.status !== 'Delivered' && d.status !== 'Arrived' && d.delayRisk && d.delayRisk !== 'None') {
            aiResponse += `\n• **AI Delay Prediction:** ${d.delayRisk} (Reason: ${d.delayReason || 'N/A'})`;
          }
        } else {
          aiResponse = `I searched the carrier databases for **${foundAwb}**, but no active record was found. It might be an older shipment that has been archived, or the number might be incorrect.`;
        }
        setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: aiResponse }]);
      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: "I'm having trouble connecting to the tracking servers right now. Please try again in a moment." }]);
      }
    } else {
      setTimeout(async () => {
        let aiResponse = '';
        if (lowercaseInput.includes('delay') || lowercaseInput.includes('status')) {
          const activePredictions = await getAIDelayPredictions();
          if (activePredictions.length > 0) {
            const delayDetails = activePredictions.map(p => `• **Flight ${p.flight}** (${p.awb}) has a **${p.prob} delay risk** (Reason: ${p.reason})`).join('\n');
            aiResponse = `Currently, the following active flights are flagged with delay risks:\n\n${delayDetails}`;
          } else {
            aiResponse = "Currently, all shipments are operating normally with no active delay risks predicted.";
          }
        } else if (lowercaseInput.includes('client') || lowercaseInput.includes('who')) {
          aiResponse = "I can fetch client details for any shipment. Please provide the AWB number.";
        } else {
          aiResponse = "I've analyzed your request. I can track any shipment if you provide the AWB number (e.g. 157-89692853). How else can I help?";
        }
        setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: aiResponse }]);
      }, 1000);
    }
    setIsTyping(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: `Uploaded File: ${file.name}` }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: `Successfully parsed **${file.name}**. I found shipment data for **Apex Mfg** (PVG to FRA). Would you like to view the full details?` }]);
      setIsTyping(false);
    }, 1800);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-[10000] animate-pulse"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden z-[10000] border ${theme === 'dark' ? 'bg-[#1a1a24] border-gray-800' : 'bg-white border-gray-200'}`}>
          
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold text-sm">AI Cargo Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Area with explicit overflow and scroll behavior */}
          <div className={`flex-1 p-4 overflow-y-auto flex flex-col gap-4 scroll-smooth ${theme === 'dark' ? 'bg-[#0f0f17]' : 'bg-gray-50'}`} style={{ WebkitOverflowScrolling: 'touch' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 max-w-[90%] ${msg.type === 'user' ? 'self-end flex-row-reverse' : 'self-start animate-fade-in'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-xl text-sm leading-snug whitespace-pre-wrap ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : theme === 'dark' ? 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 self-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className={`p-3 rounded-xl rounded-tl-none text-xs text-gray-500 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border'}`}>
                  AI is searching databases...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t shrink-0 ${theme === 'dark' ? 'bg-[#1a1a24] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#0f0f17] border-gray-700' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'}`}>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-blue-600 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type AWB or ask a question..."
                className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-inherit"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-all shadow-md shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



