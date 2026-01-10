type LegalAILogoProps = {
  name?: string
  className?: string
}

export function LegalAILogo({
  name = "Lexa",
  className = "",
}: LegalAILogoProps) {
  return (
    <svg
      viewBox="0 0 320 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${name} logo`}
    >
      {/* Icon */}
      <g transform="translate(0, 8)">
        {/* Vertical pillar */}
        <rect
          x="28"
          y="6"
          width="4"
          height="28"
          rx="2"
          fill="currentColor"
        />

        {/* Left arm */}
        <line
          x1="10"
          y1="14"
          x2="30"
          y2="14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right arm */}
        <line
          x1="30"
          y1="14"
          x2="50"
          y2="14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Left node */}
        <circle cx="10" cy="20" r="4" fill="currentColor" />

        {/* Right node */}
        <circle cx="50" cy="20" r="4" fill="currentColor" />

        {/* AI dots */}
        <circle cx="30" cy="2" r="3" fill="currentColor" />
        <circle cx="22" cy="36" r="2" fill="currentColor" />
        <circle cx="38" cy="36" r="2" fill="currentColor" />
      </g>

      {/* Text */}
      <text
        x="72"
        y="42"
        fontSize="28"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        {name}
      </text>
    </svg>
  )
}