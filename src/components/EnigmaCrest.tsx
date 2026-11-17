import React from 'react'

interface EnigmaCrestProps {
  className?: string
  showWordmark?: boolean
  subtitle?: string
}

export function EnigmaCrest({
  className = 'w-8 h-8',
  showWordmark = false,
  subtitle,
}: EnigmaCrestProps) {
  return (
    <span className="inline-flex items-center gap-3 select-none">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <polygon
          points="32,4 54,15 60,32 54,49 32,60 10,49 4,32 10,15"
          stroke="#cfa156"
          strokeWidth="1.5"
          fill="#0b0b0f"
        />
        <polygon
          points="32,11 48,19 52,32 48,45 32,53 16,45 12,32 16,19"
          stroke="#ece5d8"
          strokeOpacity="0.28"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M32 14L43 32L32 50L21 32L32 14Z"
          stroke="#cfa156"
          strokeWidth="1.4"
          fill="#14141b"
        />
        <line x1="21" y1="32" x2="43" y2="32" stroke="#ece5d8" strokeWidth="1.2" />
        <circle cx="32" cy="32" r="3" fill="#cfa156" />
      </svg>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display tracking-[0.28em] text-[#ece5d8] text-lg md:text-xl uppercase font-semibold">
            ENIGMA
          </span>
          {subtitle && (
            <span className="font-mono text-[9px] tracking-[0.26em] text-[#9a948a] uppercase mt-1">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
