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
    <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {item.path ? (
            <button onClick={() => navigate(item.path!)}
              className="hover:text-black transition truncate max-w-[120px]">
              {item.label}
            </button>
          ) : (
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
