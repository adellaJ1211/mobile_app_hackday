import React, { createContext, useContext, useState, useCallback } from 'react';

const ActionsContext = createContext();

export function ActionsProvider({ children }) {
  const [actions, setActions] = useState([]);

  const addAction = useCallback((insight, status = 'pending') => {
    setActions((prev) => {
      // Don't add duplicates
      if (prev.some((a) => a.insightId === insight.id)) return prev;
      return [
        {
          id: `action-${Date.now()}`,
          insightId: insight.id,
          title: insight.suggestedAction || insight.title,
          insightTitle: insight.title,
          source: insight.type === 'ai-search' ? 'AI Search insight' : 'PPC insight',
          status,
          account: 'Capital One UK',
          addedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          agentNote: null,
          agentAction: insight.agentAction,
          promptGroup: insight.promptGroup,
        },
        ...prev,
      ];
    });
  }, []);

  const updateActionStatus = useCallback((insightId, status, agentNote = null) => {
    setActions((prev) =>
      prev.map((a) =>
        a.insightId === insightId ? { ...a, status, agentNote } : a
      )
    );
  }, []);

  const completeAction = useCallback((insightId) => {
    setActions((prev) =>
      prev.map((a) =>
        a.insightId === insightId
          ? { ...a, status: 'done' }
          : a
      )
    );
  }, []);

  const isActioned = useCallback(
    (insightId) => actions.some((a) => a.insightId === insightId),
    [actions]
  );

  const actionCount = actions.filter((a) => a.status !== 'done').length;

  return (
    <ActionsContext.Provider
      value={{ actions, addAction, updateActionStatus, completeAction, isActioned, actionCount }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export function useActions() {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error('useActions must be used within ActionsProvider');
  }
  return context;
}
