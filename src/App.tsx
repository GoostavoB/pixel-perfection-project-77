import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import UserForm from "./pages/UserForm";
import Blog from "./pages/Blog";
import MedicalDebtCreditReport from "./pages/blog/MedicalDebtCreditReport";
import NoSurprisesAct from "./pages/NoSurprisesAct";
import DisputeLetter from "./pages/DisputeLetter";
import CallScript from "./pages/CallScript";
import DisputedCodes from "./pages/DisputedCodes";
import CreditReport from "./pages/CreditReport";
import Scoreboard from "./pages/Scoreboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/form" element={<UserForm />} />
          <Route path="/results" element={<Results />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/medical-debt-credit-report" element={<MedicalDebtCreditReport />} />
          <Route path="/no-surprises-act" element={<NoSurprisesAct />} />
          <Route path="/dispute-letter" element={<DisputeLetter />} />
          <Route path="/call-script" element={<CallScript />} />
          <Route path="/disputed-codes" element={<DisputedCodes />} />
          <Route path="/credit-report" element={<CreditReport />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
