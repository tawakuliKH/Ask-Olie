function KaiAvatar({ thinking = false }) {
  return (
    <svg
      className={`ollie-avatar ${thinking ? 'is-thinking' : ''}`}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={thinking ? 'Kai the owl is thinking' : 'Kai the owl'}
    >
      {/* Left wing */}
      <ellipse
        className="ollie-wing ollie-wing-left"
        cx="55"
        cy="120"
        rx="22"
        ry="35"
        fill="var(--color-ollie-amber-dark)"
      />

      {/* Right wing */}
      <ellipse
        className="ollie-wing ollie-wing-right"
        cx="145"
        cy="120"
        rx="22"
        ry="35"
        fill="var(--color-ollie-amber-dark)"
      />

      {/* Body */}
      <ellipse cx="100" cy="115" rx="60" ry="65" fill="var(--color-ollie-amber)" />

      {/* Belly */}
      <ellipse cx="100" cy="130" rx="38" ry="42" fill="var(--color-bubble-cream)" />

      {/* Head */}
      <circle cx="100" cy="80" r="52" fill="var(--color-ollie-amber)" />

      {/* Ear tufts */}
      <path d="M60 45 L50 20 L75 38 Z" fill="var(--color-ollie-amber-dark)" />
      <path d="M140 45 L150 20 L125 38 Z" fill="var(--color-ollie-amber-dark)" />

      {/* Eye whites */}
      <circle cx="80" cy="78" r="20" fill="white" />
      <circle cx="120" cy="78" r="20" fill="white" />

      {/* Eyes (blinking) */}
      <g className="ollie-eyes">
        <circle cx="80" cy="78" r="9" fill="var(--color-text)" />
        <circle cx="120" cy="78" r="9" fill="var(--color-text)" />
      </g>
      {/* Eyelids for blink */}
      <rect className="ollie-eyelid ollie-eyelid-left" x="60" y="78" width="40" height="0" fill="var(--color-ollie-amber)" />
      <rect className="ollie-eyelid ollie-eyelid-right" x="100" y="78" width="40" height="0" fill="var(--color-ollie-amber)" />

      {/* Beak */}
      <path d="M92 95 L108 95 L100 108 Z" fill="var(--color-ollie-amber-dark)" />

      {/* Feet */}
      <ellipse cx="82" cy="178" rx="10" ry="6" fill="var(--color-ollie-amber-dark)" />
      <ellipse cx="118" cy="178" rx="10" ry="6" fill="var(--color-ollie-amber-dark)" />
    </svg>
  )
}

export default KaiAvatar