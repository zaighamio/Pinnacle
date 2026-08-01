import { useParams } from 'react-router-dom';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { pinnacleContractConfig } from '../lib/contract';
import { formatEther } from 'viem';
import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';

const PRICING_MODELS = ['Free', 'Per Call', 'Subscription'];

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const agentId = id ? BigInt(id) : 1n;
  const { address } = useAccount();

  const { data: agent, isLoading: isAgentLoading } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'getAgent',
    args: [agentId],
  });

  const { data: averageRating } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'getAverageRating',
    args: [agentId],
  });

  const { data: hasRated } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'hasRated',
    args: [agentId, address || '0x0000000000000000000000000000000000000000'],
  });

  const { data: isSubbed } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'isSubscriptionActive',
    args: [agentId, address || '0x0000000000000000000000000000000000000000'],
  });

  const { writeContractAsync: writeContract, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}`>();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [ratingInput, setRatingInput] = useState(50); // 1.0 to 5.0 (stored as 10 to 50)

  if (isAgentLoading || !agent) {
    return (
      <div className="max-w-4xl mx-auto py-10 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const [
    _aId, owner, categoryId, name, description, metadataURI,
    pricingModel, perCallFee, subscriptionFee, subscriptionDuration,
    createdAt, active, totalUses, ratingSum, ratingCount, balance
  ] = agent as any[];

  const handlePayPerCall = async () => {
    try {
      const hash = await writeContract({
        ...pinnacleContractConfig,
        functionName: 'payPerCall',
        args: [agentId],
        value: perCallFee,
      });
      setTxHash(hash);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribe = async () => {
    try {
      const hash = await writeContract({
        ...pinnacleContractConfig,
        functionName: 'subscribe',
        args: [agentId],
        value: subscriptionFee,
      });
      setTxHash(hash);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRate = async () => {
    try {
      const hash = await writeContract({
        ...pinnacleContractConfig,
        functionName: 'rateAgent',
        args: [agentId, BigInt(ratingInput)],
      });
      setTxHash(hash);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 lg:p-10 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-surface-dim rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-on-surface">
                {name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display">{name}</h1>
                <div className="flex items-center gap-2 text-secondary text-sm mt-1">
                  <span>By {owner.slice(0, 6)}...{owner.slice(-4)}</span>
                  <span>•</span>
                  <span>Category {Number(categoryId)}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-on-surface max-w-none">
              <h3 className="text-xl font-bold font-display mb-3">About this Agent</h3>
              <p className="text-secondary leading-relaxed">{description}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-outline-variant/30 flex gap-10">
              <div>
                <div className="text-sm text-secondary mb-1">Total Uses</div>
                <div className="text-2xl font-bold">{Number(totalUses)}</div>
              </div>
              <div>
                <div className="text-sm text-secondary mb-1">Rating</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {averageRating ? (Number(averageRating) / 10).toFixed(1) : 'N/A'}
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-normal text-secondary">({Number(ratingCount)})</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rate Section */}
          {address && !hasRated && (
             <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display">Rate this agent</h3>
                  <p className="text-secondary text-sm">Have you used this agent? Leave a rating.</p>
                </div>
                <div className="flex items-center gap-4">
                  <select 
                    value={ratingInput} 
                    onChange={e => setRatingInput(Number(e.target.value))}
                    className="bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-2"
                  >
                    <option value={50}>5.0 Stars</option>
                    <option value={40}>4.0 Stars</option>
                    <option value={30}>3.0 Stars</option>
                    <option value={20}>2.0 Stars</option>
                    <option value={10}>1.0 Stars</option>
                  </select>
                  <button 
                    onClick={handleRate}
                    disabled={isPending || isWaiting}
                    className="bg-on-surface text-white px-6 py-2 rounded-xl font-bold hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
             </div>
          )}

        </div>

        {/* Right Column: Interaction */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-glow sticky top-8">
            <h3 className="text-xl font-bold font-display mb-6 pb-4 border-b border-outline-variant/30">Pricing</h3>
            
            <div className="mb-8">
              <span className="inline-block bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg text-sm mb-4">
                {PRICING_MODELS[pricingModel]}
              </span>
              
              {pricingModel === 0 && (
                <div className="text-3xl font-bold">Free</div>
              )}
              {pricingModel === 1 && (
                <div>
                  <div className="text-3xl font-bold">{formatEther(perCallFee)} ETH</div>
                  <div className="text-secondary text-sm">per successful call</div>
                </div>
              )}
              {pricingModel === 2 && (
                <div>
                  <div className="text-3xl font-bold">{formatEther(subscriptionFee)} ETH</div>
                  <div className="text-secondary text-sm">per {Number(subscriptionDuration) / 86400} days</div>
                </div>
              )}
            </div>

            {address ? (
              <div className="space-y-4">
                {pricingModel === 0 && (
                   <button className="w-full bg-surface-dim text-on-surface py-4 rounded-xl font-bold hover:bg-surface-variant transition-colors">
                     Use Agent (Free)
                   </button>
                )}
                
                {pricingModel === 1 && (
                   <button 
                    onClick={handlePayPerCall}
                    disabled={isPending || isWaiting}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-container transition-colors shadow-active-glow disabled:opacity-50 flex justify-center items-center gap-2"
                   >
                     {(isPending || isWaiting) && <Loader2 className="w-4 h-4 animate-spin" />}
                     Pay & Use Agent
                   </button>
                )}

                {pricingModel === 2 && (
                   isSubbed ? (
                     <div className="bg-green-100 text-green-700 text-center py-4 rounded-xl font-bold">
                       Active Subscription
                     </div>
                   ) : (
                     <button 
                      onClick={handleSubscribe}
                      disabled={isPending || isWaiting}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-container transition-colors shadow-active-glow disabled:opacity-50 flex justify-center items-center gap-2"
                     >
                       {(isPending || isWaiting) && <Loader2 className="w-4 h-4 animate-spin" />}
                       Subscribe Now
                     </button>
                   )
                )}
                
                {isSuccess && (
                  <p className="text-green-600 text-center text-sm font-medium mt-2">Transaction Successful!</p>
                )}
              </div>
            ) : (
              <div className="text-center text-secondary text-sm bg-surface-bright p-4 rounded-xl border border-outline-variant/30">
                Connect your wallet to interact with this agent.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
