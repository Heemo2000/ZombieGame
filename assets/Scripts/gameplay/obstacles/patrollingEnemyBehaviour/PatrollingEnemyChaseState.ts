import { Component, Node, Vec3, log } from 'cc';
import { IFSMState } from '../../../core/stateMachineManagement/FSMMgmt/IFSMState';
import { PatrollingEnemy } from './PatrollingEnemy';

export class PatrollingEnemyChaseState implements IFSMState {

    private enemy: PatrollingEnemy = null;
    private target: Node = null;
    constructor(enemy : PatrollingEnemy)
    {
        this.enemy = enemy;
    }
        
    onEnter(): void {
       log("Chasing");

       //Choose target which is the closest.
       let targets = this.enemy.getChaseVisualConeDetectedNodes();
       let closestTarget = targets[0];
       let closestSqrDistance: number = Vec3.squaredDistance(closestTarget.worldPosition, this.enemy.node.worldPosition);
       for(let target of targets)
       {
            let squaredDistance = Vec3.squaredDistance(target.worldPosition, this.enemy.node.worldPosition);
            if(squaredDistance < closestSqrDistance)
            {
                closestSqrDistance = squaredDistance;
                closestTarget = target;
            }
       }


       this.target = closestTarget;
    }

    onUpdate(deltaTime: number): void 
    {
        this.enemy.moveTowardsDestination(this.target.worldPosition.clone(), this.enemy.getChaseSpeed());
    }
    
    onLateUpdate(deltaTime: number): void 
    {
        
    }
    
    onExit(): void 
    {
        
    }
    
    toString(): string 
    {
        return "PECS";
    }
    
}


