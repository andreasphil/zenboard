import { DropDirection } from "@/components/card";
import { createRecord, touch, type Model } from "@/lib/data";
import produce from "immer";
import merge from "lodash.merge";
import sortBy from "lodash.sortby";
import { createContext, type RenderableProps } from "preact";
import { Reducer, useContext, useMemo, useReducer } from "preact/hooks";
import { createStorage } from "./storage";

/* -------------------------------------------------- *
 * Types                                              *
 * -------------------------------------------------- */

export type Card = {
  parent: string;
  title: string;
  order: number;
  notes?: string;
  pinned?: boolean;
  color?: string;
  url?: string;
};

export type List = {
  title: string;
  cards: Model<Card>[];
  collapsed?: boolean;
  order: number;
};

export type ShallowList = Omit<List, "cards">;

type Actions =
  | { type: "addList"; init: Omit<ShallowList, "order"> }
  | { type: "removeList"; id: string }
  | { type: "updateList"; id: string; value: Partial<List> }
  | { type: "addCard"; init: Omit<Card, "order"> }
  | { type: "removeCard"; id: string }
  | { type: "updateCard"; id: string; value: Partial<Card> }
  | {
      type: "moveCard";
      id: string;
      opts: { parent: string; sibling?: string; direction: DropDirection };
    };

type State = {
  lists: Record<string, Model<ShallowList>>;
  cards: Record<string, Model<Card>>;
};

type Context = {
  lists: Model<ShallowList>[];
  cards: Model<Card>[];
  store: State;
  update: (action: Actions) => void;
};

/* -------------------------------------------------- *
 * LocalStorage persistence                           *
 * -------------------------------------------------- */

const storage = createStorage<{
  state: State;
}>();

function restoreState(): State {
  return storage.getItem("state") ?? getInitialState();
}

function persistState(value: State) {
  storage.setItem("state", value);
}

/* -------------------------------------------------- *
 * Reducer                                            *
 * -------------------------------------------------- */

function getInitialState(): State {
  return { lists: {}, cards: {} };
}

const reducer: Reducer<State, Actions> = (state, action) => {
  let newState;

  switch (action.type) {
    /* -------------------------------------------------- *
     * Cards                                              *
     * -------------------------------------------------- */

    case "addCard":
      newState = produce(state, (s) => {
        const order = getLast(s.cards) + ORDER_BASE;
        const newCard = createRecord<Card>({ ...action.init, order });
        s.cards[newCard.id] = newCard;
      });
      break;

    case "removeCard":
      newState = produce(state, (s) => {
        delete s.cards[action.id];
      });
      break;

    case "updateCard":
      newState = produce(state, (s) => {
        if (!(action.id in s.cards)) return; // TODO: Might want to throw an error
        const next = merge({}, s.cards[action.id], action.value);
        touch(next);
        s.cards[action.id] = next;
      });
      break;

    case "moveCard":
      newState = produce(state, (s) => {
        const card = s.cards[action.id];
        card.parent = action.opts.parent;

        if (action.opts.sibling && s.cards[action.opts.sibling]) {
          const sibling = s.cards[action.opts.sibling];
          const siblings = findSiblings(s.cards, sibling);
          card.order =
            action.opts.direction === "after"
              ? insertBetween(sibling.order, siblings?.next)
              : insertBetween(siblings?.prev, sibling.order);
        }
      });
      break;

    /* -------------------------------------------------- *
     * Lists                                              *
     * -------------------------------------------------- */

    case "addList":
      newState = produce(state, (s) => {
        const order = getLast(s.lists) + ORDER_BASE;
        const newList = createRecord<ShallowList>({ ...action.init, order });
        s.lists[newList.id] = newList;
      });
      break;

    case "removeList":
      newState = produce(state, (s) => {
        delete s.lists[action.id];
        Object.entries(s.cards)
          .filter(([, v]) => v.parent === action.id)
          .forEach(([k]) => delete s.cards[k]);
      });
      break;

    case "updateList":
      newState = produce(state, (s) => {
        if (!(action.id in s.lists)) return; // TODO: Might want to throw an error
        const next = merge({}, s.lists[action.id], action.value);
        touch(next);
        s.lists[action.id] = next;
      });
      break;
  }

  if (newState) persistState(newState);

  return newState ?? state;
};

/* -------------------------------------------------- *
 * Context                                            *
 * -------------------------------------------------- */

const StoreContext = createContext<Context>({
  lists: [],
  cards: [],
  store: getInitialState(),
  update: () => {},
});

export function StoreProvider({ children }: RenderableProps<unknown>) {
  const [store, update] = useReducer(reducer, restoreState());
  const lists = sortBy(Object.values(store.lists), ["order"]);
  const cards = sortBy(Object.values(store.cards), ["order"]);

  return (
    <StoreContext.Provider value={{ lists, cards, store, update }}>
      {children}
    </StoreContext.Provider>
  );
}

/** Access to the store context */
export function useStore() {
  return useContext(StoreContext);
}

/** Retrieve all cards contained in a list */
export function useCardsInList(parent: string) {
  const { cards } = useStore();

  return useMemo(
    () => cards.filter((c) => c.parent === parent),
    [cards, parent]
  );
}

/* -------------------------------------------------- *
 * Utilities                                          *
 * -------------------------------------------------- */

const ORDER_BASE = 10 ** 8;

/** Return the order of the last item in the list */
function getLast(items: Record<any, { order: number }>): number {
  let all = Object.values(items);
  all = sortBy(all, "order");
  return all[all.length - 1]?.order ?? 0;
}

/**
 * Return the order of the item before and after the specified item in the list.
 */
function findSiblings(
  items: Record<any, Model<{ order: number; parent: string }>>,
  self: Model<{ parent: string }>
) {
  let all = Object.values(items).filter((i) => i.parent === self.parent);
  all = sortBy(all, "order");
  const index = all.findIndex((i) => i.id === self.id);

  if (index === -1) return undefined;
  else return { prev: all[index - 1]?.order, next: all[index + 1]?.order };
}

/** Return an order number that falls between the specified items */
function insertBetween(a: number | undefined, b: number | undefined): number {
  if (a === undefined && b === undefined) {
    return ORDER_BASE;
  } else if (a === undefined && typeof b === "number") {
    return Math.floor(b / 2);
  } else if (b === undefined && typeof a === "number") {
    return a + ORDER_BASE;
  } else {
    // @ts-expect-error A and B now have both to be numbers but TS doesn't get it
    return a + Math.floor(Math.abs(b - a) / 2);
  }
}
