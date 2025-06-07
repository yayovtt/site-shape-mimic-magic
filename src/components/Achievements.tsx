
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Calendar, Award, Users, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  points: number;
  earned: boolean;
  progress: number;
}

export const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  // Mock data for achievements since we don't have user authentication yet
  const mockAchievements: Achievement[] = [
    {
      id: "1",
      name: "משימה ראשונה",
      description: "השלמת המשימה הראשונה שלך",
      icon: "Trophy",
      condition_type: "tasks_completed",
      condition_value: 1,
      points: 10,
      earned: false,
      progress: 0
    },
    {
      id: "2", 
      name: "מפוקס משימות",
      description: "השלמת 5 משימות",
      icon: "Star",
      condition_type: "tasks_completed", 
      condition_value: 5,
      points: 25,
      earned: false,
      progress: 0
    },
    {
      id: "3",
      name: "מאסטר משימות", 
      description: "השלמת 20 משימות",
      icon: "Crown",
      condition_type: "tasks_completed",
      condition_value: 20,
      points: 50,
      earned: false,
      progress: 0
    },
    {
      id: "4",
      name: "יעד ראשון",
      description: "השגת היעד הראשון שלך", 
      icon: "Target",
      condition_type: "goals_achieved",
      condition_value: 1,
      points: 15,
      earned: false,
      progress: 0
    },
    {
      id: "5", 
      name: "מגיע ליעדים",
      description: "השגת 3 יעדים",
      icon: "Award", 
      condition_type: "goals_achieved",
      condition_value: 3,
      points: 35,
      earned: false,
      progress: 0
    },
    {
      id: "6",
      name: "פגישה ראשונה",
      description: "יצירת הפגישה הראשונה שלך",
      icon: "Calendar",
      condition_type: "meetings_created", 
      condition_value: 1,
      points: 10,
      earned: false,
      progress: 0
    },
    {
      id: "7",
      name: "מאורגן",
      description: "יצירת 10 פגישות",
      icon: "Users",
      condition_type: "meetings_created",
      condition_value: 10, 
      points: 40,
      earned: false,
      progress: 0
    }
  ];

  useEffect(() => {
    // Load achievements with mock progress
    const loadedAchievements = mockAchievements.map(achievement => ({
      ...achievement,
      progress: Math.floor(Math.random() * achievement.condition_value),
      earned: Math.random() > 0.7 // Random earned status for demo
    }));
    
    setAchievements(loadedAchievements);
    
    // Calculate total points from earned achievements
    const earnedPoints = loadedAchievements
      .filter(a => a.earned)
      .reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(earnedPoints);
  }, []);

  const getIcon = (iconName: string) => {
    const iconMap = {
      Trophy: Trophy,
      Star: Star,
      Target: Target,
      Calendar: Calendar,
      Award: Award,
      Users: Users,
      Crown: Crown
    };
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Trophy;
    return <IconComponent className="w-6 h-6" />;
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const unEarnedAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">הישגיך</h2>
              <p className="text-yellow-100">
                {earnedAchievements.length} מתוך {achievements.length} הישגים
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{totalPoints}</div>
              <div className="text-yellow-100 text-sm">נקודות</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-green-600">הישגים שהושגו 🏆</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedAchievements.map((achievement) => (
              <Card key={achievement.id} className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600">
                      {getIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-green-800">{achievement.name}</h4>
                        <Badge variant="secondary" className="bg-green-200 text-green-800">
                          +{achievement.points} נקודות
                        </Badge>
                      </div>
                      <p className="text-green-700 text-sm">{achievement.description}</p>
                      <div className="mt-2">
                        <Badge className="bg-green-600">הושג ✓</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Unearned Achievements */}
      {unEarnedAchievements.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-600">הישגים זמינים</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unEarnedAchievements.map((achievement) => (
              <Card key={achievement.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400">
                      {getIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <Badge variant="outline">
                          +{achievement.points} נקודות
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>התקדמות</span>
                          <span>{achievement.progress} / {achievement.condition_value}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.condition_value) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
