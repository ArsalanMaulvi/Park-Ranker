import { RankedPark } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface RankingsTableProps {
  parks: RankedPark[];
  showAllButton?: boolean;
}

export default function RankingsTable({ parks, showAllButton = false }: RankingsTableProps) {
  if (parks.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No rankings data available yet.
      </div>
    );
  }

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return <span className="text-[#4CAF50] w-8 text-center">↑ {change}</span>;
    } else if (change < 0) {
      return <span className="text-[#F44336] w-8 text-center">↓ {Math.abs(change)}</span>;
    } else {
      return <span className="text-[#9E9E9E] w-8 text-center">− 0</span>;
    }
  };

  return (
    <>
      {parks.map((park) => (
        <div key={park.id} className="border-t border-neutral-200 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-mono text-lg mr-3 text-neutral-700">{park.rank}</span>
            <span className="w-6 h-6 mr-2 text-center">{park.icon}</span>
            <span className="font-medium">{park.name}</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="font-mono">{park.eloScore}</span>
            {getRankChangeIndicator(park.rankChange)}
          </div>
        </div>
      ))}
      
      {showAllButton && (
        <div className="mt-4 text-center">
          <Link href="/rankings">
            <Button 
              className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded transition-colors duration-200 text-sm"
            >
              See All Rankings
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
