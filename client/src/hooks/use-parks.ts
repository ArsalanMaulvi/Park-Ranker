import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Park, RankedPark } from "@shared/schema";
import { calculateElo } from "@/lib/elo";

interface ParkPair {
  park1: Park;
  park2: Park;
}

interface VoteResult {
  updatedRanks: RankedPark[];
}

export function useParks() {
  // Get all parks
  const { data: parks, isLoading, error } = useQuery({
    queryKey: ["/api/parks"],
  });

  return {
    parks,
    isLoading,
    error,
  };
}

export function useRankedParks() {
  // Get ranked parks
  const { data: rankedParks, isLoading, error } = useQuery({
    queryKey: ["/api/parks/ranked"],
  });

  return {
    rankedParks,
    isLoading,
    error,
  };
}

export function useParkPair() {
  // Get a random pair of parks for voting
  const { 
    data: parkPair, 
    isLoading, 
    error,
    refetch
  } = useQuery<ParkPair>({
    queryKey: ["/api/parks/pair"],
  });

  return {
    parkPair,
    isLoading,
    error,
    refetch
  };
}

export function useVote() {
  // Submit a vote between two parks
  const voteMutation = useMutation({
    mutationFn: async ({ winnerId, loserId }: { winnerId: number; loserId: number }) => {
      // Get parks to calculate ELO
      const winnerResponse = await fetch(`/api/parks/${winnerId}`);
      const loserResponse = await fetch(`/api/parks/${loserId}`);
      
      if (!winnerResponse.ok || !loserResponse.ok) {
        throw new Error("Failed to get park data for ELO calculation");
      }
      
      const winner: Park = await winnerResponse.json();
      const loser: Park = await loserResponse.json();
      
      // Calculate new ELO ratings
      const { scoreDelta } = calculateElo(winner.score, loser.score);
      
      // Submit vote
      const response = await apiRequest("POST", "/api/votes", {
        winnerParkId: winnerId,
        loserParkId: loserId,
        scoreDelta,
      });
      
      return response.json();
    },
    onSuccess: (data: VoteResult) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/parks/ranked"] });
      queryClient.invalidateQueries({ queryKey: ["/api/votes/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parks/pair"] });
    },
  });

  return voteMutation;
}

export function useRecentVotes() {
  // Get recent votes
  const { data: recentVotes, isLoading, error } = useQuery({
    queryKey: ["/api/votes/recent"],
  });

  return {
    recentVotes,
    isLoading,
    error,
  };
}
