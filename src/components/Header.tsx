import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.png";

const Header = () => {
  const usefulLinks = [
    { label: "No Surprises Act", path: "/no-surprises-act" },
    { label: "Dispute Letter", path: "/dispute-letter" },
    { label: "Voice Call Script", path: "/call-script" },
    { label: "Disputed Codes", path: "/disputed-codes" },
    { label: "Credit Report Impact", path: "/credit-report" },
    { label: "How Long on Credit Report", path: "/how-long-medical-bills" },
    { label: "Emergency Room Charges", path: "/emergency-room-charges" },
    { label: "Medical Collections", path: "/medical-billing-collections" },
    { label: "Hospital Billing Scoreboard", path: "/scoreboard", comingSoon: true },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={logo} 
              alt="Hospital Bill Checker" 
              className="h-20 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/upload" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Upload Bill
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium bg-transparent hover:bg-transparent">
                  Useful Links
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-1 p-4 bg-card">
                    {usefulLinks.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none flex items-center gap-2">
                            {link.label}
                            {link.comingSoon && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Soon
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
