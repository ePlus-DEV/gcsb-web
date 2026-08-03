"use client"

import { useEffect, useState } from "react"

type PortalTargetListener = (target: HTMLElement | null) => void

type PortalTargetStore = {
  target: HTMLElement | null
  listeners: Set<PortalTargetListener>
  observer: MutationObserver | null
}

const portalTargetStores = new Map<string, PortalTargetStore>()

function nodeContainsSelector(node: Node, selector: string): boolean {
  return (
    node instanceof Element &&
    (node.matches(selector) || node.querySelector(selector) !== null)
  )
}

/** Shares one DOM observer per selector among components that portal into it. */
export function usePortalTarget(selector: string) {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let store = portalTargetStores.get(selector)
    if (!store) {
      store = {
        target: null,
        listeners: new Set(),
        observer: null,
      }
      portalTargetStores.set(selector, store)
    }

    const activeStore = store
    const syncTarget = () => {
      const nextTarget = document.querySelector<HTMLElement>(selector)
      if (activeStore.target === nextTarget) return

      activeStore.target = nextTarget
      for (const listener of activeStore.listeners) listener(nextTarget)
    }

    activeStore.listeners.add(setTarget)
    setTarget(activeStore.target)

    if (!activeStore.observer) {
      syncTarget()
      activeStore.observer = new MutationObserver((records) => {
        const targetWasRemoved = Boolean(
          activeStore.target && !activeStore.target.isConnected,
        )
        const selectorChanged = records.some(({ addedNodes, removedNodes }) =>
          [...addedNodes, ...removedNodes].some((node) =>
            nodeContainsSelector(node, selector),
          ),
        )

        if (targetWasRemoved || selectorChanged) syncTarget()
      })
      activeStore.observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }

    return () => {
      activeStore.listeners.delete(setTarget)
      if (activeStore.listeners.size > 0) return

      activeStore.observer?.disconnect()
      portalTargetStores.delete(selector)
    }
  }, [selector])

  return target
}
