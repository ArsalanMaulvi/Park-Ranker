import { useState } from "react";
import { useParkPair, useVote, useRankedParks, useRecentVotes } from "@/hooks/use-parks";
import ParkCard from "@/components/park-card";
import VsBadge from "@/components/vs-badge";
import RankingsTable from "@/components/rankings-table";
import RecentVotes from "@/components/recent-votes";
import InfoModal from "@/components/info-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Home() {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { toast } = useToast();
  
  // Fetch park pair for voting
  const { parkPair, isLoading: isPairLoading, refetch: refetchPair } = useParkPair();
  
  // Fetch rankings
  const { rankedParks, isLoading: isRankingsLoading } = useRankedParks();
  
  // Fetch recent votes
  const { recentVotes, isLoading: isVotesLoading } = useRecentVotes();
  
  // Vote mutation
  const voteMutation = useVote();

  // Handle voting for a park
  const handleVote = async (winnerId: number, loserId: number) => {
    try {
      await voteMutation.mutateAsync({ winnerId, loserId });
      
      // Show success message
      toast({
        title: "Vote recorded!",
        description: "Your vote has been counted and rankings updated.",
      });
      
      // Fetch a new pair for next vote
      refetchPair();
    } catch (error) {
      toast({
        title: "Error recording vote",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Vote Section */}
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-center text-2xl font-medium text-neutral-800">
            Which park would you rather visit?
          </h2>
        </div>

        <div className="relative flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
          {isPairLoading ? (
            // Loading state for park pair
            <>
              <div className="w-full md:w-5/12">
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
              <VsBadge />
              <div className="w-full md:w-5/12">
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            </>
          ) : parkPair ? (
            // Park comparison cards
            <>
              <ParkCard
                park={parkPair.park1}
                onVote={() => handleVote(parkPair.park1.id, parkPair.park2.id)}
                disabled={voteMutation.isPending}
              />
              <VsBadge />
              <ParkCard
                park={parkPair.park2}
                onVote={() => handleVote(parkPair.park2.id, parkPair.park1.id)}
                disabled={voteMutation.isPending}
              />
            </>
          ) : (
            // Error state
            <div className="text-center py-10">
              <p className="text-red-500">Failed to load parks. Please refresh the page.</p>
              <Button onClick={() => refetchPair()} className="mt-4">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Rankings Section */}
      <section className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-neutral-800">rankings</h2>
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-neutral-800">score</h3>
            <h3 className="text-lg font-medium text-neutral-800">change</h3>
          </div>
        </div>
        
        {isRankingsLoading ? (
          // Loading state for rankings
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="border-t border-neutral-200 py-3">
              <Skeleton className="h-8 w-full" />
            </div>
          ))
        ) : (
          // Display top 4 ranked parks
          <RankingsTable 
            parks={rankedParks?.slice(0, 4) || []}
            showAllButton={true}
          />
        )}
      </section>

      {/* Recent Votes Section */}
      <section className="mt-8 bg-white p-6 rounded-lg shadow-md border border-neutral-200">
        <h2 className="text-xl font-medium text-neutral-800 mb-4">Recent Votes</h2>
        
        {isVotesLoading ? (
          // Loading state for recent votes
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="border-t border-neutral-200 py-3">
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        ) : (
          <RecentVotes votes={recentVotes || []} />
        )}
      </section>

      {/* Info Modal */}
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </main>
  );
}
