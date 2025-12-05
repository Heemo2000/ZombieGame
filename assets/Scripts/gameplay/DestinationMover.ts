import { _decorator, Component, Node, Vec2, Vec3, Color, log } from 'cc';
import { CharacterMovement } from './CharacterMovement';
import { GlobalReferencesManager } from './GlobalReferencesManager';
const { ccclass, property } = _decorator;

@ccclass('DestinationMover')
export class DestinationMover extends Component {

    @property
    ({
        visible: true
    })
    private startPosition: Vec3 = Vec3.ZERO.clone();

    @property
    ({
        visible: true
    })
    private endPosition: Vec3 = Vec3.ZERO.clone();

    @property
    ({
        min: 0.1
    })
    private waypointChangeDistance: number = 0.5;

    @property
    ({
        min: 0.1
    })
    private updatePathInterval = 0.2;

    @property
    private shouldGoToDestination: boolean = false;

    @property
    ({
        min: 0.1,
        visible: true
    })
    private moveSpeed: number = 10.0;

    @property
    ({
        min: 10.0,
        visible: true
    })
    private rotateSpeed: number = 10.0;

    @property
    private viewPath: boolean = false;

    private movement: CharacterMovement = null;
    private path: Vec3[] = [];
    private waypointIndex: number = 0;    
    private currentTime: number = 0.0;
    private reachedDestination: boolean = false;


    public hasReachedDestination(): boolean
    {
        return this.reachedDestination;
    }

    public setDestination(destination: Vec3): void
    {
        this.endPosition = destination;
    }

    public setShouldGoToDestination(status: boolean): void
    {
        this.shouldGoToDestination = status;
    }

    public setMoveSpeed(speed: number): void
    {
        this.moveSpeed = speed;
    }

    public setRotateSpeed(speed: number): void
    {
        this.rotateSpeed = speed;
    }

    public updatePath(): void
    {
        if(!this.shouldGoToDestination)
        {
            return;
        }
        
        this.startPosition = this.node.worldPosition;
        let pathfindingManager = GlobalReferencesManager.getInstance()?.
                                                         getPathfindingManager();
         
        if(pathfindingManager != null)
        {
            this.path = pathfindingManager.
                        generatePath(this.startPosition.clone(), this.endPosition.clone());
        }
        else
        {
            this.path = [];
        }
        
        this.waypointIndex = 0;
    }

    private handleWaypointGoing(): void
    {
        if(this.path == null || this.path.length == 0 || this.waypointIndex >= this.path.length || !this.shouldGoToDestination)
        {
            this.reachedDestination = true;
            this.movement.handleMovement(Vec2.ZERO.clone(), this.moveSpeed, this.rotateSpeed);
            return;
        }

        this.reachedDestination = false;

        let currentWaypoint: Vec3 = this.path[this.waypointIndex].clone();
        let squareDistance: number = Vec3.squaredDistance(this.node.worldPosition.clone(), currentWaypoint);

        let direction: Vec2 = new Vec2(this.node.worldPosition.x - currentWaypoint.x, currentWaypoint.z - this.node.worldPosition.z).normalize();

        this.movement.handleMovement(direction, this.moveSpeed, this.rotateSpeed);

        if(squareDistance <= this.waypointChangeDistance * this.waypointChangeDistance)
        {
            this.waypointIndex++;
        }
    }

    private drawPath(): void
    {
        let visualDebug = GlobalReferencesManager.getInstance().getVisualDebug();
        for(let i = 0; i < this.path.length - 1; i++)
        {
            let currentWaypoint = this.path[i];
            let nextPoint = this.path[i+1];

            visualDebug.drawLine(currentWaypoint, nextPoint, Color.RED);
        }
    }

    start() {
        this.movement = this.getComponent(CharacterMovement);
    }

    update(deltaTime: number) {
        
        this.currentTime += deltaTime;

        if(this.currentTime >= this.updatePathInterval)
        {
            this.currentTime = 0.0;
            this.updatePath();
        }

        this.handleWaypointGoing();
        this.drawPath();
    }
}


