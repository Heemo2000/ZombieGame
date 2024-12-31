import { _decorator, Component, Node, input, Input, EventKeyboard, Vec2, KeyCode, log } from 'cc';
const { ccclass, property } = _decorator;



@ccclass('GameInput')
export class GameInput extends Component {
    
    
    private moveInput: Vec2 = Vec2.ZERO.clone();
    private isCrawling: boolean = false;
    private isRunning: boolean = false;

    public crawling(): boolean
    {
        return this.isCrawling;
    }

    public running(): boolean
    {
        return this.isRunning;
    }
    
    public getMoveInput(): Vec2
    {
        return this.moveInput;
    }

    public getMoveInputNormalized(): Vec2
    {
        return this.moveInput.normalize();
    }

    private onKeyDown(event: EventKeyboard) : void
    {
        //Movement input
        if(event.keyCode == KeyCode.KEY_W)
        {
            //log("Pressing W");
            this.moveInput.set(this.moveInput.x, 1.0);
        }
    
        if(event.keyCode == KeyCode.KEY_S)
        {
            //log("Pressing S");
            this.moveInput.set(this.moveInput.x, -1.0);
        }
    
        if(event.keyCode == KeyCode.KEY_D)
        {
            //log("Pressing D");
            this.moveInput.set(1.0, this.moveInput.y);
        }
        
        if(event.keyCode == KeyCode.KEY_A)
        {
            //log("Pressing A");
            this.moveInput.set(-1.0, this.moveInput.y);
        }

        //Crawling input
        if(event.keyCode == KeyCode.CTRL_LEFT || event.keyCode == KeyCode.CTRL_RIGHT)
        {
            this.isCrawling = true;
        }

        //Sprinting input
        if(event.keyCode == KeyCode.SHIFT_LEFT || event.keyCode == KeyCode.SHIFT_RIGHT)
        {
            this.isRunning = true;
        }

        if(this.isCrawling && this.isRunning)
        {
            this.isCrawling = false;
            this.isRunning = false;
        }
    }
    
    private onKeyUp(event: EventKeyboard) : void
    {
        if(event.keyCode == KeyCode.KEY_W || event.keyCode == KeyCode.KEY_S)
        {
            this.moveInput.set(this.moveInput.x, 0.0);
        }
    
        if(event.keyCode == KeyCode.KEY_D || event.keyCode == KeyCode.KEY_A)
        {
            this.moveInput.set(0.0, this.moveInput.y);
        }

        if(event.keyCode == KeyCode.CTRL_LEFT || event.keyCode == KeyCode.CTRL_RIGHT)
        {
            this.isCrawling = false;
        }

        //Sprinting input
        if(event.keyCode == KeyCode.SHIFT_LEFT || event.keyCode == KeyCode.SHIFT_RIGHT)
        {
            this.isRunning = false;
        }
    }
    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_PRESSING, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}



