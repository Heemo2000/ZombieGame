import { _decorator, Component, Node, PhysicsSystem, Vec2, log } from 'cc';
import { GameInput } from '../core/GameInput';
import { CharacterMovement } from './CharacterMovement'
const { ccclass, property } = _decorator;



@ccclass('ZombiePlayer')
export class ZombiePlayer extends Component {
    @property
    ({
        type: GameInput,
        visible: true
    })
    private gameInput: GameInput = null;

    @property
    private rotateSpeed: number = 10.0;

    @property
    ({
        min: 10.0
    })
    private normalSpeed: number = 10.0;

    @property
    ({
        min: 20.0
    })
    private runningSpeed: number = 40.0;

    @property
    ({
        min: 5.0
    })
    private crawlSpeed: number = 5.0;

    private movement: CharacterMovement = null;

    private moveInput: Vec2 = Vec2.ZERO.clone();
    

    start() {
        this.movement = this.getComponent(CharacterMovement);
    }
    update(deltaTime: number) {
        let moveInput = this.gameInput.getMoveInputNormalized().clone();
        //log("Move Input: " + moveInput);
        
        this.moveInput.set(moveInput);
        this.movement.handleGravity();
        if(this.gameInput.crawling())
        {
            this.movement.handleMovement(this.moveInput, this.crawlSpeed, this.rotateSpeed);    
        }
        else if(this.gameInput.running())
        {
            this.movement.handleMovement(this.moveInput, this.runningSpeed, this.rotateSpeed);
        }
        else
        {
            this.movement.handleMovement(this.moveInput, this.normalSpeed, this.rotateSpeed);
        }
        
    }
}



