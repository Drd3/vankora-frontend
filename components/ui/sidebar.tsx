"use client"

import { useState } from "react"
import { Home, Briefcase, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function ExpandableSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  const menuItems = [
    { icon: Home, label: "Inicio", href: "#" },
    { icon: Briefcase, label: "Portafolio", href: "#" },
  ]

  const protocolItems = [
    { label: "Vankora Protocol", href: "#" },
    { label: "Aave Protocol", href: "#" },
  ]

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        isExpanded ? "w-64" : "w-20",
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500 flex-shrink-0" />
          <div
            className={cn(
              "transition-all duration-300",
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
            )}
          >
            <p className="font-semibold text-gray-900 whitespace-nowrap">Vankora</p>
            <p className="text-sm text-gray-500 whitespace-nowrap">App</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <item.icon className="w-5 h-5 text-gray-700 flex-shrink-0" />
            <span
              className={cn(
                "text-gray-700 font-medium transition-all duration-300 whitespace-nowrap",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
              )}
            >
              {item.label}
            </span>
          </a>
        ))}

        {/* Protocol Items */}
        <div className="pt-4 space-y-1">
          {protocolItems.map((protocol) => (
            <a
              key={protocol.label}
              href={protocol.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <div className="w-5 h-5 rounded bg-purple-500 flex-shrink-0 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
              </div>
              <span
                className={cn(
                  "text-gray-700 font-medium transition-all duration-300 whitespace-nowrap",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
                )}
              >
                {protocol.label}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full">
          <LogOut className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <span
            className={cn(
              "text-gray-700 font-medium transition-all duration-300 whitespace-nowrap",
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
            )}
          >
            Desconectarme
          </span>
        </button>
      </div>
    </aside>
  )
}
