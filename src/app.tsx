import { DialogProvider } from "@/components/dialogProvider";
import { StoreProvider } from "@/lib/store";
import { Board } from "@/pages/board";

export function App() {
  return (
    <DialogProvider>
      <StoreProvider>
        <Board />
      </StoreProvider>
    </DialogProvider>
  );
}
