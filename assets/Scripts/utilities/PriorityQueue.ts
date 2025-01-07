import { log, error, warn } from "cc";
import { LinkedListNode } from "./LinkedListNode"

export class PriorityQueue<T> {
    
    private head: LinkedListNode<T> = null;
    private count: number = 0;
    private comparer: (first: T, second: T) => boolean;
    
    public constructor(comparer: (first: T, second: T) => boolean)
    {
        this.head = null;
        this.count = 0;
        this.comparer = comparer;
    }
    
    // Returns the number of elements in priority queue.
    public getCount(): number
    {
        return this.count;
    }

    // Inserts the value according to the comparer set in the constructor.
    public insert(value: T): void
    {
        if(value == null || value == undefined)
        {
            error("Value cannot be null or undefined in Priority Queue!!");
            return;
        }

        let newNode = new LinkedListNode<T>(value);
        
        if(this.head == null)
        {
            this.head = newNode;
            this.count++;
            return;
        }

        
        let previous = null;
        let current = this.head;

        while(current != null && this.comparer( value, current.getValue()) != true)
        {
            previous = current;
            current = current.getNext();
        }

        if(previous == null)
        {
            newNode.setNext(this.head);
            this.head = null;
            this.head = newNode;
        }
        else
        {
            previous.setNext(newNode);    
        }
        
        newNode.setNext(current);
        this.count++;
    }

    // Gets the value of the top priority and removes the node linked to it.
    public remove(): T
    {
        if(this.head == null)
        {
            return undefined;
        }

        let result = this.head.getValue();
        let next = this.head.getNext();
        
        this.head = null;
        this.head = next;
        this.count--;
        return result;
    }

    // Gets the value of the top priority
    public peek(): T
    {
        if(this.head == null)
        {
            return undefined;
        }

        return this.head.getValue();
    }

    public traverse(callback: (value: T)=> void): void
    {
        if(this.head == null)
        {
            return;
        }
        let current = this.head;
        while(current != null)
        {
            callback(current.getValue());
            current = current.getNext();
        }
    }

    public clear(): void
    {
        while(this.getCount() > 0)
        {
            this.remove();
        }
    }

    public contains(value: T): boolean
    {
        let current = this.head;
        while(current != null)
        {
            if(current.getValue() == value)
            {
                return true;
            }
            current = current.getNext();
        }

        return false;
    }

    public removeValue(value: T): void
    {
        if(this.head == null)
        {
            warn("Priority queue is already empty.");
            return;
        }

        let previous: LinkedListNode<T> = null;
        let current = this.head;
        while(current != null)
        {
            if(current.getValue() == value)
            {
                break;
            }
            previous = current;
            current = current.getNext();
        }

        if(previous == null)
        {
            this.head = null;
        }
        else
        {
            previous.setNext(current.getNext());
            current = null;
        }
    }
}


