
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    console.log("Starting authentication process:", { isLogin, email });

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      console.log("Authentication result:", { error });

      if (error) {
        console.error("Authentication error:", error);
        
        // Handle specific error messages
        let errorMessage = error.message || "שגיאה לא ידועה";
        
        if (error.message && error.message.includes("Invalid login credentials")) {
          errorMessage = "פרטי ההתחברות שגויים. אנא בדוק את האימייל והסיסמה";
        } else if (error.message && error.message.includes("User already registered")) {
          errorMessage = "המשתמש כבר רשום במערכת. נסה להתחבר במקום להירשם";
          // Switch to login mode automatically
          setIsLogin(true);
        } else if (error.message && error.message.includes("Password should be at least")) {
          errorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים";
        } else if (error.message && error.message.includes("Unable to validate email address")) {
          errorMessage = "כתובת האימייל לא תקינה";
        } else if (error.message && error.message.includes("Database error")) {
          errorMessage = "יש בעיה זמנית במערכת. אנא נסה שוב מאוחר יותר";
        } else if (error.message && error.message.includes("יש בעיה זמנית במערכת")) {
          errorMessage = error.message;
        }
        
        toast({
          title: "שגיאה",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log("Authentication successful, navigating to home");
        toast({
          title: isLogin ? "התחברת בהצלחה" : "נרשמת בהצלחה",
          description: isLogin ? "ברוך הבא!" : "ברוך הבא למערכת!",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Authentication catch error:", error);
      toast({
        title: "שגיאה",
        description: "משהו השתבש. אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    // Clear any error states
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "התחברות" : "הרשמה"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                אימייל
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="text-right"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                סיסמה
              </label>
              <Input
                id="password"
                type="password"
                placeholder="לפחות 6 תווים"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="text-right"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600"
              disabled={loading}
            >
              {loading ? "מעבד..." : (isLogin ? "התחבר" : "הירשם")}
            </Button>
          </form>
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={switchMode}
              disabled={loading}
              className="text-pink-600 hover:text-pink-700"
            >
              {isLogin ? "אין לך חשבון? הירשם כאן" : "יש לך חשבון? התחבר כאן"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
