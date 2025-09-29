import { _decorator, Component, Node, PhysicsSystem, geometry, math, Vec3, Color, Quat, log, Enum } from 'cc';
import { PhysicsGroup } from '../core/PhysicsGroup';
import { VisualDebug } from '../core/VisualDebug';
import { MathUtility } from '../utilities/MathUtility';
const { ccclass, property } = _decorator;

@ccclass('LineOfSightSensor')
export class LineOfSightSensor extends Component {
    
    @property
    ({
        range:[60.0, 180.0]
    })
    private checkAngle: number = 90.0;

    @property
    ({
        range:[0.1, 30.0]
    })
    private maxCheckRadius: number = 3.0;
    
    @property
    ({
        min: 0.01
    })
    private checkInterval: number = 0.1;
    
    @property
    ({
        type: Enum(PhysicsGroup),
        visible: true
    })
    private checkGroup: PhysicsGroup = PhysicsGroup.DEFAULT;

    @property
    private shouldShowDetected: boolean = true;

    @property
    ({
        type: Color,
        visible: true,
        serializable: true
    })
    private debugColor: Color;

    private currentTime: number = 0.0;
    private detectedTargets: Node[] = [];
    private sphereCheckRay: geometry.Ray = null;
    private lineCheckRay: geometry.Ray = null;
    
    
    public getDetectedTargets(): Node[]
    {
        return this.detectedTargets;
    }

    private handleDetection(): void
    {
        this.sphereCheckRay.o = this.node.worldPosition.clone();
        this.detectedTargets = [];
        
        if(PhysicsSystem.instance.sweepSphere(this.sphereCheckRay, this.maxCheckRadius, this.checkGroup, this.maxCheckRadius * 2.0))
        {
            for(let result of PhysicsSystem.instance.sweepCastResults)
            {
                //log("Overlap detected node: " + result.collider.node.name);
                let position = result.collider.node.worldPosition.clone();
                let direction = position.subtract(this.sphereCheckRay.o.clone()).normalize();
                let angle: number = math.toDegree(Vec3.signedAngle(this.node.forward.clone().negative(), direction, this.node.up.clone()));
                
                

                if(!(angle >= -this.checkAngle/2.0 && angle <= this.checkAngle/2.0))
                {
                    continue;
                }

                //log("Detected node name: " + result.collider.node.name);
                //log("detected node angle: " + angle);
                
                this.lineCheckRay.o = this.node.worldPosition.clone();
                this.lineCheckRay.d = direction.clone();

                if(PhysicsSystem.instance.raycastClosest(this.lineCheckRay, -1, this.maxCheckRadius))
                {
                    //log("Line check node name: " + PhysicsSystem.instance.raycastClosestResult.collider.node.name);
                    let lineCheckColliderUUID = PhysicsSystem.instance.raycastClosestResult.collider.uuid;
                    
                    if(lineCheckColliderUUID !== result.collider.uuid)
                    {
                        continue;
                    }
                }

                this.detectedTargets.push(result.collider.node);
            } 
        }
    }

    private handleDetectedVisual(): void
    {
        for(var current of this.detectedTargets)
        {
            VisualDebug.getInstance()?.drawLine(this.node.worldPosition.clone(), current.worldPosition.clone(), Color.RED);
        }
    }

    private handleLOSVisual(): void
    {
        let origin = this.node.worldPosition.clone();
        //log("Origin position: " + origin.toString());
        
        let left: Vec3 = MathUtility.rotateVector(this.node.forward.clone().negative(), this.node.up.clone(), -this.checkAngle/2.0);

        let right: Vec3 = MathUtility.rotateVector(this.node.forward.clone().negative(), this.node.up.clone(), this.checkAngle/2.0);

        
        VisualDebug.getInstance().drawLine(origin, origin.clone().add(left.clone().multiplyScalar(this.maxCheckRadius)), this.debugColor.clone());
        VisualDebug.getInstance().drawLine(origin, origin.clone().add(right.clone().multiplyScalar(this.maxCheckRadius)), this.debugColor.clone());
    }

    start() 
    {
        this.currentTime = 0.0;
        this.sphereCheckRay = new geometry.Ray(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z, 0.0, -1.0, 0.0);
        this.lineCheckRay = new geometry.Ray(this.node.worldPosition.x, this.node.worldPosition.y, this.node.worldPosition.z, 0.0, 0.0, 1.0);
    }

    update(deltaTime: number) 
    {
        this.handleLOSVisual();
        
        if(this.shouldShowDetected)
        {
            this.handleDetectedVisual();
        }

        if(this.currentTime >= this.checkInterval)
        {
            this.currentTime = 0.0;
            this.handleDetection();
            return;
        }

        this.currentTime += deltaTime;
    }


}


