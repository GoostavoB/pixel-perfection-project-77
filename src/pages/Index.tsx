import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6 animate-fade-in">
          Welcome to Hospital Bill Checker
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
          Review your medical bills, identify overcharges, and get your dispute letters generated automatically.
        </p>
        
        <div className="flex gap-4 justify-center animate-fade-in">
          <Link to="/upload">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Upload Your Bill
            </Button>
          </Link>
          <Link to="/results">
            <Button size="lg" variant="outline">
              View Sample Results
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">80% Error Rate</h3>
            <p className="text-muted-foreground">Most hospital bills contain overcharges or billing errors</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">Free Analysis</h3>
            <p className="text-muted-foreground">Get detailed bill analysis and dispute letters at no cost</p>
          </div>
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">$650-$2,800</h3>
            <p className="text-muted-foreground">Average savings per successfully disputed bill</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
