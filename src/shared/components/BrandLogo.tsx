import chickenMascot from "../../assets/brand/chicken-mascot.png";
import roastChicken from "../../assets/brand/roast-chicken.png";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={["mc-brand", compact ? "mc-brand--compact" : "", className].join(" ")} translate="no">
      <AnimatedChickenImage className={compact ? "h-12 w-12" : "h-24 w-24"} />
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

export function AnimatedChickenImage({ className = "" }: { className?: string }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={["brand-animated-image", className].join(" ")}
      src={chickenMascot}
    />
  );
}

export function AnimatedRoastChickenImage({ className = "" }: { className?: string }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={["brand-animated-image", className].join(" ")}
      src={roastChicken}
    />
  );
}
