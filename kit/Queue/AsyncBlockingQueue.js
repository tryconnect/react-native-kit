class AsyncBlockingQueue {

    constructor() {

        // invariant: at least one of the arrays is empty
        this.resolvers = [];
        this.promises = [];
    }

    _add() {

        this.promises.push(new Promise(resolve => {
            this.resolvers.push(resolve);
        }));
    }

    enqueue(t) {

        if (!this.resolvers.length) this._add();
        this.resolvers.shift()(t);
    }

    dequeue() {

        if (!this.promises.length) this._add();
        return this.promises.shift();
    }

    // now some utilities:
    isEmpty() { // there are no values available

        return !this.promises.length; // this.length == 0
    }

    isBlocked() { // it's waiting for values

        return !!this.resolvers.length; // this.length < 0
    }

    get length() {
        
        return this.promises.length - this.resolvers.length;
    };
}

export default AsyncBlockingQueue;