
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Target, Calendar, MessageSquare, Trophy, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { MediaUploader } from "@/components/MediaUploader";
import { QuickStats } from "@/components/QuickStats";
import { useToast } from "@/hooks/use-toast";

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

  const handleVoiceTranscription = (text: string) => {
    toast({
      title: "תמלול הושלם!",
      description: `הטקסט שתומלל: ${text}`,
    });
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ברוך הבא למערכת ניהול האישי שלך
            </h1>
            <p className="text-lg text-gray-600">
              נהל משימות, יעדים ופגישות במקום אחד
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </Button>
        </div>

        {/* Quick Stats Section */}
        <QuickStats onNavigate={navigate} />

        {/* Voice Recorder Section */}
        <Card className="mb-8" dir="rtl">
          <CardHeader>
            <CardTitle>תמלול קול מהיר</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">הקלט קול לתמלול מהיר:</p>
              <VoiceRecorder onTranscription={handleVoiceTranscription} />
            </div>
          </CardContent>
        </Card>

        {/* Media Upload Section */}
        <div className="mb-8">
          <MediaUploader onTranscription={handleVoiceTranscription} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
