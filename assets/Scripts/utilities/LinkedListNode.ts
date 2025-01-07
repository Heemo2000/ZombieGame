
export class LinkedListNode<T> {
    
    private value: T | null | undefined;
    private next: LinkedListNode<T> = null;

    public constructor(value: T)
    {
        this.value = value;
        this.next = null;
    }

    public getValue(): T
    {
        return this.value;
    }

    public getNext(): LinkedListNode<T>
    {
        return this.next;
    }

    

    public setValue(value: T): void
    {
        this.value = value;
    }

    public setNext(next: LinkedListNode<T>): void
    {
        this.next = next;
    }
}


