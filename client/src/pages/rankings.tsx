import { useRankedParks } from "@/hooks/use-parks";
import RankingsTable from "@/components/rankings-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Rankings() {
  const { rankedParks, isLoading } = useRankedParks();
  
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Voting
          </Button>
        </Link>
        <h1 className="text-2xl font-medium">Complete Park Rankings</h1>
      </div>
      
      <section className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-neutral-800">All Parks Ranked by ELO Score</h2>
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-neutral-800">score</h3>
            <h3 className="text-lg font-medium text-neutral-800">change</h3>
          </div>
        </div>
        
        {isLoading ? (
          // Loading state
          Array(10).fill(0).map((_, i) => (
            <div key={i} className="border-t border-neutral-200 py-3">
              <Skeleton className="h-8 w-full" />
            </div>
          ))
        ) : (
          <RankingsTable parks={rankedParks || []} />
        )}
      </section>
    </main>
  );
}
