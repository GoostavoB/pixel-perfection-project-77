import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="mb-4 text-6xl md:text-8xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl md:text-3xl font-bold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </a>
          <a 
            href="/upload" 
            className="inline-flex items-center justify-center px-6 py-3 bg-muted text-foreground font-semibold rounded-md hover:bg-muted/80 transition-colors"
          >
            Check Your Bill
          </a>
        </div>

        <div className="text-left bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Popular Pages:</h3>
          <ul className="space-y-2">
            <li>
              <a href="/faq" className="text-primary hover:underline">
                Frequently Asked Questions
              </a>
            </li>
            <li>
              <a href="/blog" className="text-primary hover:underline">
                Medical Billing Blog
              </a>
            </li>
            <li>
              <a href="/no-surprises-act" className="text-primary hover:underline">
                No Surprises Act Information
              </a>
            </li>
            <li>
              <a href="/contact" className="text-primary hover:underline">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
