import { ReactNode, useState } from "react";
import { Link } from "wouter";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import InfoModal from "@/components/info-modal";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-[#2E7D32] text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-bold cursor-pointer">nps rank</h1>
            </Link>
          </div>
          <div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-[#2196F3] hover:bg-[#1976D2] text-white"
              onClick={() => setShowInfoModal(true)}
            >
              <Info className="mr-1 h-4 w-4" />
              Info
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      {children}

      {/* Footer */}
      <footer className="bg-[#1B5E20] text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            NPS Rank uses the ELO rating system to rank national parks based on user votes.
          </p>
          <p className="text-xs mt-2">
            © {new Date().getFullYear()} NPS Rank - All national park data from the National Park Service.
          </p>
        </div>
      </footer>

      {/* Info Modal */}
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </div>
  );
}
