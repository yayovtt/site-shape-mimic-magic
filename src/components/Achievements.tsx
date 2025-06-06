
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Crown, Target, Award, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  points: number;
  earned?: boolean;
  earned_at?: string;
}

interface UserStats {
  tasks_completed: number;
  goals_achieved: number;
  meetings_created: number;
}

const iconMap = {
  Trophy,
  Star,
  Crown,
  Target,
  Award,
  Calendar,
  Users
};

export const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    tasks_completed: 0,
    goals_achieved: 0,
    meetings_created: 0
  });
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
    fetchUserStats();
  }, []);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from("achievements")
        .select("*")
        .order("condition_value", { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch user's earned achievements
      const { data: userAchievements, error: userError } = await supabase
        .from("user_achievements")
        .select("achievement_id, earned_at");

      if (userError) console.warn("Could not fetch user achievements:", userError);

      // Merge the data
      const mergedAchievements = achievementsData?.map(achievement => ({
        ...achievement,
        earned: userAchievements?.some(ua => ua.achievement_id === achievement.id) || false,
        earned_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.earned_at
      })) || [];

      setAchievements(mergedAchievements);

      // Calculate total points
      const points = mergedAchievements
        .filter(a => a.earned)
        .reduce((sum, a) => sum + a.points, 0);
      setTotalPoints(points);

    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast({
        title: "שגיאה בטעינת הישגים",
        variant: "destructive",
      });
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch tasks stats
      const { data: tasks } = await supabase.from("tasks").select("completed");
      const tasks_completed = tasks?.filter(task => task.completed).length || 0;

      // Fetch goals stats  
      const { data: goals } = await supabase.from("goals").select("completed");
      const goals_achieved = goals?.filter(goal => goal.completed).length || 0;

      // Fetch meetings count
      const { data: meetings } = await supabase.from("meetings").select("id");
      const meetings_created = meetings?.length || 0;

      setUserStats({
        tasks_completed,
        goals_achieved,
        meetings_created
      });

      // Check for new achievements
      checkNewAchievements({
        tasks_completed,
        goals_achieved,
        meetings_created
      });

    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const checkNewAchievements = async (stats: UserStats) => {
    try {
      for (const achievement of achievements) {
        if (achievement.earned) continue;

        let shouldEarn = false;
        const statValue = stats[achievement.condition_type as keyof UserStats] || 0;
        
        if (statValue >= achievement.condition_value) {
          shouldEarn = true;
        }

        if (shouldEarn) {
          // Generate a random UUID for the user_id (temporary solution)
          const tempUserId = crypto.randomUUID();
          
          const { error } = await supabase
            .from("user_achievements")
            .insert({
              user_id: tempUserId,
              achievement_id: achievement.id
            });

          if (!error) {
            toast({
              title: "🎉 הישג חדש!",
              description: `השגת את ההישג "${achievement.name}"!`,
            });
            fetchAchievements(); // Refresh achievements
          }
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    const statValue = userStats[achievement.condition_type as keyof UserStats] || 0;
    return Math.min((statValue / achievement.condition_value) * 100, 100);
  };

  const getIconComponent = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Trophy;
    return Icon;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              ההישגים שלי
            </span>
            <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              {totalPoints} נקודות
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = getIconComponent(achievement.icon);
              const progress = getProgressPercentage(achievement);
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`transition-all ${achievement.earned ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${achievement.earned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{achievement.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        
                        {!achievement.earned && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                {userStats[achievement.condition_type as keyof UserStats] || 0} / {achievement.condition_value}
                              </span>
                              <span>{achievement.points} נקודות</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        
                        {achievement.earned && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-600 font-medium">הושג!</span>
                            <span className="text-yellow-600">+{achievement.points} נקודות</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
