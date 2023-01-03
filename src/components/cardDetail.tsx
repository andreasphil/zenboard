import { Dialog } from "@/components/dialog";
import { useDialog } from "@/components/dialogProvider";
import { useStore, type Card } from "@/lib/store";
import { Link, Maximize2, Minimize2, Save, Slash, Trash2 } from "lucide-preact";
import type { RenderableProps } from "preact";
import { useEffect, useState } from "preact/hooks";

type CardDetailProps = {
  id: string;
  onClose?: () => void;
};

export function CardDetail({ id, ...props }: RenderableProps<CardDetailProps>) {
  const [card, setCard] = useState<Partial<Card>>({});
  const [maximized, setMaximized] = useState(false);
  const { showDialog } = useDialog();
  const { store, update } = useStore();

  // Update the current card data whenever the ID changes
  useEffect(() => {
    setCard(store.cards[id] ?? {});
  }, [id]);

  // Save changes to the card made in the form to the local state
  function onChangeCard<P extends keyof Card>(property: P, val: Card[P]) {
    setCard((s) => ({ ...s, [property]: val }));
  }

  // Show dialog for removing the card
  function removeCard() {
    showDialog?.({
      type: "confirm",
      title: "Delete task",
      description: "This will delete the task. You can’t undo this action.",
    }).onConfirm(() => {
      update({ type: "removeCard", id });
      props.onClose?.();
    });
  }

  // Update the card in the store
  function onSubmit(e: Event) {
    e.preventDefault();
    update({ type: "updateCard", id, value: card });
    props.onClose?.();
  }

  // Reset local state and tell the parent that editing was canceled
  function onCancel() {
    setCard({});
    props.onClose?.();
  }

  return (
    <Dialog
      visible={true}
      variant="sidebar"
      size={maximized ? "large" : undefined}
    >
      <form
        class="group flex min-h-full flex-col gap-6"
        data-color={card.color}
        onSubmit={onSubmit}
      >
        <label>
          <span class="sr-only">Title</span>
          <input
            autofocus
            class="text-h3 font-bold"
            onInput={(e) => onChangeCard("title", e.target?.value)}
            placeholder="Title"
            type="text"
            value={card?.title ?? ""}
          />
        </label>
        <hr class="m-0" />

        <label class="flex flex-1 flex-col">
          <span class="sr-only">Notes</span>
          <textarea
            class="m-0 h-full flex-1 resize-none font-mono"
            onInput={(e) => onChangeCard("notes", e.target?.value)}
            placeholder="Notes"
            type="text"
            value={card?.notes ?? ""}
          />
        </label>
        <hr class="m-0" />

        <div class="space-y-2">
          <label class="flex flex-1 items-center gap-2">
            <span class="flex-none basis-1/4">URL</span>
            <a
              data-variant="ghost"
              href={card?.url}
              role="button"
              class="pointer-events-none flex-none self-stretch opacity-40 [&[href]]:pointer-events-auto [&[href]]:opacity-100"
            >
              <Link />
            </a>
            <input
              class="mt-0 flex-1"
              onInput={(e) => onChangeCard("url", e.target?.value)}
              placeholder="https://example.com"
              type="text"
              value={card?.url ?? ""}
            />
          </label>

          <label class="flex flex-1 items-center gap-2">
            <span class="flex-none basis-1/4">Color</span>
            <div class="flex flex-none items-center self-stretch border border-transparent px-3 py-2">
              <span class="mx-[0.125em] block h-[0.75em] w-[0.75em] rounded-full bg-neutral-200 transition-colors group-data-[color=red]:bg-tw-red group-data-[color=orange]:bg-tw-orange group-data-[color=yellow]:bg-tw-yellow group-data-[color=green]:bg-tw-green group-data-[color=blue]:bg-tw-blue group-data-[color=purple]:bg-tw-purple dark:bg-neutral-700" />
            </div>
            <select
              class="mt-0 flex-1"
              onChange={(e) => onChangeCard("color", e.target?.value)}
              value={card?.color ?? ""}
            >
              <option value="">None</option>
              <option value="red">Red</option>
              <option value="orange">Orange</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
            </select>
          </label>
        </div>

        <hr class="mt-auto mb-0" />
        <footer class="flex gap-2">
          <button
            data-variant="muted"
            onClick={() => setMaximized((v) => !v)}
            type="button"
          >
            {maximized ? <Minimize2 /> : <Maximize2 />}
            <span class="sr-only">Maximize</span>
          </button>
          <button
            data-variant="muted"
            onClick={() => removeCard()}
            type="button"
          >
            <Trash2 />
            <span class="sr-only">Delete task</span>
          </button>

          <button
            class="ml-auto"
            data-variant="ghost"
            onClick={() => onCancel()}
            type="button"
          >
            <Slash />
            Cancel
          </button>
          <button type="submit">
            <Save />
            Save
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
