import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">About NPS Rank</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="mb-3">
            NPS Rank uses an ELO rating system to rank all 63 U.S. National Parks based on user votes.
          </p>
          <p className="mb-3">
            The ELO system was originally developed for chess rankings but works well for any head-to-head comparison. 
            When you vote for a park:
          </p>
          <ul className="list-disc list-inside mb-3 space-y-1 pl-2">
            <li>The winning park gains points</li>
            <li>The losing park loses points</li>
            <li>The amount of points transferred depends on the current ratings</li>
            <li>Upsets (lower ranked parks defeating higher ranked ones) result in larger point changes</li>
          </ul>
          <p>
            Vote for your favorite parks to help determine which national parks are truly the most beloved!
          </p>
        </DialogDescription>
        <DialogFooter>
          <Button 
            className="w-full bg-[#2196F3] hover:bg-[#1976D2]"
            onClick={onClose}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
