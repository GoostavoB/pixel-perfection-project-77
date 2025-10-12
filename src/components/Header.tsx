import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Upload Bill", path: "/upload" },
    { label: "Disputed Codes", path: "/codes" },
    { label: "Blog", path: "/blog" },
    { label: "No Surprises Act", path: "/act" },
    { label: "Credit Report", path: "/credit" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={logo} 
              alt="Hospital Bill Checker" 
              className="h-12 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 after:origin-left after:transition-transform hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
