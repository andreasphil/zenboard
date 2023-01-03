import cslx from "clsx";
import type { RenderableProps } from "preact";

type PillProps = {
  class?: string;
  href?: string;
  target?: "_blank";
  title?: string;
  onClick?: (e: MouseEvent) => void;
};

export function Pill(props: RenderableProps<PillProps>) {
  const Tag = props.href ? "a" : "span";

  return (
    <Tag
      children={props.children}
      href={props.href}
      target={props.target}
      title={props.title}
      onClick={props.onClick}
      class={cslx(
        `rounded-small bg-surface-variant px-1.5 py-1 text-variant no-underline transition-colors [&:is(a)]:hover:bg-primary-100 [&:is(a)]:hover:text-primary`,
        props.class
      )}
    />
  );
}
