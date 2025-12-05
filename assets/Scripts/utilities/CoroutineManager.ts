import { Component } from 'cc';

export class WaitForSeconds {
    constructor(public seconds: number) {}
}

export class WaitForFrames {
    constructor(public frames: number) {}
}

type CoroutineState = {
    generator: Generator;
    component: Component;

    timeHandle?: () => void;
    frameHandle?: () => void;
    remainingFrames?: number;
};

export class CoroutineManager {

    private static coroutines = new Map<number, CoroutineState>();
    private static idCounter = 0;

    static start(generator: Generator, component: Component): number {
        const id = this.idCounter++;
        this.coroutines.set(id, { generator, component });
        this.step(id);
        return id;
    }

    static stop(id: number) {
        const state = this.coroutines.get(id);
        if (!state) return;

        if (state.timeHandle) {
            state.component.unschedule(state.timeHandle);
        }
        if (state.frameHandle) {
            state.component.unschedule(state.frameHandle);
        }

        this.coroutines.delete(id);
    }

    private static step(id: number) {
        const state = this.coroutines.get(id);
        if (!state) return;

        const result = state.generator.next();
        if (result.done) {
            this.stop(id);
            return;
        }

        const yieldValue = result.value;

        // Here is support for 'yield null'
        if (yieldValue === null) {
            state.timeHandle = () => this.step(id);
            state.component.scheduleOnce(state.timeHandle, 0);
            return;
        }
        
        if (yieldValue instanceof WaitForSeconds) {
            state.timeHandle = () => this.step(id);
            state.component.scheduleOnce(state.timeHandle, yieldValue.seconds);

        } else if (yieldValue instanceof WaitForFrames) {
            state.remainingFrames = yieldValue.frames;
            state.frameHandle = () => {
                if (!this.coroutines.has(id)) return; // stopped
                state.remainingFrames!--;
                if (state.remainingFrames! <= 0) {
                    state.component.unschedule(state.frameHandle!);
                    this.step(id);
                }
            };
            state.component.schedule(state.frameHandle, 0);

        } else if (typeof yieldValue === "number") {
            state.timeHandle = () => this.step(id);
            state.component.scheduleOnce(state.timeHandle, yieldValue);

        } else {
            state.timeHandle = () => this.step(id);
            state.component.scheduleOnce(state.timeHandle, 0);
        }
    }
}



