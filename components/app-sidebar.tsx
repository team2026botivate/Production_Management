"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, ShieldCheck, Package, Factory, ChevronRight, ClipboardEdit } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, stage: 0 },
  { href: "/production_indent", label: "Indent Creation", icon: ClipboardEdit, stage: 1 },
  { href: "/bom-validation", label: "BOM Validation", icon: ClipboardList, stage: 2 },
  { href: "/quality-approval", label: "Quality Approval", icon: ShieldCheck, stage: 3 },
  { href: "/packing-receipt", label: "Packing Receipt", icon: Package, stage: 4 },
  { href: "/packing-production", label: "Production Report", icon: Factory, stage: 5 },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col p-4 shadow-xl shadow-black/[0.02] z-50">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Factory className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight leading-none text-foreground">ProductionPro</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Core System</span>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground font-medium",
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="flex-1 truncate whitespace-nowrap">{item.label}</span>
              {isActive && (
                <div className="absolute left-0 w-1 h-4 bg-primary-foreground rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 mt-auto border-t border-sidebar-border px-2">
        <div className="flex items-center gap-2 py-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">GD</div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold truncate">Ghanshyam D.</span>
            <span className="text-[10px] text-muted-foreground truncate">System Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
