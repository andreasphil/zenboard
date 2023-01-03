import { Dialog } from "@/components/dialog";
import { Slash, ThumbsUp } from "lucide-preact";
import { createContext, RenderableProps } from "preact";
import { forwardRef } from "preact/compat";
import {
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "preact/hooks";

/* -------------------------------------------------- *
 * Types                                              *
 * -------------------------------------------------- */

type DialogContext = {
  targetId: string;
  showDialog?: (opts: DialogOpts) => DialogReturn;
};

type DialogOpts = {
  title: string;
  description?: string;
} & (
  | { type: "alert" | "confirm" }
  | {
      type: "prompt";
      label: string;
      placeholder?: string;
      default?: string;
      required?: boolean;
    }
);

type ConfirmHandler = (result?: string) => void;
type CancelHandler = () => void;

type DialogReturn = {
  onConfirm: (handler: ConfirmHandler) => Omit<DialogReturn, "onConfirm">;
  onCancel: (handler: CancelHandler) => void;
};

/* -------------------------------------------------- *
 * Context                                            *
 * -------------------------------------------------- */

const DialogContext = createContext<DialogContext>({ targetId: "" });

export function useDialog() {
  return useContext(DialogContext);
}

/* -------------------------------------------------- *
 * Generic dialogs                                    *
 * -------------------------------------------------- */

const GenericDialog = forwardRef((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<DialogOpts>();
  const [promptValue, setPromptValue] = useState<string>();
  const [confirmCallback, setConfirmCallback] = useState<ConfirmHandler>();
  const [cancelCallback, setCancelCallback] = useState<CancelHandler>();

  // Display a dialog with the specified options
  function showDialog(opts: DialogOpts): DialogReturn {
    setOpts(opts);
    setPromptValue(opts.type === "prompt" ? opts.default : "");
    setVisible(true);

    const callbacks: DialogReturn = {
      onConfirm: (handler) => {
        setConfirmCallback(() => handler);
        return callbacks;
      },
      onCancel: (handler) => {
        setCancelCallback(() => handler);
      },
    };

    return callbacks;
  }

  // Close and confirm the dialog
  function confirmDialog(e: Event) {
    e.preventDefault();
    confirmCallback?.(promptValue);
    closeDialog();
  }

  // Close and cancel the dialog
  function cancelDialog() {
    cancelCallback?.();
    closeDialog();
  }

  // Reset the dialog
  function closeDialog() {
    setOpts(undefined);
    setVisible(false);
    setConfirmCallback(undefined);
    setCancelCallback(undefined);
    setPromptValue("");
  }

  // Expose the showDialog method so it can be called by the parent
  useImperativeHandle(ref, () => ({
    showDialog: (opts: DialogOpts) => showDialog(opts),
  }));

  return opts ? (
    <Dialog visible={visible}>
      <form class="space-y-6" onSubmit={confirmDialog}>
        <h1 class="m-0 text-h3 capitalize">{opts.title}</h1>
        {opts.description ? (
          <p class="text-variant">{opts.description}</p>
        ) : undefined}

        {opts.type === "prompt" ? (
          <label class="block">
            <span class="sr-only">{opts.label}</span>
            <input
              autofocus
              class="mt-0"
              onInput={(e) => setPromptValue(e.target?.value)}
              placeholder={opts.placeholder}
              value={promptValue}
            />
          </label>
        ) : undefined}

        <footer class="flex gap-2 border-t border-variant pt-6">
          {opts.type !== "alert" ? (
            <button
              type="button"
              class="ml-auto"
              data-variant="ghost"
              onClick={() => cancelDialog()}
            >
              <Slash />
              Cancel
            </button>
          ) : undefined}
          <button type="submit">
            <ThumbsUp />
            Confirm
          </button>
        </footer>
      </form>
    </Dialog>
  ) : (
    <></>
  );
});

/* -------------------------------------------------- *
 * Component                                          *
 * -------------------------------------------------- */

export function DialogProvider({ children }: RenderableProps<unknown>) {
  const ctx: DialogContext = {
    targetId: "dialogPortal",
    showDialog: showGenericDialog,
  };

  /* -------------------------------------------------- *
   * Generic dialog - this is tightly coupled to the    *
   * provider, but extracted to a child component so    *
   * interactions with the dialog don't needlessly      *
   * cause the app to re-render.                        *
   * -------------------------------------------------- */

  const genericDialog = useRef(null);

  function showGenericDialog(opts: DialogOpts) {
    // @ts-expect-error I don't know how to type this
    return genericDialog.current?.showDialog(opts);
  }

  return (
    <DialogContext.Provider value={ctx}>
      {children}

      {/* Outlet to teleport dialogs to */}
      <div id={ctx.targetId}></div>

      {/* Generic dialogs */}
      <GenericDialog ref={genericDialog} />
    </DialogContext.Provider>
  );
}
