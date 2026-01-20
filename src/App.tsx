import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrapProvider } from "@/context/ScrapContext";
import Landing from "./pages/Landing";
import SellScrap from "./pages/SellScrap";
import PriceEstimation from "./pages/PriceEstimation";
import Scheduling from "./pages/Scheduling";
import Payment from "./pages/Payment";
import Receipt from "./pages/Receipt";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ScrapProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/sell" element={<SellScrap />} />
            <Route path="/estimate" element={<PriceEstimation />} />
            <Route path="/schedule" element={<Scheduling />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ScrapProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
