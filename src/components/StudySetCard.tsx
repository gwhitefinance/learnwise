'use client';

import { Bookmark, Settings, Play } from 'lucide-react';

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
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">1</div>
                    <div className="flex-1">Tests/Quizzes</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">0</div>
                    <div className="flex-1">Explainers</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">2</div>
                    <div className="flex-1">Arcade</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">1</div>
                    <div className="flex-1">Flashcards</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">0</div>
                    <div className="flex-1">Tutor Me</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold">0</div>
                    <div className="flex-1">Audio Recap</div>
                </div>
            </div>
            <button className="w-full bg-white text-primary font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg">
                <Play className="w-6 h-6" />
                <span>Continue Learning</span>
            </button>
        </div>
    );
};

export default StudySetCard;
