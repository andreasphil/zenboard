import { App } from "@/app";
import "@/assets/index.css";
import { enableMapSet } from "immer";
import { render } from "preact";

enableMapSet();

render(<App />, document.getElementById("app") as HTMLElement);
