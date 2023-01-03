import { Pill } from "@/components/pill";
import type { Model } from "@/lib/data";
import type { Card as CardType } from "@/lib/store";
import { Link, StickyNote } from "lucide-preact";
import type { RenderableProps } from "preact";
import { useState } from "preact/hooks";

type CardProps = Model<CardType> & {
  index?: number;
  onEdit?: () => void;
  onCardDrop?: (droppedCard: string, direction: DropDirection) => void;
};

export type DropDirection = "before" | "after";

export function Card(props: RenderableProps<CardProps>) {
  /* -------------------------------------------------- *
   * Card drag & drop status                            *
   * -------------------------------------------------- */

  const [dragging, setDragging] = useState(false);
  const [dropping, setDropping] = useState<DropDirection | false>(false);

  // Initialize drag & drop by setting the payload to the card ID
  function setDraggedCard(e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/x.card", props.id);
    }
    setDragging(true);
  }

  // Update visible state if another card is dragged over the current card
  function setDroppedCard(e: DragEvent) {
    if (dragging) return;
    e.preventDefault();

    let direction: DropDirection = "after";
    if (props.index === 0 && e.target instanceof HTMLElement) {
      const rect = e.target.getBoundingClientRect();
      const y = e.clientY - rect.top;
      direction = y >= rect.height / 2 ? "after" : "before";
    }

    setDropping(direction);
  }

  // Emit an event with the dropped card if a dragged card is dropped at
  // the location of the current card
  function dropCard(e: DragEvent) {
    e.preventDefault();
    const droppedCard = e.dataTransfer?.getData("application/x.card");

    if (droppedCard && dropping) {
      props.onCardDrop?.(droppedCard, dropping);
      setDropping(false);
    }
  }

  return (
    <li
      data-dragging={dragging || undefined}
      data-dropping={dropping || undefined}
      draggable={true}
      onDragEnd={() => setDragging(false)}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={() => setDropping(false)}
      onDragOver={(e) => setDroppedCard(e)}
      onDragStart={setDraggedCard}
      onDrop={dropCard}
      class="group/item relative mt-0 list-none pb-3 transition-all before:absolute before:-top-px before:left-1 before:right-1 before:block before:h-0.5 before:rounded-full before:bg-primary-200 before:opacity-0 before:transition-colors before:content-[''] after:absolute after:left-1 after:right-1 after:-bottom-px after:block after:h-0.5 after:rounded-full after:bg-primary-200 after:opacity-0 after:transition-colors after:content-[''] data-[dropping=after]:mb-3 data-[dropping=before]:pt-3 data-[dropping=before]:before:opacity-100 data-[dropping=after]:after:opacity-100"
    >
      <div
        data-color={props.color}
        onClick={() => props.onEdit?.()}
        tabIndex={0}
        class="group/card cursor-pointer rounded border-large border-solid border-transparent bg-surface px-4 py-3 pb-3 shadow-medium transition-colors hover:border-primary-500 focus-visible:shadow-outline focus-visible:outline-none data-[color=red]:hover:border-tw-red data-[color=orange]:hover:border-tw-orange data-[color=yellow]:hover:border-tw-yellow data-[color=green]:hover:border-tw-green data-[color=blue]:hover:border-tw-blue data-[color=purple]:hover:border-tw-purple"
      >
        <span class="block">{props.title}</span>
        <footer class="flex gap-1 [&:not(:empty)]:mt-3">
          {props.color ? (
            <Pill>
              <span class="my-[0.125em] block h-[0.75em] w-[0.75em] rounded-full group-data-[color=red]/card:bg-tw-red group-data-[color=orange]/card:bg-tw-orange group-data-[color=yellow]/card:bg-tw-yellow group-data-[color=green]/card:bg-tw-green group-data-[color=blue]/card:bg-tw-blue group-data-[color=purple]/card:bg-tw-purple" />
            </Pill>
          ) : undefined}
          {props.notes ? (
            <Pill>
              <StickyNote />
            </Pill>
          ) : undefined}
          {props.url ? (
            <Pill
              class="ml-auto"
              href={props.url}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              <Link />
            </Pill>
          ) : undefined}
        </footer>
      </div>
    </li>
  );
}
