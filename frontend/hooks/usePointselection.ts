import { useState, useCallback } from 'react';

interface UsePointSelectionReturn {
  selectedId: string | null;
  hoveredId: string | null;
  selectPoint: (id: string | null) => void;
  hoverPoint: (id: string | null) => void;
  clearSelection: () => void;
  togglePoint: (id: string) => void;
}

export const usePointSelection = (
  onSelectionChange?: (id: string | null) => void
): UsePointSelectionReturn => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selectPoint = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      onSelectionChange?.(id);
    },
    [onSelectionChange]
  );

  const hoverPoint = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setHoveredId(null);
    onSelectionChange?.(null);
  }, [onSelectionChange]);

  const togglePoint = useCallback(
    (id: string) => {
      if (selectedId === id) {
        selectPoint(null);
      } else {
        selectPoint(id);
      }
    },
    [selectedId, selectPoint]
  );

  return {
    selectedId,
    hoveredId,
    selectPoint,
    hoverPoint,
    clearSelection,
    togglePoint,
  };
};

// Advanced selection hook with history
export const usePointSelectionWithHistory = (maxHistory: number = 10) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectPoint = useCallback(
    (id: string | null) => {
      if (id === null) {
        setSelectedId(null);
        return;
      }

      setSelectedId(id);

      // Add to history
      setSelectionHistory((prev) => {
        const newHistory = [...prev.slice(0, historyIndex + 1), id];
        return newHistory.slice(-maxHistory); // Keep only last N items
      });
      setHistoryIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    },
    [historyIndex, maxHistory]
  );

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSelectedId(selectionHistory[newIndex]);
    }
  }, [historyIndex, selectionHistory]);

  const goForward = useCallback(() => {
    if (historyIndex < selectionHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSelectedId(selectionHistory[newIndex]);
    }
  }, [historyIndex, selectionHistory]);

  const hoverPoint = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setHoveredId(null);
  }, []);

  return {
    selectedId,
    hoveredId,
    selectPoint,
    hoverPoint,
    clearSelection,
    goBack,
    goForward,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < selectionHistory.length - 1,
    selectionHistory,
  };
};