import { log, error } from "cc";
export class ObjectPool<T>{
    
    private containerQueue: T[] = [];
    private maxCount: number = 0;
    private createFunc: () => T;
    private gettingFunc: (value: T) => void;
    private returnPoolFunc: (value: T) => void;
    private destroyFunc: (value: T) => void;
    
    public constructor(createFunc: () => T, 
                       gettingFunc: (value: T) => void, 
                       returnPoolFunc: (value: T) => void,
                       destroyFunc:(value: T)=> void,
                       maxCount: number)
    {
        this.maxCount = maxCount;
        this.createFunc = createFunc;
        this.gettingFunc = gettingFunc;
        this.returnPoolFunc = returnPoolFunc;
        this.destroyFunc = destroyFunc;

        //log("Queue size before: " + this.containerQueue.length);

        for(let i = 0; i < maxCount; i++)
        {
            let copy: T = this.createFunc();
            if(copy === undefined)
            {
                error("Cannot make object pool of undefined items!");
                return;
            }
            this.containerQueue.unshift(copy);
        }

        //log("Queue size: " + this.containerQueue.length);
    }

    public getValueFromPool(): T
    {
        if(this.containerQueue.length <= 0)
        {
            return undefined;
        }

        let value: T = this.containerQueue.pop();
        this.gettingFunc(value);
        return value;
    }

    public returnValueToPool(value: T): void
    {
        if(this.containerQueue.length >= this.maxCount)
        {
            return;
        }

        this.returnPoolFunc(value);
        this.containerQueue.unshift(value);
    }

    public clear(): void
    {
        while(this.containerQueue.length > 0)
        {
            let value = this.containerQueue.pop();
            this.destroyFunc(value);
        }
    }
}


