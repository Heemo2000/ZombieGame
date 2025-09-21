import { _decorator, Component, Node, BoxCollider, RigidBody, physics, PhysicsSystem, geometry,Vec2, Vec3, math, IVec3Like,
    Quat,
    //log,
    EventHandler
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
        type: PhysicsGroup,
        visible: true
    })
    private surroundingsGroup: PhysicsGroup = PhysicsGroup.DEFAULT;

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
        
        
        let checkGroup = PhysicsGroup.GROUND | PhysicsGroup.WORLD;
        
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
        
        let checkRay = new geometry.Ray(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z,
                                        moveDirection.x, moveDirection.y, moveDirection.z);

        let obstructionGroup = this.surroundingsGroup;

        let halfExtent: IVec3Like = this.boxCollider.size.multiplyScalar(0.5);//{x: this.boxCollider.size.x / 2.0, y: this.boxCollider.size.y / 2.0, z: this.boxCollider.size.z/2.0};
        
        let rotation = new Quat();
        this.node.getWorldRotation(rotation);
        
        let fixedTimestep = PhysicsSystem.instance.fixedTimeStep;
        let isObstructionThere = PhysicsSystem.instance.sweepBoxClosest(checkRay, halfExtent, rotation, obstructionGroup, moveSpeed * fixedTimestep, true);
        
        if(isObstructionThere)
        {
            //log("Can't move in original direction, checking X and Z axis");
            let moveDirectionX = new Vec3(moveDirection.x, 0.0, 0.0);
            checkRay = new geometry.Ray(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z,
                                        moveDirectionX.x, moveDirectionX.y, moveDirectionX.z);

            isObstructionThere = moveDirectionX.x != 0.0 && PhysicsSystem.instance.sweepBoxClosest(checkRay, halfExtent, rotation, obstructionGroup, 
                                                  moveSpeed * fixedTimestep, true);
            if(!isObstructionThere)
            {
                //log("Setting direction to X axis");
                moveDirection = moveDirectionX;
            }
            else
            {
                let moveDirectionZ = new Vec3(0.0, 0.0, moveDirection.z);
                checkRay = new geometry.Ray(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z,
                                            moveDirectionZ.x, moveDirectionZ.y, moveDirectionZ.z);

                isObstructionThere = moveDirectionZ.z != 0.0 && PhysicsSystem.instance.sweepBoxClosest(checkRay, halfExtent, rotation, obstructionGroup, 
                                                                                             moveSpeed * fixedTimestep, true);
                if(!isObstructionThere)
                {
                    //log("Setting direction to Z axis");
                    moveDirection = moveDirectionZ;
                }
                else
                {
                    moveDirection = Vec3.ZERO;
                }
            }
        }
        
        let requiredVel = moveDirection.clone().multiplyScalar(moveSpeed).add(new Vec3(0.0, this.velocityY, 0.0));
        this.rigidBody.setLinearVelocity(requiredVel);
        EventHandler.emitEvents(this.OnMove, moveInput);
        
        if(moveInput.x == 0.0 && moveInput.y == 0.0)
        {
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



