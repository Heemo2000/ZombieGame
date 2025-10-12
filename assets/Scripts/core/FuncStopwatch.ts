import { Stopwatch } from "./Stopwatch";


export class FuncStopwatch extends Stopwatch
{
    private condition: ()=> boolean;
    
    public constructor(condition: ()=> boolean)
    {
        super();
        this.condition = condition;
    }

    public setCondition(condition: ()=> boolean): void
    {
        this.condition = condition;
    }

    public update(deltaTime: number): void 
    {
        if(this.shouldTimerContinue && this.condition != null && this.condition() == true)
        {
            this.currentTime += deltaTime;
        }
    }
}


