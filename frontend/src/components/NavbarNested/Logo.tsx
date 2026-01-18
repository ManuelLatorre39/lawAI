import lexaIcon from '../../pages/icons/LexaIconLimpio.png'

type LegalAILogoProps = {
  name?: string
  className?: string
}

export function LegalAILogo({
  name = "Lexa",
  className = "",
}: LegalAILogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon */}
      <img
        src={lexaIcon}
        alt={`${name} icon`}
        className="h-10 w-10"
      />

      {/* Text */}
      <span
        className="text-2xl font-semibold tracking-tight"
        style={{ fontFamily: "'Cinzel Decorative', serif" }}
      >
        {name}
      </span>
    </div>
  )
}