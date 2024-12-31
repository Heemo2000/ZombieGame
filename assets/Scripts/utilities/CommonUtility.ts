import { _decorator, Component, Node } from 'cc';


export class CommonUtility {
    public static stopCoroutine(coroutine: any): void {
        if (coroutine != null) {
            clearTimeout(coroutine);
            coroutine = null;
        }
    }

    public static startCoroutine(generatorFunc: () => Generator<any>): any {
        const iterator = generatorFunc();
        const process = (result: IteratorResult<any>) => {
            if (!result.done) {
                if (result.value instanceof Promise) {
                    result.value.then(() => process(iterator.next()));
                } else {
                    setTimeout(() => process(iterator.next()), 0);
                }
            }
        };
        process(iterator.next());
        return iterator;
    }
}


