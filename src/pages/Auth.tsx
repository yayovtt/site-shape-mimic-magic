
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
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "פרטי ההתחברות שגויים. אנא בדוק את האימייל והסיסמה";
        } else if (error.message.includes("User already registered")) {
          errorMessage = "המשתמש כבר רשום במערכת. נסה להתחבר במקום להירשם";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים";
        } else if (error.message.includes("Unable to validate email address")) {
          errorMessage = "כתובת האימייל לא תקינה";
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
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="text-right"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                סיסמה
              </label>
              <Input
                id="password"
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="text-right"
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
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
              }}
              disabled={loading}
            >
              {isLogin ? "אין לך חשבון? הירשם" : "יש לך חשבון? התחבר"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
