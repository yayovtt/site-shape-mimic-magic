
import { ChatGPT } from "@/components/ChatGPT";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזור לדף הבית
          </Button>
          <Button variant="outline" onClick={signOut}>
            התנתק
          </Button>
        </div>
        <ChatGPT />
      </div>
    </div>
  );
};

export default Chat;
