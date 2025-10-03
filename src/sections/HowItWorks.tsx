
"use client"

import { motion } from "framer-motion"
import { Search, Lightbulb, Rocket, GitMerge } from 'lucide-react'

const steps = [
  {
    number: "01",
    title: "Upload & Analyze",
    description: "Upload your course materials—notes, documents, or even images. Our AI analyzes the content to understand your study needs.",
    icon: <Search className="w-8 h-8" />,
    mockup: "discovery",
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  {
    number: "02",
    title: "Create Your Roadmap",
    description: "Our AI generates a personalized study plan with goals and milestones, giving you a clear path to success.",
    icon: <GitMerge className="w-8 h-8" />,
    mockup: "development",
    gradient: "from-purple-500/20 to-purple-600/10",
  },
  {
    number: "03",
    title: "Generate & Learn",
    description: "Instantly create quizzes, flashcards, and other study materials from your content. Start learning with your AI tutor.",
    icon: <Rocket className="w-8 h-8" />,
    mockup: "launch",
    gradient: "from-green-500/20 to-green-600/10",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">How It Works</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A simple, effective approach to supercharge your study sessions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`bg-gradient-to-br ${step.gradient} border border-gray-800/50 rounded-3xl p-8 backdrop-blur-sm hover:border-gray-700/50 transition-all duration-300 group`}
            >
              {/* Mockup Area */}
              <div className="aspect-video bg-gray-900 rounded-2xl mb-6 overflow-hidden relative border border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 p-4">
                  {/* Discovery Mockup */}
                  {step.mockup === "discovery" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1, delay: index * 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="w-full max-w-[200px] space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="bg-gray-700 h-2 w-full rounded"></div>
                            <div className="bg-gray-700 h-2 w-3/4 rounded"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-700 h-12 rounded-lg"></div>
                          <div className="bg-gray-700 h-12 rounded-lg"></div>
                        </div>
                        <div className="bg-gray-700 h-8 w-full rounded"></div>
                      </div>
                    </motion.div>
                  )}

                  {/* Development Mockup */}
                  {step.mockup === "development" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1, delay: index * 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="w-full max-w-[200px] space-y-3">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-700 h-2 w-full rounded"></div>
                            <div className="bg-gray-700 h-2 w-2/3 rounded"></div>
                            <div className="bg-purple-500 h-2 w-1/2 rounded"></div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="bg-gray-700 h-8 flex-1 rounded"></div>
                          <div className="bg-purple-500 h-8 w-16 rounded"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Launch Mockup */}
                  {step.mockup === "launch" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1, delay: index * 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="w-full max-w-[200px] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400">Status</div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"
                          ></motion.div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="text-xs text-gray-300">Quizzes Generated</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="text-xs text-gray-300">Flashcards Ready</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="text-xs text-gray-300">AI Tutor Active</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="text-xs text-gray-300">Ready to Learn...</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-gray-600">{step.number}</div>
                  <div className="text-blue-400">{step.icon}</div>
                </div>
                <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
