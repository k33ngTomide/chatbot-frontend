// src/App.tsx

import { useState } from 'react';
import './App.css';
import ChatBox from './components/ChatBox';
import CmsInterface from './components/CmsInterface';
import { BsChatDotsFill } from 'react-icons/bs';
import { AnimatePresence, motion } from 'framer-motion';

const App = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="App relative min-h-screen bg-gray-100 px-4 py-6">
      <h1 className="text-3xl text-center mb-6 font-bold text-blue-700">ChatBot and CMS</h1>

      {/* CMS is the main interface */}
      <CmsInterface />

      {/* Chat Icon Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50"
        aria-label="Toggle Chat"
      >
        <BsChatDotsFill size={24} />
      </button>

      {/* ChatBox Popup with Framer Motion */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="fixed bottom-20 right-6 w-80 bg-white border rounded-xl shadow-xl z-40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            <ChatBox />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
