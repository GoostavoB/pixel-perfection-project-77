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
          <Link to="/form">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
          <Link to="/results">
            <Button size="lg" variant="outline">
              View Sample Results
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
