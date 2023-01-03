import { useDialog } from "@/components/dialogProvider";
import type { RenderableProps } from "preact";
import { createPortal, useEffect, useRef } from "preact/compat";

type DialogProps = {
  visible?: boolean;
  variant?: "dialog" | "sidebar";
  size?: "small" | "large";
};

export function Dialog(props: RenderableProps<DialogProps>) {
  const { targetId } = useDialog();
  const targetEl = document.getElementById(targetId);
  const dialogEl = useRef<HTMLElement>(null);

  // See if there is an input inside the dialog that should be autofocused
  // and focus it if one exists.
  useEffect(() => {
    if (!props.visible || !dialogEl.current) return;
    const autofocus = dialogEl.current.querySelector("input[autofocus]");
    (autofocus as HTMLInputElement)?.focus();
  }, [props.visible, dialogEl.current]);

  const dialog = (
    <div class="group fixed inset-0 z-40 flex items-center p-6">
      {/* Backdrop */}
      <div class="invisible absolute inset-0 bg-base opacity-80 group-last:visible" />

      <section
        ref={dialogEl}
        data-variant={props.variant ?? "dialog"}
        data-size={props.size ?? "small"}
        class="z-10 mx-auto max-h-full overflow-auto rounded-large bg-surface p-6 shadow-high transition-[width] data-[variant=sidebar]:mr-0 data-[variant=sidebar]:h-full data-[size=small]:w-[30rem] data-[size=large]:w-[60rem]"
      >
        {props.children}
      </section>
    </div>
  );

  return props.visible && targetEl ? createPortal(dialog, targetEl) : <></>;
}
