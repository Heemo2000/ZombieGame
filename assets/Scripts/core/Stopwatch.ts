
export class Stopwatch
{    
    protected currentTime: number = 0.0;

    protected shouldTimerContinue: boolean = false;

    public constructor() 
    {
        this.shouldTimerContinue = false;
        this.currentTime = 0.0;
    }

    public update(deltaTime: number) 
    {
        if(this.shouldTimerContinue)
        {
            this.currentTime += deltaTime;    
        }    
    }
    
    public getElapsedTime(): number
    {
        return this.currentTime;
    }

    public resetTimer(): void
    {
        this.currentTime = 0.0;
        this.shouldTimerContinue = false;
    }

    public startTimer(): void
    {
        this.shouldTimerContinue = true;
    }
}


