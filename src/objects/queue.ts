export class CohortNode {
  value: number;
  next: CohortNode | null;

  constructor(value: number) {
    this.value = value;
    this.next = null;
  }
}

export class Queue {
  first: CohortNode | null;
  last: CohortNode | null;
  size: number;
  capacity: number;
  waiting: number = 0;

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error("Capacity must be greater than 0");
    this.first = null;
    this.last = null;
    this.size = 0;
    this.capacity = capacity;
  }

  enqueue(value: number, updateWaiting: boolean = true): void {
    const newNode = new CohortNode(value);
    if (!this.first || !this.last) {
      this.first = newNode;
      this.last = newNode;
    } else {
      this.last.next = newNode;
      this.last = newNode;
    }
    this.size++;
    if (updateWaiting) {
      this.waiting = this.getWaiting();
    }
  }

  dequeue(updateWaiting: boolean = true): void {
    if (!this.first) return;

    this.first = this.first.next;
    if (!this.first) {
      this.last = null;
    }
    this.size--;
    if (updateWaiting) {
      this.waiting = this.getWaiting();
    }
  }

  addCreators(amount: number): void {
    if (!Number.isInteger(amount) || amount <= 0) return;
    let remaining = amount;
    while (remaining > 0) {
      if (!this.last || this.last.value === this.capacity) {
        const nodeValue = Math.min(remaining, this.capacity);
        this.enqueue(nodeValue, false);
        remaining -= nodeValue;
      } else {
        const freeSpace = this.capacity - this.last.value;
        const addValue = Math.min(remaining, freeSpace);
        this.last.value += addValue;
        remaining -= addValue;
      }
    }

    this.waiting = this.getWaiting();
  }

  takeCreators(amount: number): void {
    if (!Number.isInteger(amount) || amount <= 0 || amount > this.waiting)
      return;

    let removed = 0;
    while (removed < amount) {
      if (!this.first) break;

      const temp = this.first;
      if (amount - removed >= temp.value) {
        removed += temp.value;
        this.dequeue(false);
      } else {
        temp.value -= amount - removed;
        removed = amount;
      }
    }

    this.waiting = this.getWaiting();
  }

  private getWaiting(): number {
    let waiting = 0;
    let current = this.first;
    while (current) {
      waiting += current.value;
      current = current.next;
    }

    return waiting;
  }

  toArray(): number[] {
    const result: number[] = [];
    let current = this.first;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  static fromArray(nodes: number[], capacity: number): Queue {
    const q = new Queue(capacity);
    for (const value of nodes) {
      q.enqueue(value);
    }
    return q;
  }

  hash(): string {
    return this.toArray().join(",");
  }
}
