"use client";
import * as React from "react";
import { cj, debounce, EASING_FUNCTIONS, useLayoutEffect } from "../../utils";
import { tabsContext } from "../helpers/tabsContext";
const TabsWrapper = React.forwardRef(function TabsWrapper(
  {
    className = "",
    fadeIn,
    fadeOut,
    easing,
    current: initialCurrent,
    ...props
  },
  ref
) {
  const [current, setCurrent] = React.useState("");
  const changeTab = React.useCallback(
    (next) => {
      function updateTab() {
        setCurrent(() => {
          const nextTabHeader = document.querySelector(
            `.w-tab-link[data-w-tab="${next}"]`
          );
          nextTabHeader?.focus();
          return next;
        });
      }
      const currentTab = document.querySelector(
        `.w-tab-pane[data-w-tab="${current}"]`
      );
      const nextTab = document.querySelector(
        `.w-tab-pane[data-w-tab="${next}"]`
      );
      const easingFn = EASING_FUNCTIONS[easing] ?? "ease";
      const animation = currentTab?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: fadeOut,
        fill: "forwards",
        easing: easingFn,
      });
      if (animation) {
        animation.onfinish = () => {
          updateTab();
          nextTab?.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: fadeIn,
            fill: "forwards",
            easing: easingFn,
          });
        };
      } else {
        updateTab();
      }
    },
    [current, easing, fadeIn, fadeOut]
  );
  const firstRender = React.useRef(true);
  useLayoutEffect(() => {
    if (!firstRender.current) return;
    firstRender.current = false;
    setTimeout(() => {
      changeTab(initialCurrent);
    }, 1);
  }, [changeTab, initialCurrent]);
  const onTabClick = debounce(changeTab);
  const onLinkKeyDown = debounce((event) => {
    event.preventDefault();
    const currentTab = document.querySelector(
      `.w-tab-pane[data-w-tab="${current}"]`
    );
    const allTabs = document.querySelectorAll(".w-tab-pane");
    const firstTab = allTabs[0];
    const lastTab = allTabs[allTabs.length - 1];
    const nextTab = (() => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowLeft":
          return currentTab.previousElementSibling ?? lastTab;
        case "ArrowDown":
        case "ArrowRight":
          return currentTab.nextElementSibling ?? firstTab;
        case "Home":
          return firstTab;
        case "End":
          return lastTab;
      }
    })();
    if (nextTab) changeTab(nextTab.getAttribute("data-w-tab"));
  });
  return React.createElement(
    tabsContext.Provider,
    { value: { current, onTabClick, onLinkKeyDown } },
    React.createElement("div", {
      ...props,
      className: cj(className, "w-tabs"),
      ref: ref,
    })
  );
});
export default TabsWrapper;
