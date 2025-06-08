
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Chat from "./pages/Chat";
import Goals from "./pages/Goals";
import Meetings from "./pages/Meetings";
import Schedules from "./pages/Schedules";
import Achievements from "./pages/Achievements";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Tools from "./pages/Tools";
import TranscriptionComparison from "./pages/TranscriptionComparison";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/schedules" element={<Schedules />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/transcription-comparison" element={<TranscriptionComparison />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
