// src/App.tsx


import React, { useState, useEffect } from 'react';
import { ChatContainer, ChatMessage } from './components/layout/ChatContainer';

// Mock patent data in markdown format
const PATENT_RESPONSE = `
# US Patent 11,484,922 B2: Advanced Quantum Resonance Generator

## Abstract
This patent describes a novel **quantum resonance generator** that achieves unprecedented energy efficiency through *topological quantum states*. The system demonstrates a 47.3% improvement in energy conversion efficiency compared to conventional systems.

## Key Innovations

- **Topological Insulator Core**: Utilizes bismuth selenide (Bi₂Se₃) nanolayers with quantum spin Hall effect
- **Resonance Modulation System**: Dynamically adjusts frequency using piezoelectric actuators
- **Entanglement Stabilization**: Maintains quantum coherence for >500μs at room temperature

![Quantum Resonance Core Diagram](https://placehold.co/800x400/3b82f6/ffffff?text=Quantum+Core+Diagram&font=montserrat)

## Performance Metrics

| Parameter          | Traditional | This Patent | Improvement |
|--------------------|-------------|-------------|-------------|
| Energy Efficiency  | 62.1%       | **85.9%**   | +23.8%      |
| Coherence Time     | 120μs       | **512μs**   | +327%       |
| Operating Temp     | -196°C      | **25°C**    | +221°C      |

## Implementation Details

The generator comprises three critical subsystems:

1. **Quantum State Preparation Module**: Creates entangled photon pairs using spontaneous parametric down-conversion
2. **Resonance Chamber**: Maintains topological states via [magnetic flux quantization](https://example.com/flux-quantization)
3. **Energy Harvesting Interface**: Converts quantum oscillations to electrical energy through *piezoelectric nanogenerators*

> **Note**: The system achieves zero-point energy extraction without violating thermodynamic principles through quantum vacuum fluctuations.

## Applications

- Next-generation **medical imaging devices** with 10x resolution improvement
- Ultra-precise [gravitational wave detectors](https://example.com/grav-waves)
- Compact fusion reactor control systems
- Quantum-secured communication networks

![Energy Conversion Process](https://placehold.co/600x300/10b981/ffffff?text=Energy+Conversion+Flow&font=montserrat)

## Claims

1. A quantum resonance generator comprising: 
   - a topological insulator core with Bi₂Se₃ nanolayers
   - piezoelectric frequency modulation system
   - quantum coherence stabilization mechanism

2. The generator of claim 1, wherein the coherence time exceeds 500μs at ambient temperatures.

3. The generator of claim 1, further comprising a zero-point energy extraction interface utilizing quantum vacuum fluctuations.
`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your Patent Knowledge Assistant. I can help you analyze and understand patent documents. What would you like to know today?",
        isUserMessage: false,
        timestamp: 'Just now'
      }
    ]);
  }, []);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUserMessage: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response after delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: PATENT_RESPONSE,
        isUserMessage: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Patent Knowledge Base Assistant</h1>
          </div>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Advanced quantum technology patent analyzer with semantic search capabilities
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - will be implemented in next step */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
              <h2 className="font-bold text-lg mb-4 text-gray-800">Patent Search</h2>
              <p className="text-gray-500">History and search functionality will be added in the next step</p>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <ChatContainer 
              messages={messages} 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gray-800 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">KB</span>
              </div>
              <span className="font-medium text-gray-700">Patent Knowledge Base v2.1</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2023 Patent Intelligence System. All patents analyzed are property of their respective owners.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;