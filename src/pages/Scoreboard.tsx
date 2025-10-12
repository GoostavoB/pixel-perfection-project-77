import { BarChart3, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

const Scoreboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <BarChart3 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Hospital Billing Scoreboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Comprehensive ratings and transparency scores for hospitals nationwide
            </p>
          </div>

          <Card className="p-12 md:p-16 animate-scale-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
              <Clock className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Coming Soon
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              We're building a comprehensive database of hospital billing transparency scores, error rates, and patient experiences. Check back soon!
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Transparency Scores</h3>
                <p className="text-sm text-muted-foreground">
                  How clear and accurate are hospital bills?
                </p>
              </div>
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Error Rates</h3>
                <p className="text-sm text-muted-foreground">
                  Percentage of bills with overcharges or mistakes
                </p>
              </div>
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Regional Comparisons</h3>
                <p className="text-sm text-muted-foreground">
                  How does your hospital compare to others?
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Scoreboard;
