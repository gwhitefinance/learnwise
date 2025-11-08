
'use client';

import { Bookmark, Settings, Play, ChevronDown, FileText, Mic } from 'lucide-react';

const StudySetCard = () => {
    return (
        <div className="bg-gradient-to-br from-primary to-indigo-700 p-8 rounded-3xl shadow-2xl shadow-blue-500/40 text-white">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Sat Math</h2>
                    <p className="text-indigo-200">9 materials</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-200 text-rose-600 font-bold">1</div>
                    <div className="flex-1">Tests/Quizzes</div>
                    <ChevronDown className="w-5 h-5" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-200 text-blue-600 font-bold">0</div>
                    <div className="flex-1">Explainers</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-200 text-pink-600 font-bold">2</div>
                    <div className="flex-1">Arcade</div>
                    <ChevronDown className="w-5 h-5" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-200 text-teal-600 font-bold">1</div>
                    <div className="flex-1">Flashcards</div>
                    <ChevronDown className="w-5 h-5" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold">0</div>
                    <div className="flex-1">Tutor Me</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold">0</div>
                    <div className="flex-1">Audio Recap</div>
                </div>
            </div>
            <button className="w-full bg-white text-primary font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg">
                <Play className="w-6 h-6" />
                <span>Continue Learning</span>
            </button>
        </div>
    );
};

export default StudySetCard;

    