# Cohorts manager

This project is the result of Elective Take-home assessment.

## Base structure

The waiting list was implemented using a queue backed by a singly linked list, where each node represents a cohort with a fixed capacity. Creators are added FIFO, newest cohorts on the left, oldest on the right. You can find the implementation in `src/objects/queue.ts`.

The web component is a single page split into two panels. The left panel lets you create waiting lists and, once a row is selected, add or remove creators and delete the list. The right panel shows a table of all active waiting lists with their cohort values, capacity, and total creators waiting.

## Running the app

Clone this repository:

```bash
git clone https://github.com/EWCunha/elective-take-home-cohorts.git
```

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm start
```

Open the URL shown on the terminal with a browser (probably `http://localhost:3000`).

## TypeScript judgment

TypeScript's `number` type doesn't distinguish integers from floats, so runtime guards (`Number.isInteger`, `capacity > 0`) were added at both the class boundary and the UI layer. React state holds plain serializable objects rather than class instances, keeping diffing predictable and state easy to reason about.

## Edge cases

- **Add / take 0 or negative**: silently ignored in both the UI and class methods
- **Take more than total**: rejected; a warning message is shown (snapshot at click time, not live)
- **Non-integer inputs**: `Math.floor` at the UI boundary, `Number.isInteger` in the class
- **Capacity ≤ 0**: throws immediately in the constructor
- **Empty list after taking all creators**: automatically deleted from state
- **Partial first cohort**: `addCreators` fills existing free space before opening a new cohort

## Design decisions

`totalWaiting` is cached in React state to avoid an O(n) traversal on every render. Queue instances are only alive during operations (`fromArray` -> operate -> `toArray`); state stays as plain arrays. A ring buffer would improve cache locality at large scale, but the linked list is sufficient here.

## AI collaboration

I used Cursor IDE as a coding assistant for the web layer. I drove it with specific, scoped prompts (layout, styling, state management, wiring the queue class into React) and reviewed every output before accepting it.

The queue data structure (`src/objects/queue.ts`) was written entirely by me. I wanted to own the core logic directly.
