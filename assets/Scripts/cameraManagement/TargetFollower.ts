import { _decorator, Component, Node, Camera, CCBoolean, CCFloat, Vec3, Quat, error, log } from 'cc';
import { MathUtility } from '../utilities/MathUtility';
const { ccclass, property } = _decorator;

/*This script is responsible for making the camera to follow and look towards the target.
*/
@ccclass('TargetFollower')
export class TargetFollower extends Component {

    @property(
        {
            type: Node,
            visible: true
        }
    )
    private target: Node = null;

    @property
    private following: boolean = true;

    @property(
        {
            type: CCFloat,
            min: 0.0
        }
    )
    private followSpeed: number = 10.0;

    @property(
        {
            visible: true
        }
    )
    private offset: Vec3 = Vec3.ZERO.clone();

    private camera: Camera = null;

    private followPosition: Vec3 = Vec3.ZERO;


    start() {
        this.camera = this.getComponent(Camera);
        if(this.camera == null)
        {
            error("Camera component is null!");
            return;
        }

        this.followPosition = this.camera.node.worldPosition.clone();
        
    }

    protected lateUpdate(deltaTime: number): void {
        
        
        if(this.camera == null)
        {
            error("Camera component is null!");
            return;
        }

        if(this.target == null)
        {
            error("Follow transform is null!");
            return;
        }


        if(this.following)
        {
            let targetPosition = this.target.worldPosition.clone().add(this.offset);
            //log("Target Position: " + targetPosition);

            let temp = this.node.worldPosition.clone();
            Vec3.lerp(temp , this.followPosition, targetPosition, this.followSpeed * deltaTime);
            this.followPosition.set(temp);

            this.camera.node.setWorldPosition(this.followPosition);
        }

        //log("Follow position: " + this.followPosition);
        //log("Look at direction: " + this.lookAtDirection);
    }
}


