import { Component, log, Node, Vec3, math } from 'cc';
import { IFSMState } from '../../../core/stateMachineManagement/FSMMgmt/IFSMState';
import { PatrollingEnemy } from './PatrollingEnemy';
import { CoroutineManager, WaitForSeconds } from '../../../utilities/CoroutineManager';


export class PatrollingEnemyPatrolState implements IFSMState {
    
    private enemy: PatrollingEnemy = null;
    //private shouldWait: boolean = false;
    //private currentTime: number = 0.0;
    private destination: Vec3;
    private wayPtIndex: number = 0;
    private shouldPatrol: boolean = false;
    private handlePatrolID: number = -1;

    constructor(enemy : PatrollingEnemy)
    {
        this.enemy = enemy;
        this.destination = Vec3.ZERO;
        this.shouldPatrol = true;
    }

    onEnter(): void {
        log("Patrolling");
        this.handlePatrolID = CoroutineManager.start(this.handlePatrolling(), this.enemy);
        /*
        this.shouldWait = false;
        this.wayPtIndex = 0;
        this.destination = this.enemy.getWaypoints()[this.wayPtIndex].worldPosition.clone();
        */
        
    }
    onUpdate(deltaTime: number): void 
    {
        /*
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
                this.wayPtIndex++;
                if(this.wayPtIndex >=  wayPts.length)
                {
                    this.wayPtIndex = 0;
                }
                log("Next waypoint Index ->" + this.wayPtIndex);
                this.destination = wayPts[this.wayPtIndex].worldPosition.clone();
                this.shouldWait = false;
            }        
        }
        else
        {
            if(this.enemy.hasReachedDestination())
            {
                this.currentTime = 0.0;
                this.enemy.stop();
                this.shouldWait = true;
            }
            else
            {
                this.shouldWait = false;
                this.enemy.moveTowardsDestination(this.destination,this.enemy.getPatrolSpeed());
            }
        }
        log("should wait ->" + this.shouldWait);
        //log("waypoint index ->" + this.wayPtIndex);
        */  
    }
    onLateUpdate(deltaTime: number): void {
        
    }
    onExit(): void {
        //this.shouldPatrol = false;
        CoroutineManager.stop(this.handlePatrolID);
    }
    toString(): string {
        return "PEPS";
    }

    private *handlePatrolling()
    {
        if(this.enemy.getWaypoints().length <= 0)
        {
            return;
        }

        this.wayPtIndex = 0;
        this.destination = this.enemy.getWaypoints()[this.wayPtIndex].worldPosition.clone();
        this.enemy.moveTowardsDestination(this.destination, this.enemy.getPatrolSpeed());

        while(true)
        {
            if(this.enemy.hasReachedDestination())
            {
                log("Now stop");
                this.enemy.stop();
                yield new WaitForSeconds(this.enemy.getPatrolWaitingTime());
                this.wayPtIndex++;
                if(this.wayPtIndex >= this.enemy.getWaypoints().length)
                {
                    this.wayPtIndex = 0;
                }
                log("Waypoint Index: " + this.wayPtIndex);
                this.destination = this.enemy.getWaypoints()[this.wayPtIndex].worldPosition.clone();
                this.enemy.moveTowardsDestination(this.destination, this.enemy.getPatrolSpeed());
                this.enemy.updatePath();
                yield;
            }
            else
            {
                this.enemy.moveTowardsDestination(this.destination, this.enemy.getPatrolSpeed());
                yield;
            }
        }
    }
    
}


