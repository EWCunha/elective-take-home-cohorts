import React, { useState, useCallback, useMemo, memo } from 'react';
import './App.css';
import { Queue } from './objects/queue';

// helpers
interface WaitingList {
  id: number;
  queue: Queue;
  stateHash: string;
}

let nextId = 1;

function parseAmount(raw: string): number {
  return Math.floor(Number(raw));
}

const WaitingListRow = memo(({ wl, isSelected, onClick }: {
  wl: WaitingList;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <tr className={isSelected ? 'row-selected' : ''} onClick={onClick}>
    <td className="cell-id">{wl.id}</td>
    <td className="cell-values">
      {wl.queue.size > 0 ? (
        <span className="node-list">
          {[...wl.queue.toArray()].reverse().map((v, i) => (
            <span key={i} className="node-chip">{v}</span>
          ))}
        </span>
      ) : (
        <span className="empty-values">—</span>
      )}
    </td>
    <td className="cell-capacity">{wl.queue.capacity}</td>
    <td className="cell-total">{wl.queue.waiting}</td>
  </tr>
), (prev, next) =>
  prev.wl.stateHash === next.wl.stateHash &&
  prev.isSelected === next.isSelected
);

function App() {
  // state
  const [capacity, setCapacity] = useState<number>(10);
  const [waitingLists, setWaitingLists] = useState<WaitingList[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState<number>(1);
  const [takeAmount, setTakeAmount] = useState<number>(1);
  const [overflowWarning, setOverflowWarning] = useState<string | null>(null);

  // memo
  const selected = useMemo(
    () => waitingLists.find(wl => wl.id === selectedId) ?? null,
    [waitingLists, selectedId]
  );

  // track state changes
  const updateHash = useCallback((id: number) => {
    setWaitingLists(prev =>
      prev.map(wl => wl.id === id ? { ...wl, stateHash: wl.queue.hash() } : wl)
    );
  }, []);

  // handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') action();
  }, []);

  // add waiting list
  const handleAddList = useCallback(() => {
    const cap = Math.floor(capacity);
    if (!cap || cap <= 0) return;
    const id = nextId++;
    const q = new Queue(cap);
    setWaitingLists(prev => [...prev, { id, queue: q, stateHash: q.hash() }]);
  }, [capacity]);

  // select waiting list
  const handleRowClick = useCallback((id: number) => {
    setSelectedId(prev => {
      const next = prev === id ? null : id;
      if (next !== prev) { setAddAmount(1); setTakeAmount(1); }
      return next;
    });
    setOverflowWarning(null);
  }, []);

  // list operations
  const handleEnqueue = useCallback(() => {
    if (!selected || addAmount <= 0 || !Number.isInteger(addAmount)) return;
    selected.queue.addCreators(addAmount);
    updateHash(selected.id);
    setOverflowWarning(null);
  }, [selected, addAmount, updateHash]);

  const handleDequeue = useCallback(() => {
    if (!selected || takeAmount <= 0 || !Number.isInteger(takeAmount)) return;
    const q = selected.queue;
    if (takeAmount > q.waiting) {
      setOverflowWarning(`Cannot take ${takeAmount} — only ${q.waiting} waiting.`);
      return;
    }
    setOverflowWarning(null);
    q.takeCreators(takeAmount);
    if (q.size === 0) {
      setWaitingLists(prev => prev.filter(wl => wl.id !== selected.id));
      setSelectedId(null);
    } else {
      updateHash(selected.id);
    }
  }, [selected, takeAmount, updateHash]);

  const handleDelete = useCallback(() => {
    if (!selected) return;
    setWaitingLists(prev => prev.filter(wl => wl.id !== selected.id));
    setSelectedId(null);
    setOverflowWarning(null);
  }, [selected]);

  // render
  return (
    <div className="page">
      <aside className="panel left-panel">
        <h2 className="panel-title">New Waiting List</h2>
        <div className="add-controls">
          <input
            type="number"
            className="capacity-input"
            value={capacity}
            min={1}
            step={1}
            onChange={e => setCapacity(parseAmount(e.target.value))}
            onKeyDown={e => handleKeyDown(e, handleAddList)}
            placeholder="Capacity"
          />
          <button className="add-btn" onClick={handleAddList}>
            Add Waiting List
          </button>
        </div>
        <p className="hint">Enter the capacity per cohort slot and click the button to create a new waiting list.</p>

        {selected && (
          <div className="selected-controls">
            <div className="selected-label">Waiting List #{selected.id}</div>

            <div className="action-row">
              <input
                type="number"
                className="capacity-input"
                value={addAmount}
                min={1}
                step={1}
                onChange={e => setAddAmount(parseAmount(e.target.value))}
                onKeyDown={e => handleKeyDown(e, handleEnqueue)}
              />
              <button className="action-btn enqueue-btn" onClick={handleEnqueue}>
                Add creator(s)
              </button>
            </div>

            <div className="action-row">
              <input
                type="number"
                className="capacity-input"
                value={takeAmount}
                min={1}
                step={1}
                onChange={e => setTakeAmount(parseAmount(e.target.value))}
                onKeyDown={e => handleKeyDown(e, handleDequeue)}
              />
              <button className="action-btn dequeue-btn" onClick={handleDequeue}>
                Take creator(s)
              </button>
            </div>

            {overflowWarning && (
              <p className="overflow-warning">{overflowWarning}</p>
            )}

            <button className="action-btn delete-btn" onClick={handleDelete}>
              Delete Waiting List
            </button>
          </div>
        )}
      </aside>

      <main className="panel right-panel">
        <h2 className="panel-title">Waiting Lists</h2>
        {waitingLists.length === 0 ? (
          <div className="empty-state">No waiting lists yet. Create one on the left.</div>
        ) : (
          <div className="table-wrapper">
            <table className="wl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Values</th>
                  <th>Capacity</th>
                  <th>Total Waiting</th>
                </tr>
              </thead>
              <tbody>
                {waitingLists.map(wl => (
                  <WaitingListRow
                    key={wl.id}
                    wl={wl}
                    isSelected={selectedId === wl.id}
                    onClick={() => handleRowClick(wl.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
