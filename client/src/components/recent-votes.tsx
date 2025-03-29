import { formatDistanceToNow } from "date-fns";

interface RecentVote {
  id: number;
  timestamp: string;
  winner: {
    id: number;
    name: string;
    imageUrl: string;
  };
  loser: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

interface RecentVotesProps {
  votes: RecentVote[];
}

export default function RecentVotes({ votes }: RecentVotesProps) {
  if (votes.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No votes recorded yet. Be the first to vote!
      </div>
    );
  }

  return (
    <>
      {votes.map((vote) => (
        <div key={vote.id} className="border-t border-neutral-200 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={vote.winner.imageUrl} alt={vote.winner.name} className="w-6 h-6 mr-2 object-cover rounded-full" />
              <span className="text-sm font-medium">{vote.winner.name}</span>
            </div>
            <div className="text-neutral-500 text-sm">defeated</div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{vote.loser.name}</span>
              <img src={vote.loser.imageUrl} alt={vote.loser.name} className="w-6 h-6 ml-2 object-cover rounded-full" />
            </div>
          </div>
          <div className="text-xs text-neutral-500 mt-1 text-right">
            {formatDistanceToNow(new Date(vote.timestamp), { addSuffix: true })}
          </div>
        </div>
      ))}
    </>
  );
}
