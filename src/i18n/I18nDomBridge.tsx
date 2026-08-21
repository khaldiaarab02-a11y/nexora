"use client";

import { useEffect } from "react";
import { translateUiText, type UiLanguage } from "./uiTranslations";

const ATTRIBUTES = ["placeholder", "title", "aria-label"] as const;

function translateValue(value: string, language: UiLanguage) {
  if (!value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.trim();
  const translated = translateUiText(core, language);
  return translated === core ? value : `${leading}${translated}${trailing}`;
}

function translateTree(root: ParentNode, language: UiLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);

  for (const textNode of nodes) {
    const parent = textNode.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
    const value = textNode.nodeValue ?? "";
    const translated = translateValue(value, language);
    if (translated !== value) textNode.nodeValue = translated;
  }

  if (root instanceof Element || root instanceof Document) {
    const elements = root instanceof Element ? [root, ...root.querySelectorAll("*")] : [...root.querySelectorAll("*")];
    for (const element of elements) {
      for (const attribute of ATTRIBUTES) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        const translated = translateValue(value, language);
        if (translated !== value) element.setAttribute(attribute, translated);
      }
    }
  }
}

export default function I18nDomBridge({ language }: { language: UiLanguage }) {
  useEffect(() => {
    translateTree(document.body, language);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target.parentElement) {
          const value = mutation.target.nodeValue ?? "";
          const translated = translateValue(value, language);
          if (translated !== value) mutation.target.nodeValue = translated;
        }
        for (const added of mutation.addedNodes) {
          if (added.nodeType === Node.ELEMENT_NODE) translateTree(added as Element, language);
          else if (added.nodeType === Node.TEXT_NODE) {
            const value = added.nodeValue ?? "";
            const translated = translateValue(value, language);
            if (translated !== value) added.nodeValue = translated;
          }
        }
      }
    });

    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  return null;
}
