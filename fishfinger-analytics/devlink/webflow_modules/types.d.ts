import * as React from "react";
export type ElementProps<T extends keyof HTMLElementTagNameMap> =
  React.HTMLAttributes<HTMLElementTagNameMap[T]>;
export type Props<
  T extends keyof HTMLElementTagNameMap,
  U = unknown
> = ElementProps<T> & React.PropsWithChildren<U>;
export type TagProps = Props<
  keyof HTMLElementTagNameMap,
  {
    tag?: React.ElementType;
    grid?: unknown;
  }
>;
export type LinkProps = Props<
  "a",
  {
    options?: {
      href: string;
      target?: "_self" | "_blank";
      preload?: "none" | "prefetch" | "prerender";
    };
    className?: string;
    button?: boolean;
    block?: string;
  }
>;
export type CSSModules = {
  [sel: string]: string;
};
export declare namespace Basic {
  type PreloadedLink = {
    preload?: "prerender" | "prefetch" | "none";
  };
  type TargetedLink = {
    target?: "_self" | "_blank";
  };
  type PreloadedAndTargetedLink = PreloadedLink & TargetedLink;
  export type Link = {
    href: string;
  } & PreloadedAndTargetedLink;
  export type RichTextChildren = React.ReactNode;
  export {};
}
export declare namespace Asset {
  type Image = string;
}
export declare namespace Embed {
  type Video = {
    height?: number;
    width?: number;
    title?: string;
    url?: string;
  };
}
export declare namespace Boolean {
  type Boolean = boolean;
}
export declare namespace Visibility {
  type VisibilityConditions = boolean;
}
export declare namespace Devlink {
  type Slot = React.ReactNode;
  type RuntimeProps = Record<string, unknown>;
}
export type FontsManifest = {
  google?: string[];
  typekit?: {
    kitId: string;
  };
};
export declare namespace Basic {
  type Attributes = Record<string, unknown>;
}
