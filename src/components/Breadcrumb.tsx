import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface Props {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: Props) {
  const navigate = useNavigate()
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#a3a3a3] mb-8">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
          {item.path ? (
            <button
              onClick={() => navigate(item.path!)}
              className="hover:text-[#f9f9f9] transition truncate max-w-[160px]"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-[#f9f9f9] truncate max-w-[260px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
