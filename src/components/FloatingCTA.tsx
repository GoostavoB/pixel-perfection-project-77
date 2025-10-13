import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, FileSearch } from "lucide-react";
import { Button } from "./ui/button";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Pages where the button should NOT appear
  const excludedPaths = [
    "/",
    "/upload",
    "/user-form",
    "/processing",
    "/results",
    "/generate-letter",
  ];

  const shouldShow = !excludedPaths.includes(location.pathname) && isVisible;

  useEffect(() => {
    // Reset visibility when route changes
    setIsVisible(true);
    setIsClosing(false);
  }, [location.pathname]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleClick = () => {
    navigate("/");
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  };

  if (!shouldShow) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="relative bg-primary text-primary-foreground rounded-full shadow-elegant hover:shadow-xl transition-all duration-300 animate-fade-in">
        <Button
          onClick={handleClick}
          className="h-auto py-4 px-6 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-200 flex items-center gap-2"
          size="lg"
        >
          <FileSearch className="h-5 w-5" />
          <span className="hidden sm:inline">Check Your Bill for Errors Now</span>
          <span className="sm:hidden">Check Bill</span>
        </Button>
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-accent transition-colors duration-200 shadow-md"
          aria-label="Close"
        >
          <X className="h-3 w-3 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default FloatingCTA;
