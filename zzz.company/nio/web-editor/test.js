class Heap {
    heap = [];
    size = 0;
    constructor(list) {
        this.heap = [...list];
        this.size = this.heap.length;
        this.adjustHeap();
    }
    adjustHeap() {
        for (let i = ~~(this.size / 2) - 1; i >= 0; i--) {
            this.swap(i);
        }
    }
    swap(idx) {
        let l = 2 * idx + 1, r = 2 * idx + 2;
        if (l >= this.size) {
            return;
        }
        let minChild;
        if (r >= this.size) {
            minChild = l;
        } else {
            minChild = this.heap[l] < this.heap[r] ? l : r;
        }
        if (this.heap[minChild] < this.heap[idx]) {
            [this.heap[idx], this.heap[minChild]] = [this.heap[minChild], this.heap[idx]];
            this.swap(minChild);
        }
    }
    push(val) {
        this.heap.push(val);
        this.size++;
        this.adjustHeap();
    }
    get top() {
        return this.heap[0];
    }
}
