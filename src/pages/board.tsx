import logoUrl from "@/assets/icon.png";
import { useDialog } from "@/components/dialogProvider";
import { List } from "@/components/list";
import { useStore } from "@/lib/store";
import { ListPlus } from "lucide-preact";

export function Board() {
  const { lists, update } = useStore();
  const { showDialog } = useDialog();

  function addList() {
    showDialog?.({
      type: "prompt",
      description: "Add a new list to your board.",
      label: "Title",
      placeholder: "Title",
      title: "Add list",
    }).onConfirm((title) => {
      if (title) update({ type: "addList", init: { title } });
    });
  }

  return (
    <>
      {/* App headers */}
      <header>
        <nav data-variant="fixed" class="px-6 py-1 shadow-medium">
          <span class="flex items-center gap-4">
            <img src={logoUrl} class="h-12" />
            <strong>Zenboard</strong>
          </span>
        </nav>
      </header>

      {/* Lists view */}
      <div data-nav="fixed" class="flex h-screen">
        {/* Available lists */}
        {lists.map((i) => (
          <List id={i.id} key={i.id} />
        ))}

        {/* Placeholder list for adding more lists */}
        <section class="flex-none px-6">
          <header class="flex h-20 items-center py-1">
            <button
              class="font-normal"
              data-variant="muted"
              onClick={() => addList()}
            >
              <ListPlus />
              Add list ...
            </button>
          </header>
        </section>
      </div>
    </>
  );
}
