import { App } from "@/app";
import "@/assets/index.css";
import { useThemeColor } from "finecss";
import { enableMapSet } from "immer";
import { render } from "preact";

enableMapSet();

useThemeColor();

render(<App />, document.getElementById("app") as HTMLElement);
