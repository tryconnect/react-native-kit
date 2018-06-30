class StepProgress {

    constructor() {

        this._queue = [];
        this._running = null;
        this._processCallback = [];
        this._addedCallback = [];
        this._removedCallback = [];
        this._isRunning = false;
        this._isExcute = false;
        this._total = 0;
    }

    isRunning() {

        return this._isRunning;
    }

    total() {

        return this._total;
    }

    dequeue() {

        return this._queue.shift();
    }

    enqueue(step) {

        this._queue.push(step);
        return step;
    }

    removeAllListener() {
        this._processCallback = [];
        this._addedCallback = [];
        this._removedCallback = [];
    }

    entries() {

        return this._queue;
    }

    current() {

        return this._running;
    }

    addStep(step) {

        let cancel = step.cancel.bind(step);
        step.cancel = (...args) => {
            cancel(...args);
            this.dequeue();
        };
        this.enqueue(step);
        this._total++;
        this._addedCallback.forEach((callback) => {

            callback(step);
        });
        this._isExcute && this.excute();
    }

    removeStep(step) {
        
        let indexOf = this.entries().indexOf(step);
        if (indexOf !== -1) {
            
            this.entries().splice(indexOf, 1);
            this._total--;
            this._removedCallback.forEach((callback) => {

                callback(step);
            });
        }
        this._isExcute && this.excute();
    }

    prependStep(step) {

        let indexOf = this.entries().indexOf(this._running);
        if (indexOf <= 0) {

            indexOf = 0;
        }

        this.entries().splice(indexOf, 0, step);
        this._total++;
        this._addedCallback.forEach((callback) => {

            callback(step);
        });
        this._isExcute && this.excute();
    }

    appendStep(step) {

        let indexOf = this.entries().indexOf(this._running);
        if (indexOf <= 0) {

            indexOf = 0;
        }

        this.entries().splice(indexOf + 1, 0, step);
        this._total++;
        this._addedCallback.forEach((callback) => {

            callback(step);
        });
        this._isExcute && this.excute();
    }

    async next(progressCallback) {

        step = this.dequeue();
        this._running = step;
        try {

            if (!step) {

                return false;
            }
            await step.await(progressCallback);
        } catch (error) {}
        this._running = null;
    }

    createStep(name, start, data) {

        let step = new Step(name, start, data);
        this.addStep(step);
        return step;
    }

    addListener(name, handle) {

        if (!["process", "added", "removed"].includes(name)) {
            throw new Error("Event name is support: process, added, removed");
        }

        if(typeof handle !== "function") {
            throw new Error("Event handle is not support");
        }
        let remove = () => {};
        switch (name) {
            case "process":
                
                this._processCallback.push(handle);
                remove = () => {

                    let index = this._processCallback.indexOf(handle);
                    this._processCallback.splice(index, 1);
                };
                break;
            case "added":

                this._addedCallback.push(handle);
                remove = () => {

                    let index = this._addedCallback.indexOf(handle);
                    this._addedCallback.splice(index, 1);
                };
                break;
            case "removed":

                this._removedCallback.push(handle);
                remove = () => {

                    let index = this._removedCallback.indexOf(handle);
                    this._removedCallback.splice(index, 1);
                };
                break;
        }

        return {
            remove
        };
    }

    excute() {

        this._isExcute = true;
        if( this._isRunning ) {

            return;
        }

        this._isRunning = true;
        return new Promise(async (resolve) => {

            const run = async () => {

                await this.next((period, data, step) => {

                    this._processCallback.forEach((callback) => {

                        callback(step, data, period);
                    });
                });

                if (this.length) {

                    return await run();
                }
                return;
            };
            resolve(await run());
            this._isRunning = false;
        });
    }

    get length() {

        return this._queue.length;
    }
}

class Step {

    constructor(name, start, data = null) {

        if (
            !start ||
            (
                typeof start !== "function"
                && !start.then
            )
        ) {

            throw new Error("Step process is not support");
        }

        this.name = name;
        this.period = 0;
        this.data = data;
        this.progressCallback = null;

        this._resolve = null;
        this._reject = null;
        this._run = start;
        this._isFinished = false;

        if(start.then) {
            (async () => {
                this.data = await start || data;
                this.updatePeriod(1, this.data);
            })();
        }
    }

    await(progressCallback) {

        this.progressCallback = progressCallback;
        return new Promise(async (resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;

            let task = this._run;
            if (typeof task === "function") {

                task = task(this.updatePeriod);
            }

            if(task.then) {

                try {
                    
                    this.data = await task || this.data;
                } catch (error) {}
                this.updatePeriod(1, this.data);
            }
        });
    }

    cancel(message) {

        this._reject && this._reject(message);
        this.progressCallback = null;
    }

    done(data = null) {

        this.updatePeriod(1, data);
    }

    updatePeriod(period = 1, data = null) {

        this.period = period;
        this.data = data;
        this.progressCallback 
            && this.progressCallback(period, data, this)
        ;

        if (period >= 1) {

            this._resolve && this._resolve();
            this._isFinished = true;
        }
    }
}

StepProgress.Step = Step;

export default StepProgress;