import { Card, DropDirection } from "@/components/card";
import { CardDetail } from "@/components/cardDetail";
import { useDialog } from "@/components/dialogProvider";
import { useCardsInList, useStore } from "@/lib/store";
import { Edit3, Palmtree, PlusSquare, Trash2 } from "lucide-preact";
import type { RenderableProps } from "preact";
import { useState } from "preact/hooks";

type ListProps = {
  id: string;
};

export function List(props: RenderableProps<ListProps>) {
  const { store, update } = useStore();
  const list = store.lists[props.id];
  const cards = useCardsInList(props.id);
  const { showDialog } = useDialog();

  /* -------------------------------------------------- *
   * Managing the list                                  *
   * -------------------------------------------------- */

  function editList() {
    const currentTitle = list.title;

    showDialog?.({
      default: currentTitle,
      description: "Change the title of the list.",
      label: "Title",
      placeholder: "Title",
      title: "List settings",
      type: "prompt",
    }).onConfirm((title) => {
      if (title) update({ type: "updateList", id: list.id, value: { title } });
    });
  }

  function removeList() {
    showDialog?.({
      type: "confirm",
      title: "Delete list",
      description:
        "This will delete the list and all tasks in it. You can’t undo this action.",
    }).onConfirm(() => {
      update({ type: "removeList", id: list.id });
    });
  }

  /* -------------------------------------------------- *
   * Managing cards in the list                         *
   * -------------------------------------------------- */

  const [selectedCard, setSelectedCard] = useState<string>();

  function addCard() {
    showDialog?.({
      type: "prompt",
      title: "Add task",
      label: "Title",
      description: "Add a new task to the list.",
      placeholder: "Title",
    }).onConfirm((title) => {
      if (title) update({ type: "addCard", init: { parent: list.id, title } });
    });
  }

  function moveCard(
    id: string,
    sibling: string | undefined,
    direction: DropDirection
  ) {
    const moveOpts = { direction, sibling, parent: list.id };
    update({ type: "moveCard", id, opts: moveOpts });
  }

  /* -------------------------------------------------- *
   * Drag & drop to an empty list                       *
   * -------------------------------------------------- */

  const [dropping, setDropping] = useState(false);

  function beginDropInEmptyList(e: DragEvent) {
    e.preventDefault();
    setDropping(true);
  }

  function dropInEmptyList(e: DragEvent) {
    e.preventDefault();
    const droppedCard = e.dataTransfer?.getData("application/x.card");

    if (droppedCard) {
      moveCard(droppedCard, undefined, "after");
      setDropping(false);
    }
  }

  return (
    <section class="w-[22rem] flex-none overflow-auto border-r border-r-variant px-6 pb-6">
      <header class="flex h-20 items-center gap-1 py-1">
        <span class="font-medium capitalize line-clamp-1">{list.title}</span>
        <div class="ml-auto flex">
          <button class="px-2" data-variant="muted" onClick={() => editList()}>
            <Edit3 />
          </button>
          <button
            class="px-2"
            data-variant="muted"
            onClick={() => removeList()}
          >
            <Trash2 />
          </button>
        </div>
      </header>

      <ul class="m-0 p-0">
        {cards.length ? (
          cards.map((c, i) => (
            <Card
              {...c}
              index={i}
              key={c.id}
              onEdit={() => setSelectedCard(c.id)}
              onCardDrop={(id, dir) => moveCard(id, c.id, dir)}
            />
          ))
        ) : (
          <div
            data-dropping={dropping === true ? true : undefined}
            onDragEnter={beginDropInEmptyList}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDropping(false)}
            onDrop={dropInEmptyList}
            class="relative mb-3 flex items-center gap-2 rounded border-large border-transparent bg-surface-variant px-4 py-3 text-variant transition-all after:absolute after:left-1 after:right-1 after:-bottom-4 after:block after:h-0.5 after:rounded-full after:bg-primary-100 after:opacity-0 after:transition-colors after:content-[''] data-[dropping]:mb-6 data-[dropping]:after:opacity-100 dark:after:bg-neutral-800"
          >
            <Palmtree />
            Nothing to do
          </div>
        )}
      </ul>

      <button
        class="w-full px-4"
        data-variant="ghost"
        onClick={() => addCard()}
      >
        <PlusSquare />
        Add task ...
      </button>

      {/* Item detail view */}
      {selectedCard ? (
        <CardDetail
          id={selectedCard}
          onClose={() => setSelectedCard(undefined)}
        />
      ) : undefined}
    </section>
  );
}
