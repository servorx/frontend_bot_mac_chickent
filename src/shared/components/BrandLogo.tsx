type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={["mc-brand", compact ? "mc-brand--compact" : "", className].join(" ")} translate="no">
      <ChickenMascot className={compact ? "h-12 w-12" : "h-24 w-24"} />
      {!compact ? (
        <div className="leading-none">
          <div className="mc-brand__mc">MC</div>
          <div className="mc-brand__sub">CHICKEN</div>
          <div className="mc-brand__sub">EXPRESS</div>
        </div>
      ) : null}
    </div>
  );
}

export function ChickenMascot({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={["chicken-mascot", className].join(" ")}
      fill="none"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="chicken-mascot__bob">
        <path d="M53 103c14.9 0 27-12.3 27-27.4 0-19.4-10-40.9-25.7-40.9C38.4 34.7 28 56.2 28 75.6 28 90.7 38.1 103 53 103Z" fill="#fff8ee" stroke="#4a170f" strokeLinecap="round" strokeWidth="5" />
        <path d="M48 88c-6.9 0-13.3-3.3-17.1-8.5C32.6 92.7 41.4 103 53 103c13.5 0 24.7-10.1 26.6-23.3C72.8 85.5 60.6 88 48 88Z" fill="#ffc247" stroke="#4a170f" strokeLinecap="round" strokeWidth="5" />
        <path d="M60.8 35.6c5.2-2.5 10.3-1 12.8 2.3 2.2 3 .5 7.7-3.6 8.3" stroke="#4a170f" strokeLinecap="round" strokeWidth="5" />
        <path d="M49.4 24.6c-2.5-6.9 8.8-11.2 11-3.6 4.2-7.7 16.1-.5 10.3 6.9 8.9-.4 9.5 13.7.8 13.5H45.6c-9.1-.8-7.6-14.8 1-13.2" fill="#df1d21" stroke="#4a170f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
        <circle cx="51.5" cy="52.5" r="3.3" fill="#4a170f" />
        <path d="M66.6 55.1c7.2 1 12.4 4.2 12.4 8.1 0 4.6-7.3 8.3-16.2 8.3" fill="#ffbd2f" stroke="#4a170f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
        <path className="chicken-mascot__wing" d="M56.5 78.7c9.6-2 15.1-7.2 17.4-13.7 4.4 5.1 6.2 11.2 4.4 16.4-2.2 6.7-10.1 10.2-19.8 8.7" fill="#ffc247" stroke="#4a170f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
        <path d="M44 102v8M61 102v8M37 111h13M54 111h13" stroke="#4a170f" strokeLinecap="round" strokeWidth="5" />
        <path d="M68.5 69.5c.7 7.7 7.4 11.9 13.5 10" stroke="#4a170f" strokeLinecap="round" strokeWidth="4" />
      </g>
    </svg>
  );
}
