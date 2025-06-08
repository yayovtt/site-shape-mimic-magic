
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Plus, Target, Star, LucideIcon } from "lucide-react";

interface ToolStat {
  label: string;
  value: string | number;
  color?: string;
}

interface Tool {
  id: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  path: string;
  stats: ToolStat[];
  description: string;
  goals: string[];
}

interface ToolCardProps {
  tool: Tool;
  isExpanded: boolean;
  onToggle: () => void;
  newGoal: string;
  onGoalChange: (value: string) => void;
  onAddGoal: () => void;
}

const getAddButtonText = (toolId: string) => {
  switch (toolId) {
    case "tasks": return "הוסף משימה חדשה";
    case "goals": return "הוסף יעד חדש";
    case "meetings": return "הוסף פגישה חדשה";
    case "chat": return "הוסף נושא לשיחה";
    case "achievements": return "הוסף הישג חדש";
    case "schedules": return "הוסף אירוע חדש";
    default: return "הוסף פריט חדש";
  }
};

export const ToolCard = ({ tool, isExpanded, onToggle, newGoal, onGoalChange, onAddGoal }: ToolCardProps) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${tool.gradient}`}>
                <tool.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl mb-2">{tool.title}</CardTitle>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Add New Item Button - Above Summary */}
            <div className="mb-6">
              <Button
                onClick={onAddGoal}
                className={`w-full bg-gradient-to-r ${tool.gradient} hover:opacity-90 text-white flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                {getAddButtonText(tool.id)}
              </Button>
            </div>

            {/* Status Summary - Rectangle shaped and larger */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {tool.stats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-6 bg-gray-50 rounded-lg min-h-[70px]">
                  <div className="text-right">
                    <div className="text-base text-gray-500">{stat.label}</div>
                  </div>
                  <div className={`text-2xl font-bold ${stat.color || 'text-purple-600'}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Goals Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                יעדים ומטרות
              </h4>
              <div className="space-y-2">
                {tool.goals.map((goal, goalIndex) => (
                  <div key={goalIndex} className="flex items-center gap-2 p-3 bg-white rounded text-sm">
                    <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Goal Section with Form */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-600" />
                הוסף יעד או מטרה חדשה
              </h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="הזן יעד או מטרה חדשה..."
                  value={newGoal}
                  onChange={(e) => onGoalChange(e.target.value)}
                  className="resize-none h-20"
                />
                <Button
                  onClick={onAddGoal}
                  size="sm"
                  className={`w-full bg-gradient-to-r ${tool.gradient} hover:opacity-90`}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
