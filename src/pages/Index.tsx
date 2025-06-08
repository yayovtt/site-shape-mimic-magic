import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Target, Calendar, MessageSquare, Trophy, Clock, LogOut, Menu, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { TranscriptionManager } from "@/components/TranscriptionManager";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl">טוען...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const features = [
    {
      title: "משימות",
      description: "נהל את המשימות שלך בצורה יעילה",
      icon: CheckSquare,
      color: "bg-blue-500",
      path: "/tasks"
    },
    {
      title: "יעדים",
      description: "הגדר והשג את היעדים שלך",
      icon: Target,
      color: "bg-green-500",
      path: "/goals"
    },
    {
      title: "פגישות",
      description: "תזמן ונהל פגישות בקלות",
      icon: Calendar,
      color: "bg-purple-500",
      path: "/meetings"
    },
    {
      title: "צ'אט AI",
      description: "שוחח עם עוזר AI חכם",
      icon: MessageSquare,
      color: "bg-pink-500",
      path: "/chat"
    },
    {
      title: "הישגים",
      description: "עקוב אחר ההתקדמות שלך",
      icon: Trophy,
      color: "bg-yellow-500",
      path: "/achievements"
    },
    {
      title: "לוח זמנים",
      description: "תכנן את היום שלך",
      icon: Clock,
      color: "bg-indigo-500",
      path: "/schedules"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex justify-end items-center mb-8">
          <div className="flex items-center gap-4">
            {/* Additional Features Menu */}
            <Button
              onClick={() => navigate("/tools")}
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-green-100 border-purple-200 hover:from-purple-200 hover:to-green-200"
            >
              <Settings className="w-5 h-5" />
              כלים נוספים
              <Menu className="w-4 h-4" />
            </Button>

            {/* Logout Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </Button>
          </div>
        </div>

        {/* Main Transcription Section - Full Page */}
        <div className="w-full">
          <TranscriptionManager />
        </div>
      </div>
    </div>
  );
};

export default Index;
