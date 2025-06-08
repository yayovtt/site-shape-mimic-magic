
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MotivationalQuotes } from "@/components/MotivationalQuotes";
import { GoogleCalendarIntegration } from "@/components/GoogleCalendarIntegration";
import { ToolsGrid } from "@/components/ToolsGrid";
import { GoalsOverview } from "@/components/GoalsOverview";
import { MotivationalMessages } from "@/components/MotivationalMessages";
import { Home, ArrowRight } from "lucide-react";

const Tools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              כלים נוספים
            </h1>
            <p className="text-gray-600">גלה את כל הפונקציות הזמינות באפליקציה</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            חזרה לבית
          </Button>
        </div>

        {/* Motivational Quotes */}
        <div className="mb-8">
          <MotivationalQuotes />
        </div>

        {/* Google Calendar Integration */}
        <div className="mb-8">
          <GoogleCalendarIntegration />
        </div>

        {/* Tools Grid */}
        <ToolsGrid />

        {/* Goals and Targets Overview */}
        <GoalsOverview />

        {/* Custom Motivational Messages */}
        <MotivationalMessages />

        {/* Footer Action */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            התחל לעבוד עם הכלים
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tools;
