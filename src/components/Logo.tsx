import { Link } from "@tanstack/react-router";

export function Logo({ className = "h-14 w-auto", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <Link to="/" aria-label="Thrifted Threads — home" className="inline-flex items-center">
      <img
        src="/thriftlogo.png"
        alt="Thrifted Threads logo — hanger with tassels"
        className={className}
        style={{ mixBlendMode: "multiply", ...style }}
        width={1080}
        height={1080}
      />
    </Link>
  );
}
