import { useState, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ViewTransitionProps {
  viewKey: string;
  children: ReactNode;
  className?: string;
}


export default function ViewTransition({ viewKey, children, className }: ViewTransitionProps) {
  const [displayKey, setDisplayKey] = useState(viewKey);
  const [phase, setPhase] = useState<"idle" | "exiting" | "entering">("idle");
  const [displayChildren, setDisplayChildren] = useState(children);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (viewKey !== displayKey) {
      setPhase("exiting");
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children);
        setDisplayKey(viewKey);
        setPhase("entering");
        timeoutRef.current = setTimeout(() => {
          setPhase("idle");
        }, 400);
      }, 250);
    } else {
      setDisplayChildren(children);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [viewKey, children, displayKey]);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        phase === "exiting" && "opacity-0 scale-[0.97] blur-[2px]",
        phase === "entering" && "animate-zoom-in",
        phase === "idle" && "opacity-100 scale-100",
        className
      )}
    >
      {displayChildren}
    </div>
  );
}

