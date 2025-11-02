import { _decorator, CCInteger, Component, Material, Node, Mesh, utils, primitives, Vec3, PhysicsSystem, geometry, Enum, MeshRenderer, Color } from 'cc';


import { LineOfSightSensor } from './LineOfSightSensor';
import { MathUtility } from '../utilities/MathUtility';
import { PhysicsGroup } from '../core/PhysicsGroup';
import { VisualDebug } from '../core/VisualDebug';

const { MeshUtils } = utils;
const { ccclass, property } = _decorator;

@ccclass('FieldOfViewEffect')
export class FieldOfViewEffect extends Component {
    
    @property
    ({
        type: LineOfSightSensor
    })
    private sensor: LineOfSightSensor;

    @property
    ({
        type: CCInteger,
        min: 2
    })
    private rayCount: number = 32;

    @property
    ({
        type: Material
    })
    private effectMaterial: Material;

    @property
    ({
        min: 0.02
    })
    private updateTime: number = 0.2;

    @property
    ({
        type: Enum(PhysicsGroup),
        visible: true
    })
    private checkGroup: PhysicsGroup = PhysicsGroup.DEFAULT;

    private currentTime: number = 0.0;

    private geo: primitives.IDynamicGeometry = null;
    private positions: Float32Array<ArrayBuffer>;
    private normals: Float32Array<ArrayBuffer>;
    private indices: number[];
    private tempRay: geometry.Ray = null;
    private minPos: Vec3 = new Vec3();
    private maxPos: Vec3 = new Vec3();
    private mesh: Mesh = null;
    private meshRenderer: MeshRenderer = null;
    
    private updateMesh(): void
    {
        let maxPositionsCount: number = this.rayCount + 1 + 1; //One for all raycounts, +1 for center vertex, +1 to close the loop.

        this.positions = new Float32Array(maxPositionsCount * 3);
        this.normals   = new Float32Array(maxPositionsCount * 3);

        this.minPos.set(Infinity, Infinity, Infinity);
        this.maxPos.set(-Infinity, -Infinity, -Infinity);

        const origin = Vec3.ZERO;
        this.positions[0] = origin.x;
        this.positions[1] = origin.y;
        this.positions[2] = origin.z;

        Vec3.min(this.minPos, this.minPos, origin);
        Vec3.max(this.maxPos, this.maxPos, origin);

        this.normals[0] = 0;
        this.normals[1] = 1;
        this.normals[2] = 0;

        const startAngle = -this.sensor.getCheckAngle() / 2.0;
        const angleDelta = this.sensor.getCheckAngle() / this.rayCount;
        const localForward = new Vec3(0, 0, 1); // Unity/Cocos default forward
        const localUp = new Vec3(0, 1, 0);

        for (let i = 0; i <= this.rayCount; i++)
        {
            let angle = startAngle + angleDelta * i;
            let localDirection = MathUtility.rotateVector(localForward, localUp, angle);

            // Correctly rotate from local → world space
            let worldDirection = new Vec3();
            Vec3.transformQuat(worldDirection, localDirection, this.node.worldRotation);
            
            let localEndPosition = origin.clone().add(localDirection.clone().multiplyScalar(this.sensor.getMaxCheckRadius()));
            let worldEndPosition = this.node.worldPosition.clone().add(worldDirection.clone().multiplyScalar(this.sensor.getMaxCheckRadius()));

            
            if(this.tempRay == null)
            {
                this.tempRay = new geometry.Ray();
            }
            
            this.tempRay.o = this.node.worldPosition.clone();
            this.tempRay.d = worldDirection;

            //VisualDebug.getInstance().drawLine(this.tempRay.o, this.tempRay.o.clone().add(this.tempRay.d.multiplyScalar(this.sensor.getMaxCheckRadius())), Color.YELLOW);

            // Use closest raycast
            if (PhysicsSystem.instance.raycastClosest(this.tempRay, this.checkGroup, this.sensor.getMaxCheckRadius())) {
                const result = PhysicsSystem.instance.raycastClosestResult;
                if (result) {
                    this.node.inverseTransformPoint(localEndPosition, result.hitPoint);
                    worldEndPosition = result.hitPoint.clone();
                }
            }

            const index = (i + 1) * 3;
            this.positions[index + 0] = localEndPosition.x;
            this.positions[index + 1] = localEndPosition.y;
            this.positions[index + 2] = localEndPosition.z;

            this.normals[index + 0] = 0.0;
            this.normals[index + 1] = 1.0;
            this.normals[index + 2] = 0.0;

            Vec3.min(this.minPos, this.minPos, localEndPosition);
            Vec3.max(this.maxPos, this.maxPos, localEndPosition);
        }

        // Build index array (triangle fan)
        // Each triangle: (center, vertex_i, vertex_i+1)
        const indices = new Uint32Array(this.rayCount * 3);
        for (let i = 0; i < this.rayCount; i++) {
            const next = (i + 1);
            indices[i * 3 + 0] = 0;        // center vertex
            indices[i * 3 + 1] = i + 1;    // current outer vertex
            indices[i * 3 + 2] = next + 1; // next outer vertex
        }

        //Prepare geometry descriptor
        this.geo = {
            positions: this.positions,
            normals: this.normals,
            indices32: indices,
            minPos: this.minPos,
            maxPos: this.maxPos
        };

        // Create and assign mesh
        this.mesh = utils.MeshUtils.createDynamicMesh(0, this.geo);
        this.meshRenderer.mesh = this.mesh;
        this.meshRenderer.onGeometryChanged();

        this.meshRenderer.material = this.effectMaterial;

    }

    protected start(): void 
    {
        this.meshRenderer = this.getComponent(MeshRenderer);    
        this.meshRenderer.material = this.effectMaterial;
    }

    update(deltaTime: number) 
    {
        this.currentTime += deltaTime;

        if(this.currentTime >= this.updateTime)
        {
            this.currentTime = 0.0;
            this.updateMesh();
            return;
        }    
    }
}


