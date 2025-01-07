import { _decorator, Component, Node, log } from 'cc';
import { PriorityQueue } from '../utilities/PriorityQueue';
const { ccclass, property } = _decorator;

@ccclass('NormalTests')
export class NormalTests extends Component {

    private priorityQueue: PriorityQueue<number>;
    private contents: string = "";

    private ascendingCheck(first: number, second: number): boolean
    {
        return first <= second;
    }

    private appendContents(value: number): void
    {
        this.contents = this.contents.concat(value.toString()).concat(", ");
    }
    start() {
        this.priorityQueue = new PriorityQueue<number>(this.ascendingCheck);

        this.priorityQueue.insert(42);
        log("After adding 42");
        
        this.priorityQueue.traverse(this.appendContents.bind(this));
        
        log(this.contents);

        log("After adding 34");
        this.priorityQueue.insert(34);
        this.contents = "";

        this.priorityQueue.traverse(this.appendContents.bind(this));
        log(this.contents);

        log("After adding 16,30");
        this.priorityQueue.insert(16);
        this.priorityQueue.insert(30);
        this.contents = "";
        
        this.priorityQueue.traverse(this.appendContents.bind(this));
        log(this.contents); 

        log("Getting all the values from priority queue: ");

        this.contents = "";
        while(this.priorityQueue.getCount() > 0)
        {
            this.appendContents(this.priorityQueue.remove());
        }

        log(this.contents);

        
    }
}


