
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function AiChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold mb-4">AI Study Planner</h1>
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary text-primary-foreground h-8 w-8 flex items-center justify-center font-bold">AI</div>
                    <div className="bg-muted rounded-lg p-3">
                        <p>Hello! How can I help you plan for your tests today?</p>
                    </div>
                </div>
            </div>
        </CardContent>
        <div className="p-4 border-t">
          <div className="relative">
            <Input
              placeholder="Ask about a topic, get a study plan, etc."
              className="pr-12"
            />
            <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
