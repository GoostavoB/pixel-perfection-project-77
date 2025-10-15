import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import FloatingCTA from "@/components/FloatingCTA";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import Auth from "./pages/Auth";
import AuthGuard from "./components/AuthGuard";
import NewResults from "./pages/NewResults";
import ResultsV2 from "./pages/ResultsV2";
import UserForm from "./pages/UserForm";
import Blog from "./pages/Blog";
import MedicalDebtCreditReport from "./pages/blog/MedicalDebtCreditReport";
import RemoveMedicalBills from "./pages/blog/RemoveMedicalBills";
import MedicalDebtCreditImpact from "./pages/blog/MedicalDebtCreditImpact";
import HowLongMedicalBillsStay from "./pages/blog/HowLongMedicalBillsStay";
import MedicalBillingCollections from "./pages/blog/MedicalBillingCollections";
import EmergencyRoomCharges from "./pages/blog/EmergencyRoomCharges";
import NoSurprisesAct from "./pages/NoSurprisesAct";
import DisputeLetter from "./pages/DisputeLetter";
import CallScript from "./pages/CallScript";
import DisputedCodes from "./pages/DisputedCodes";
import CreditReport from "./pages/CreditReport";
import HowLongMedicalBills from "./pages/HowLongMedicalBills";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Scoreboard from "./pages/Scoreboard";
import GenerateLetter from "./pages/GenerateLetter";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import ApiTokens from "./pages/ApiTokens";

// Query client for React Query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <FloatingCTA />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/upload" element={<AuthGuard><Upload /></AuthGuard>} />
          <Route path="/processing" element={<AuthGuard><Processing /></AuthGuard>} />
          <Route path="/form" element={<AuthGuard><UserForm /></AuthGuard>} />
          <Route path="/results" element={<AuthGuard><Results /></AuthGuard>} />
          <Route path="/results-old" element={<AuthGuard><NewResults /></AuthGuard>} />
          <Route path="/results-v2" element={<AuthGuard><ResultsV2 /></AuthGuard>} />
          <Route path="/dispute-letter" element={<AuthGuard><DisputeLetter /></AuthGuard>} />
          <Route path="/generate-letter" element={<AuthGuard><GenerateLetter /></AuthGuard>} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/medical-debt-credit-report" element={<MedicalDebtCreditReport />} />
          <Route path="/blog/remove-medical-bills-credit" element={<RemoveMedicalBills />} />
          <Route path="/blog/medical-debt-credit-impact" element={<MedicalDebtCreditImpact />} />
          <Route path="/blog/how-long-medical-bills-stay" element={<HowLongMedicalBillsStay />} />
          <Route path="/blog/medical-billing-collections" element={<MedicalBillingCollections />} />
          <Route path="/blog/emergency-room-charges" element={<EmergencyRoomCharges />} />
          <Route path="/no-surprises-act" element={<NoSurprisesAct />} />
          <Route path="/call-script" element={<CallScript />} />
          <Route path="/disputed-codes" element={<DisputedCodes />} />
          <Route path="/credit-report" element={<CreditReport />} />
          <Route path="/how-long-medical-bills" element={<HowLongMedicalBills />} />
          <Route path="/emergency-room-charges" element={<EmergencyRoomCharges />} />
          <Route path="/medical-billing-collections" element={<MedicalBillingCollections />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/scoreboard" element={<AuthGuard><Scoreboard /></AuthGuard>} />
          <Route path="/api-tokens" element={<AuthGuard><ApiTokens /></AuthGuard>} />
          <Route path="/faq" element={<FAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
