"use client";

import { useEffect } from "react";
import { translateUiText, type UiLanguage } from "./uiTranslations";
import { languageDirection } from "./config";

const ATTRIBUTES = ["placeholder", "title", "aria-label"] as const;

/**
 * Some Phase 1/2/3 screens still contain literal UI strings instead of t(...).
 * This bridge keeps those legacy screens translated without changing business
 * data. The important detail is that we ALWAYS translate from the original
 * source value, never from the value we previously translated to.
 */
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

let translating = false;

function translateValue(value: string, language: UiLanguage) {
  if (!value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.trim();
  const translated = translateUiText(core, language);
  return `${leading}${translated}${trailing}`;
}

function rememberAndTranslateText(textNode: Text, language: UiLanguage) {
  if (!originalText.has(textNode)) originalText.set(textNode, textNode.nodeValue ?? "");
  const source = originalText.get(textNode) ?? "";
  const translated = translateValue(source, language);
  if (textNode.nodeValue !== translated) textNode.nodeValue = translated;
}

function rememberAndTranslateAttribute(element: Element, attribute: string, language: UiLanguage) {
  const value = element.getAttribute(attribute);
  if (value == null) return;

  let values = originalAttributes.get(element);
  if (!values) {
    values = new Map();
    originalAttributes.set(element, values);
  }

  if (!values.has(attribute)) values.set(attribute, value);
  const source = values.get(attribute) ?? value;
  const translated = translateValue(source, language);
  if (element.getAttribute(attribute) !== translated) element.setAttribute(attribute, translated);
}

function applyDirection(root: ParentNode, language: UiLanguage) {
  const direction = languageDirection[language];
  if (root instanceof Element) root.setAttribute("dir", direction);

  const elements = root instanceof Document
    ? [...root.querySelectorAll("[dir]")]
    : [...root.querySelectorAll("[dir]")];

  for (const element of elements) element.setAttribute("dir", direction);

  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  document.body.dir = direction;
}

function translateTree(root: ParentNode, language: UiLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const parent = textNode.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
    nodes.push(textNode);
  }

  for (const textNode of nodes) rememberAndTranslateText(textNode, language);

  const elements = root instanceof Element
    ? [root, ...root.querySelectorAll("*")]
    : [...root.querySelectorAll("*")];

  for (const element of elements) {
    for (const attribute of ATTRIBUTES) rememberAndTranslateAttribute(element, attribute, language);
  }

  applyDirection(root, language);
}

export default function I18nDomBridge({ language }: { language: UiLanguage }) {
  useEffect(() => {
    translating = true;
    try {
      translateTree(document.body, language);
    } finally {
      // Let React settle before the observer starts processing its mutations.
      queueMicrotask(() => {
        translating = false;
      });
    }

    const observer = new MutationObserver((mutations) => {
      if (translating) return;
      translating = true;
      try {
        for (const mutation of mutations) {
          if (mutation.type === "characterData" && mutation.target instanceof Text) {
            rememberAndTranslateText(mutation.target, language);
          }

          if (mutation.type === "attributes" && mutation.target instanceof Element) {
            const element = mutation.target;
            if (mutation.attributeName === "dir") {
              element.setAttribute("dir", languageDirection[language]);
            } else if (mutation.attributeName && ATTRIBUTES.includes(mutation.attributeName as (typeof ATTRIBUTES)[number])) {
              rememberAndTranslateAttribute(element, mutation.attributeName, language);
            }
          }

          for (const added of mutation.addedNodes) {
            if (added.nodeType === Node.ELEMENT_NODE) {
              translateTree(added as Element, language);
            } else if (added.nodeType === Node.TEXT_NODE) {
              rememberAndTranslateText(added as Text, language);
            }
          }
        }
      } finally {
        queueMicrotask(() => {
          translating = false;
        });
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["dir", ...ATTRIBUTES],
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
}
