import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { pinnacleContractConfig } from '../lib/contract';

// Pricing Model enum based on ABI (0 = Free, 1 = PerCall, 2 = Subscription)
const PRICING_MODELS = ['Free', 'Per Call', 'Subscription'];

function AgentCard({ id }: { id: bigint; key?: string }) {
  const { data: agent, isLoading } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'getAgent',
    args: [id],
  });

  const { data: averageRating } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'getAverageRating',
    args: [id],
  });

  if (isLoading || !agent) return (
    <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 h-64 animate-pulse">
      <div className="h-6 bg-surface-dim rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-surface-dim rounded w-full mb-2"></div>
      <div className="h-4 bg-surface-dim rounded w-5/6"></div>
    </div>
  );

  const [
    agentId, owner, categoryId, name, description, metadataURI,
    pricingModel, perCallFee, subscriptionFee, subscriptionDuration,
    createdAt, active, totalUses, ratingSum, ratingCount, balance
  ] = agent as any[];

  if (!active) return null;

  return (
    <Link to={`/agent/${id.toString()}`} className="block group">
      <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 hover:shadow-glow transition-all duration-300 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors line-clamp-1">{name}</h3>
          <span className="bg-surface-dim text-on-surface-variant text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            {PRICING_MODELS[pricingModel]}
          </span>
        </div>
        <p className="text-secondary text-sm mb-6 line-clamp-3 flex-1">{description}</p>
        
        <div className="flex items-center justify-between text-sm text-on-surface font-medium pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{averageRating ? (Number(averageRating) / 10).toFixed(1) : 'New'}</span>
            <span className="text-secondary font-normal text-xs ml-1">({Number(ratingCount)})</span>
          </div>
          <div>
            {Number(totalUses)} uses
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Explore() {
  const { data: agentCounter } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'agentCounter',
  });

  const totalAgents = agentCounter ? Number(agentCounter) : 0;
  
  // We'll reverse the array to show newest first
  const agentIds = Array.from({ length: totalAgents }, (_, i) => BigInt(i + 1)).reverse();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Explore Agents</h1>
          <p className="text-secondary text-lg">Discover and integrate autonomous AI agents into your workflow.</p>
        </div>
      </div>

      {agentIds.length === 0 ? (
        <div className="text-center py-20 text-secondary">
          No agents found on the marketplace yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentIds.map((id) => (
            <AgentCard key={id.toString()} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}
