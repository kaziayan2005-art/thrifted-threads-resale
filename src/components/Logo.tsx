import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";

export function Logo({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    <Link to="/" aria-label="Thrifted Threads — home" className="inline-flex">
      <img
        src={logo.url}
        alt="Thrifted Threads — hand-drawn hanger logo"
        className={`${className} mix-blend-multiply`}
        width={1080}
        height={1080}
      />
    </Link>
  );
}
