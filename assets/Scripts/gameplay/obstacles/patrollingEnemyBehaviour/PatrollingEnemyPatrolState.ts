import { Component, log, Node } from 'cc';
import { IFSMState } from '../../../core/stateMachineManagement/FSMMgmt/IFSMState';
import { PatrollingEnemy } from './PatrollingEnemy';



export class PatrollingEnemyPatrolState implements IFSMState {
    
    private enemy: PatrollingEnemy = null;

    constructor(enemy : PatrollingEnemy)
    {
        this.enemy = enemy;
    }

    onEnter(): void {
        log("Patrolling");
    }
    onUpdate(deltaTime: number): void {
        
    }
    onLateUpdate(deltaTime: number): void {
        
    }
    onExit(): void {
        
    }
    toString(): string {
        return "PEPS";
    }
    
}


