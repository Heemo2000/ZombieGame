import { _decorator, Vec2, Vec3, log } from 'cc';
import { Grid } from '../utilities/Grid';
import { MathUtility } from '../utilities/MathUtility';
import { Constants } from '../core/Constants';
const { ccclass, property } = _decorator;

export class DStarPathNode {
    
    private inGridPos: Vec2 = Vec2.ZERO.clone();
    private gCost: number = 0;
    private rhsCost: number = 0;
    private walkable: boolean = false;
    private key1: number = Constants.MAX_INT_VALUE;
    private key2: number = Constants.MAX_INT_VALUE;


    constructor(inGridPos: Vec2, walkable: boolean)
    {    
        this.inGridPos = inGridPos;
        this.walkable = walkable;
        this.gCost = 0;
        this.rhsCost = 0;
        this.key1 = Constants.MAX_INT_VALUE;
        this.key2 = Constants.MAX_INT_VALUE;
    }

    public getKey1(): number
    {
        return this.key1;
    }

    public setKey1(key: number): void
    {
        this.key1 = key;
    }

    public getKey2(): number
    {
        return this.key2;
    }

    public setKey2(key: number): void
    {
        this.key2 = key;
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

    public isWalkable(): boolean
    {
        return this.walkable;
    }

    public setWalkable(status: boolean): void
    {
        this.walkable = status;
    }

    public getRHSCost(): number
    {
        return this.rhsCost;
    }

    public setRHSCost(cost: number): void
    {
        this.rhsCost = cost;
    }

    public equals(node: DStarPathNode): boolean
    {
        if(node == null || node == undefined)
        {
            return false;
        }


        return MathUtility.checkVec2Equal(this.getInGridPos(), node.getInGridPos()) &&
               this.getGCost() == node.getGCost() &&
               this.getKey1() == node.getKey1() &&
               this.getKey2() == node.getKey2() &&
               this.getRHSCost() == node.getRHSCost();
    }
}


