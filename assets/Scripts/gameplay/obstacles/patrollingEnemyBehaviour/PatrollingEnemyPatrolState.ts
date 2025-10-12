import { Component, log, Node, Vec3, math } from 'cc';
import { IFSMState } from '../../../core/stateMachineManagement/FSMMgmt/IFSMState';
import { PatrollingEnemy } from './PatrollingEnemy';



export class PatrollingEnemyPatrolState implements IFSMState {
    
    private enemy: PatrollingEnemy = null;
    private shouldWait: boolean = false;
    private currentTime: number = 0.0;
    private destination: Vec3;
    private wayPtIndex: number = 0;

    constructor(enemy : PatrollingEnemy)
    {
        this.enemy = enemy;
        this.destination = Vec3.ZERO;
    }

    onEnter(): void {
        log("Patrolling");
        this.shouldWait = false;
        this.wayPtIndex = 0;
        this.destination = this.enemy.getWaypoints()[this.wayPtIndex].worldPosition;
    }
    onUpdate(deltaTime: number): void 
    {
        if(this.shouldWait)
        {
            if(this.currentTime < this.enemy.getPatrolWaitingTime())
            {
                this.currentTime += deltaTime;
                this.enemy.stop();
            }
            else
            {
                this.currentTime = 0.0;
                let wayPts = this.enemy.getWaypoints();
                if(this.wayPtIndex + 1 >=  wayPts.length)
                {
                    this.wayPtIndex = 0;
                }
                else
                {
                    this.wayPtIndex++;
                }
                this.destination = wayPts[this.wayPtIndex].worldPosition;
                this.shouldWait = false;
            }        
        }
        else
        {
            let sqrDistance = Vec3.squaredDistance(this.enemy.node.worldPosition, this.destination);
            if(sqrDistance <= this.enemy.getStopDistance() * this.enemy.getStopDistance())
            {
                this.currentTime = 0.0;
                this.enemy.stop();
                this.shouldWait = true;
            }
            else
            {
                this.enemy.moveTowardsDestination(this.destination,this.enemy.getPatrolSpeed());
            }
        }    
    }
    onLateUpdate(deltaTime: number): void {
        
    }
    onExit(): void {
        
    }
    toString(): string {
        return "PEPS";
    }
    
}


