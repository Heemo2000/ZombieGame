import { _decorator, Vec2, Vec3 } from 'cc';
import { Grid } from '../utilities/Grid';
const { ccclass, property } = _decorator;

export class PathNode {
    
    private worldPos: Vec3 = Vec3.ZERO.clone();
    private inGridPos: Vec2 = Vec2.ZERO.clone();
    private grid: Grid<PathNode> = null;
    private gCost: number = 0;
    private hCost: number = 0;
    private walkable: boolean = false;

    constructor(worldPos: Vec3, inGridPos: Vec2, walkable: boolean, grid: Grid<PathNode>)
    {
        this.worldPos = worldPos;
        this.inGridPos = inGridPos;
        this.walkable = walkable;
        this.grid = grid;
    }

    
}


