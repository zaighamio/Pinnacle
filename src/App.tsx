import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Explore from './pages/Explore';
import Create from './pages/Create';
import AgentDetails from './pages/AgentDetails';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/30 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          Pinnacle
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/explore" className="text-on-surface hover:text-primary transition-colors font-medium">Explore</Link>
          <Link to="/create" className="text-on-surface hover:text-primary transition-colors font-medium">Create</Link>
          <ConnectButton />
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="py-8 text-center text-secondary text-sm border-t border-outline-variant/30 mt-auto bg-white/30">
        &copy; {new Date().getFullYear()} Pinnacle Marketplace. All rights reserved.
      </footer>
    </div>
  );
}

function Home() {
  return (
    <div className="text-center py-20 lg:py-32">
      <div className="inline-block bg-primary/10 text-primary font-bold px-4 py-2 rounded-full text-sm mb-8">
        Live on GIWA Sepolia
      </div>
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Discover the Best<br/><span className="text-primary">AI Agents</span></h1>
      <p className="text-xl text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
        Buy, sell, and deploy curated autonomous agents on the GIWA Sepolia network. The future of AI interaction is decentralized.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/explore" className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container transition-colors shadow-glow text-lg">
          Explore Market
        </Link>
        <Link to="/create" className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-bright transition-colors text-lg">
          List an Agent
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Create />} />
          <Route path="/agent/:id" element={<AgentDetails />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
