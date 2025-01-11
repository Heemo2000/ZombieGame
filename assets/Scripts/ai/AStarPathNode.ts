import { _decorator, Component, Node,Vec2, log } from 'cc';
import { MathUtility } from '../utilities/MathUtility';
import { Constants } from '../core/Constants';
const { ccclass, property } = _decorator;

@ccclass('AStarPathNode')
export class AStarPathNode {
    private inGridPos: Vec2 = Vec2.ZERO.clone();
    private gCost: number = 0;
    private hCost: number = 0;
    private parentNode: AStarPathNode = null;
    private walkable: boolean = false;

    constructor(inGridPos: Vec2, walkable: boolean)
    {    
        this.inGridPos = inGridPos;
        this.walkable = walkable;
        this.gCost = 0;
        this.hCost = 0;
        this.parentNode = null;
    }

    public getInGridPos(): Vec2
    {
        return this.inGridPos;
    }

    public setInGridPos(pos: Vec2): void
    {
        this.inGridPos = pos;
    }

    public getGCost(): number
    {
        return this.gCost;
    }

    public setGCost(cost: number): void
    {
        this.gCost = cost;
    }

    public getHCost(): number
    {
        return this.hCost;
    }

    public setHCost(cost: number): void
    {
        this.hCost = cost;
    }

    public getFCost(): number
    {
        return this.gCost + this.hCost;
    }

    public getParentNode(): AStarPathNode
    {
        return this.parentNode;
    }

    public setParentNode(parentNode: AStarPathNode): void
    {
        this.parentNode = parentNode;
    }

    public isWalkable(): boolean
    {
        return this.walkable;
    }

    public setWalkable(status: boolean): void
    {
        this.walkable = status;
    }

    public equals(node: AStarPathNode): boolean
        {
            if(node == null || node == undefined)
            {
                return false;
            }
    
    
            return MathUtility.checkVec2Equal(this.getInGridPos(), node.getInGridPos()) &&
                   this.getGCost() == node.getGCost() &&
                   this.getHCost() == node.getHCost() &&
                   this.isWalkable() == node.isWalkable();
        }
}


