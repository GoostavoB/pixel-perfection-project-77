import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo-new.png";

const Header = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="Hospital Bill Checker" 
              className="h-12 w-auto group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              Hospital Bill Checker
            </span>
          </Link>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center px-2">
                  Home
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/upload" className="text-sm font-medium text-foreground hover:text-primary transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center px-2">
                  Upload Bill
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center px-2">
                  Blog
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/faq" className="text-sm font-medium text-foreground hover:text-primary transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center px-2">
                  FAQ
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center px-2">
                  Contact
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium bg-transparent hover:bg-transparent min-h-[48px]">
                  Useful Links
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-1 p-4 bg-card z-50">
                    {usefulLinks.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="block select-none rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground min-h-[48px] flex items-center"
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

          {session ? (
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="hidden lg:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className="hidden lg:flex">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
