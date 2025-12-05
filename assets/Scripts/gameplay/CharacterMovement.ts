import { _decorator, Component, Node, BoxCollider, RigidBody, physics, PhysicsSystem, geometry,Vec2, Vec3, math, IVec3Like,
    Quat,
    log,
    EventHandler,
    EPhysicsDrawFlags
 } from 'cc';

import { PhysicsGroup } from '../core/PhysicsGroup'
import { MathUtility } from '../utilities/MathUtility';
//import { VisualDebug } from '../core/VisualDebug';
const { ccclass, property } = _decorator;

@ccclass('CharacterMovement')
export class CharacterMovement extends Component {
    @property
    private mass: number = 1.0;

    @property
    private gravity: number = 9.8;
    
    @property(
        {
            type: Node,
            visible: true
        }
    )
    private groundCheck: Node = null;
    
    @property
    private groundCheckRadius: number = 1.0;


    @property({
        type: EventHandler
    })
    public OnMove: EventHandler[] = []
    
    private rigidBody: RigidBody;
    private boxCollider: BoxCollider;
    private velocityY: number = 0.0;
    
    public handleGravity() : void
    {
        
        let checkRay = new geometry.Ray(this.groundCheck.worldPosition.x, this.groundCheck.worldPosition.y, this.groundCheck.worldPosition.z,
                                              0.0, -1.0, 0.0);
        
        
        let checkGroup = PhysicsGroup.GROUND | PhysicsGroup.WORLD | PhysicsGroup.DEFAULT;
        
        //VisualDebug.getInstance().drawSphere(checkRay.o, this.groundCheckRadius, Color.RED);
        //log("Check group: " + checkGroup.toString(2));
        let detectSomething = PhysicsSystem.instance.sweepSphereClosest(checkRay, this.groundCheckRadius, checkGroup, this.groundCheckRadius, true);
        if(detectSomething)
        {
            //log("Detected node name: " + PhysicsSystem.instance.sweepCastClosestResult.collider.node.name); 
            this.velocityY = 0.0;
        }
        else
        {
            let currentVelocityY = this.velocityY;
            let currentGravity = this.gravity;

            let newVelocityY = currentVelocityY - (currentGravity * PhysicsSystem.instance.fixedTimeStep);
            let nextVelocityY = (currentVelocityY + newVelocityY) * 0.5;
            this.velocityY = nextVelocityY;
        }

        //log("Velocity Y: " + this.velocityY.toString());
        
    }
    public handleMovement(moveInput: Vec2, moveSpeed: number, rotateSpeed: number) : void
    {
        let moveDirection = new Vec3(-moveInput.x, 0.0, moveInput.y);
        
        let fixedTimestep = PhysicsSystem.instance.fixedTimeStep;
        
        let requiredVel = moveDirection.clone().multiplyScalar(moveSpeed).add(new Vec3(0.0, this.velocityY, 0.0));
        this.rigidBody.setLinearVelocity(requiredVel);
        EventHandler.emitEvents(this.OnMove, moveInput);
        
        if(moveInput.x == 0.0 && moveInput.y == 0.0)
        {
            this.rigidBody.setAngularVelocity(Vec3.ZERO.clone());
            return;
        }
        

        let targetAngle = Vec3.signedAngle(new Vec3(0.0, 0.0, 1), moveDirection.clone(), Vec3.UP.clone());
        targetAngle = math.toDegree(targetAngle);

        //log("Target angle: " + targetAngle);
    
        let currentRotation = new Vec3();
        this.node.worldRotation.getEulerAngles(currentRotation);

        
        this.node.setWorldRotationFromEuler(currentRotation.x, 
                                            MathUtility.lerpAngle(currentRotation.y, targetAngle, rotateSpeed * fixedTimestep), 
                                            currentRotation.z);
    }


    start() {
        this.rigidBody = this.getComponent(RigidBody);
        this.boxCollider = this.getComponent(BoxCollider);
        this.rigidBody.mass = this.mass;
        this.rigidBody.useGravity = false;
        this.rigidBody.angularFactor = new Vec3(0.0,1.0,0.0);
    }
}



