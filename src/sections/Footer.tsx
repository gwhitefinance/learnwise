
"use client"

import type React from "react"
import Link from "next/link"
import { Instagram, Twitter, Linkedin, Youtube, BrainCircuit } from 'lucide-react'
import Logo from "@/components/Logo"

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-gray-800/50">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="group flex items-center gap-2">
               <span className="font-bold text-2xl text-white">Tutorin</span>
               <Logo className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Empowering learners to build powerful study habits that drive real understanding.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <Link key={label} href={href} className="group relative" aria-label={label}>
                    <div className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-800 group-hover:border-gray-700 transition-colors">
                      <Icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Features</h4>
              <ul className="space-y-4">
                {[ "AI Chat", "Practice Quizzes", "Study Roadmaps", "Learning Lab", "Notes & Whiteboard", "Games" ].map((link) => (
                  <li key={link}>
                    <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
              <ul className="space-y-4">
                {[ "About Us", "Careers", "Blog", "Contact" ].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
             <div>
              <h4 className="text-lg font-semibold text-white mb-6">Legal</h4>
              <ul className="space-y-4">
                {[ "Privacy Policy", "Terms of Service", "Cookie Policy" ].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} Tutorin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
