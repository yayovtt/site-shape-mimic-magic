
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const MotivationalMessages = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="w-5 h-5" />
          הוסף משפט עידוד אישי
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <p className="text-lg font-medium text-center">
              "אתה יכול להשיג כל דבר שאתה שם את הדעת עליו! 💪"
            </p>
          </div>
          <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <p className="text-lg font-medium text-center">
              "כל יום הוא הזדמנות חדשה להצליח! ⭐"
            </p>
          </div>
          <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
            <p className="text-lg font-medium text-center">
              "התמדה היא המפתח להצלחה! 🏆"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
