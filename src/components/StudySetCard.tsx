
'use client';

import { Bookmark, Settings, ChevronDown, PenTool, Gamepad2, Headphones, BookMarked, GraduationCap, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const StudyItem = ({ title, progress }: { title: string, progress: number }) => {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-24 h-2" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      </div>
    );
}

const StudySetCard = () => {
    return (
        <div className="bg-gradient-to-br from-card-blue to-card-blue-dark rounded-2xl p-6 text-foreground">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Sat MAth</h2>
                    <p className="text-gray-700">9 materials</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/20 rounded-lg p-3 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-orange-300" />
                  <span className="font-medium text-sm">1 Tests/Quizzes</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <BookMarked className="w-4 h-4" />
                  <span className="font-medium text-sm">0 Explainers</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium text-sm">0 Tutor Me</span>
                </div>
                <div className="bg-white/20 rounded-lg p-3 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-pink-300" />
                  <span className="font-medium text-sm">2 Arcade</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </div>
                <div className="bg-white/20 rounded-lg p-3 flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="font-medium text-sm">1 Flashcards</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span className="font-medium text-sm">0 Audio Recap</span>
                </div>
              </div>

              <button className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 mb-6">
                <Play className="w-5 h-5" />
                <span className="font-semibold">Continue Learning</span>
              </button>

              <div className="bg-black/10 rounded-xl p-4 space-y-3">
                <StudyItem title="Technical Analysis for Day Trading" progress={0} />
                <StudyItem title="Day Trading Risk Management" progress={0} />
                <StudyItem title="Trading Psychology and Discipline" progress={0} />
                <StudyItem title="Order Types and Execution" progress={0} />
              </div>

              <button className="w-full mt-4 text-center text-sm font-medium text-foreground/80 hover:text-foreground">
                View All
              </button>
            </div>
    );
};

export default StudySetCard;
