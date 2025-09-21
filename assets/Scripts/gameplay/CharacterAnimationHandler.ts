import { _decorator, Component, Node, animation, Vec2, log, math } from 'cc';
import { Constants } from '../core/Constants';
const { ccclass, property } = _decorator;

@ccclass('CharacterAnimationHandler')
export class CharacterAnimationHandler extends Component {

    private animController: animation.AnimationController; 
    
    public handleMoveAnimations(moveInput: Vec2): void
    {
        
        this.animController.setValue(Constants.MOVE_ANIM_PARAM, Math.abs(moveInput.length()));
        //log("Moving: " + moveInput.toString());
    }
    
    start() {
        this.animController = this.getComponent(animation.AnimationController);
    }


}


