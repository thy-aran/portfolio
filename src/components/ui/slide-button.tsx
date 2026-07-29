import {
  forwardRef,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Check, Loader2, SendHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DRAG_CONSTRAINTS = { left: 0, right: 155 };
const DRAG_THRESHOLD = 0.9;

const BUTTON_STATES = {
  initial: { width: "12rem" },
  completed: { width: "8rem" },
};

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 400,
    damping: 40,
    mass: 0.8,
  },
};

function StatusIcon({ status }: { status: "loading" | "success" | "error" }) {
  const icon =
    status === "loading" ? (
      <Loader2 className="animate-spin text-chrome" size={20} />
    ) : status === "success" ? (
      <Check className="text-white" size={20} />
    ) : (
      <X className="text-white" size={20} />
    );

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      {icon}
    </motion.div>
  );
}

export type SlideButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "type"
> & {
  onComplete?: () => void | Promise<void>;
  resolveTo?: "success" | "error";
};

export const SlideButton = forwardRef<HTMLButtonElement, SlideButtonProps>(
  ({ className, onComplete, resolveTo = "success", disabled, ...props }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
      "idle",
    );

    const dragX = useMotionValue(0);
    const springX = useSpring(dragX, ANIMATION_CONFIG.spring);
    const dragProgress = useTransform(
      springX,
      [0, DRAG_CONSTRAINTS.right],
      [0, 1],
    );
    const adjustedWidth = useTransform(springX, (x) => x + 10);

    const reset = useCallback(() => {
      setCompleted(false);
      setStatus("idle");
      setIsDragging(false);
      dragX.set(0);
    }, [dragX]);

    const handleSubmit = useCallback(async () => {
      setStatus("loading");
      try {
        await onComplete?.();
        setStatus(resolveTo);
      } catch {
        setStatus("error");
        window.setTimeout(reset, 1400);
      }
    }, [onComplete, resolveTo, reset]);

    const handleDragStart = useCallback(() => {
      if (completed || disabled) return;
      setIsDragging(true);
    }, [completed, disabled]);

    const handleDragEnd = () => {
      if (completed || disabled) return;
      setIsDragging(false);

      const progress = dragProgress.get();
      if (progress >= DRAG_THRESHOLD) {
        setCompleted(true);
        void handleSubmit();
      } else {
        dragX.set(0);
      }
    };

    const handleDrag = (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      if (completed || disabled) return;
      const newX = Math.max(0, Math.min(info.offset.x, DRAG_CONSTRAINTS.right));
      dragX.set(newX);
    };

    return (
      <div className="slide-button-wrap">
        <motion.div
          animate={completed ? BUTTON_STATES.completed : BUTTON_STATES.initial}
          transition={ANIMATION_CONFIG.spring}
          className={cn(
            "slide-button relative flex h-9 items-center justify-center rounded-full",
            completed && "slide-button--completed",
            className,
          )}
        >
          {!completed && (
            <motion.div
              style={{ width: adjustedWidth }}
              className="slide-button__fill absolute inset-y-0 left-0 z-0 rounded-full"
            />
          )}

          <AnimatePresence>
            {!completed && (
              <motion.div
                drag="x"
                dragConstraints={DRAG_CONSTRAINTS}
                dragElastic={0.05}
                dragMomentum={false}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrag={handleDrag}
                style={{ x: springX }}
                className="absolute -left-4 z-10 flex cursor-grab items-center justify-start active:cursor-grabbing"
              >
                <button
                  ref={ref}
                  type="button"
                  disabled={disabled || status === "loading"}
                  aria-label="Swipe to send"
                  className={cn(
                    "slide-button__handle flex size-10 items-center justify-center rounded-full",
                    isDragging && "scale-105",
                  )}
                  {...props}
                >
                  <SendHorizontal className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!completed && (
            <span className="pointer-events-none select-none font-display text-[10px] uppercase tracking-[0.22em] text-chrome/45 pl-8">
              Send
            </span>
          )}

          <AnimatePresence>
            {completed && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  type="button"
                  disabled
                  className="slide-button__status flex size-full items-center justify-center rounded-full"
                  aria-label={status}
                >
                  <AnimatePresence mode="wait">
                    {status !== "idle" && <StatusIcon status={status} />}
                  </AnimatePresence>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!completed && (
          <p className="slide-button__hint" aria-hidden="true">
            swipe to send
          </p>
        )}
      </div>
    );
  },
);

SlideButton.displayName = "SlideButton";
