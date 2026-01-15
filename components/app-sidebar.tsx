"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, ShieldCheck, Package, Factory, ChevronRight } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, stage: 1 },
  { href: "/bom-validation", label: "BOM & Raw Material", icon: ClipboardList, stage: 2 },
  { href: "/quality-approval", label: "Quality Approval", icon: ShieldCheck, stage: 3 },
  { href: "/packing-receipt", label: "Packing Receipt", icon: Package, stage: 4 },
  { href: "/packing-production", label: "Production & Consumption", icon: Factory, stage: 5 },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Factory className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg">ProductionPro</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
