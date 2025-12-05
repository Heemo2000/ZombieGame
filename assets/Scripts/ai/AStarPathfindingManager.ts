import { _decorator, Component, Node, Vec3, PhysicsSystem, EPhysicsDrawFlags } from 'cc';
import { AStarPathfinding } from './AStarPathfinding';
const { ccclass, property } = _decorator;

@ccclass('AStarPathfindingManager')
export class AStarPathfindingManager extends Component {
    
    private pathfinding: AStarPathfinding = null;

    public showPath(path: Vec3[]): void
    {
        if(this.pathfinding == null || this.pathfinding == undefined)
        {
            return;
        }
        this.pathfinding.showPath(path);
    }

    public generatePath(start: Vec3, end: Vec3) : Vec3[]
    {
        if(this.pathfinding == null || this.pathfinding == undefined)
        {
            return [];
        }
        return this.pathfinding.findPath(start, end);
    }

    public checkGrid(): void
    {
        if(this.pathfinding == null || this.pathfinding == undefined)
        {
            return;
        }
        this.pathfinding.checkGrid();
    }

    start() 
    {
        this.pathfinding = this.getComponent(AStarPathfinding);
        this.pathfinding.checkGrid();
    }

    lateUpdate(deltaTime: number) 
    {        
        this.pathfinding.showGrid();    
    }
}


