import { Button } from "@/components/ui/button";
import { Park } from "@shared/schema";

interface ParkCardProps {
  park: Park;
  onVote: () => void;
  disabled?: boolean;
}

export default function ParkCard({ park, onVote, disabled = false }: ParkCardProps) {
  return (
    <div className="park-card w-full md:w-5/12 bg-white rounded-lg overflow-hidden shadow-lg border border-neutral-200 transition-transform hover:translate-y-[-4px]">
      <div className="relative">
        <img 
          src={park.imageUrl}
          alt={`${park.name} National Park`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center">
            <span className="w-6 h-6 mr-2 text-center">{park.icon}</span>
            <h3 className="text-white font-medium">{park.name}</h3>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-neutral-700 line-clamp-3">
          {park.description}
        </p>
        <div className="flex mt-3 justify-between items-center">
          <span className="bg-neutral-200 text-neutral-800 text-xs px-3 py-1 rounded-full">
            Established {park.establishedYear}
          </span>
          <span className="bg-neutral-200 text-neutral-800 text-xs px-3 py-1 rounded-full">
            Rank #{park.previousRank || '—'}
          </span>
        </div>
      </div>
      
      <Button 
        onClick={onVote}
        disabled={disabled}
        className="w-full rounded-none bg-[#2196F3] hover:bg-[#1976D2] h-12 font-medium"
      >
        Vote
      </Button>
    </div>
  );
}
