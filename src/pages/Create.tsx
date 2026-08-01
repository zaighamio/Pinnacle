import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { pinnacleContractConfig } from '../lib/contract';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type PricingModel = '0' | '1' | '2'; // 0: Free, 1: PerCall, 2: Subscription

interface FormValues {
  categoryId: string;
  name: string;
  description: string;
  metadataURI: string;
  pricingModel: PricingModel;
  perCallFee: string; // in ETH
  subscriptionFee: string; // in ETH
  subscriptionDuration: string; // in days
}

export default function Create() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      pricingModel: '0',
      perCallFee: '0',
      subscriptionFee: '0',
      subscriptionDuration: '30',
    }
  });

  const pricingModel = watch('pricingModel');
  const categoryIdStr = watch('categoryId');

  // Fetch category count
  const { data: categoryCounter } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'categoryCounter',
  });
  
  // Since we don't have a getCategories array function easily, 
  // we'll fetch details when a category is selected. 
  // For simplicity, we assume categories 1 to N exist.
  const numCategories = categoryCounter ? Number(categoryCounter) : 0;
  const categories = Array.from({ length: numCategories }, (_, i) => i + 1);

  const { data: selectedCategoryData } = useReadContract({
    ...pinnacleContractConfig,
    functionName: 'getCategory',
    args: [categoryIdStr ? BigInt(categoryIdStr) : 1n],
    query: {
      enabled: !!categoryIdStr || numCategories > 0,
    }
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}`>();
  
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!selectedCategoryData) return;
      const category: any = selectedCategoryData;
      const listingFee = category.listingFee; // bigint

      const hash = await writeContractAsync({
        ...pinnacleContractConfig,
        functionName: 'requestListing',
        args: [
          BigInt(data.categoryId),
          data.name,
          data.description,
          data.metadataURI,
          Number(data.pricingModel),
          parseEther(data.pricingModel === '1' ? data.perCallFee : '0'),
          parseEther(data.pricingModel === '2' ? data.subscriptionFee : '0'),
          BigInt(data.pricingModel === '2' ? Number(data.subscriptionDuration) * 86400 : 0) // Convert days to seconds
        ],
        value: listingFee,
      });
      setTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold font-display mb-4">Connect Wallet to Create</h2>
        <p className="text-secondary">You need to connect your wallet to list an agent on the marketplace.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl border border-outline-variant/30 p-10 shadow-glow">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ✓
        </div>
        <h2 className="text-3xl font-bold font-display mb-4 text-on-surface">Request Submitted!</h2>
        <p className="text-secondary mb-8">
          Your agent listing request has been successfully submitted and is awaiting approval from platform admins.
        </p>
        <button 
          onClick={() => navigate('/explore')}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-display mb-2">List an Agent</h1>
        <p className="text-secondary text-lg">Submit your AI agent for review to be listed on the Pinnacle marketplace.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface">Agent Name</label>
              <input 
                {...register('name', { required: true })}
                className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. CodeReviewBot"
              />
              {errors.name && <span className="text-red-500 text-xs">This field is required</span>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface">Category</label>
              <select 
                {...register('categoryId', { required: true })}
                className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>Category {c}</option>
                ))}
              </select>
              {errors.categoryId && <span className="text-red-500 text-xs">This field is required</span>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Description</label>
            <textarea 
              {...register('description', { required: true })}
              className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 h-32 resize-none"
              placeholder="Describe what your agent does..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Metadata URI (Optional)</label>
            <input 
              {...register('metadataURI')}
              className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="ipfs://... or https://..."
            />
          </div>

          <div className="border-t border-outline-variant/30 pt-6">
            <h3 className="text-xl font-bold font-display mb-4">Pricing Strategy</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-on-surface">Pricing Model</label>
                <select 
                  {...register('pricingModel')}
                  className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="0">Free</option>
                  <option value="1">Pay Per Call</option>
                  <option value="2">Subscription</option>
                </select>
              </div>

              {pricingModel === '1' && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">Per Call Fee (ETH)</label>
                  <input 
                    {...register('perCallFee', { required: true })}
                    type="number"
                    step="0.000001"
                    className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              {pricingModel === '2' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">Subscription Fee (ETH)</label>
                    <input 
                      {...register('subscriptionFee', { required: true })}
                      type="number"
                      step="0.000001"
                      className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">Duration (Days)</label>
                    <input 
                      {...register('subscriptionDuration', { required: true })}
                      type="number"
                      className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isPending || isWaiting || !selectedCategoryData}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-container transition-colors shadow-active-glow disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {(isPending || isWaiting) && <Loader2 className="w-5 h-5 animate-spin" />}
              {isPending ? 'Confirming in Wallet...' : isWaiting ? 'Mining Transaction...' : 'Submit Agent Request'}
            </button>
            {selectedCategoryData && (
              <p className="text-center text-secondary text-sm mt-3">
                Listing fee: {Number((selectedCategoryData as any).listingFee) / 1e18} ETH
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
