import { Component, Node, log } from 'cc';
import { IFSMState } from '../../../core/stateMachineManagement/FSMMgmt/IFSMState';
import { PatrollingEnemy } from './PatrollingEnemy';

export class PatrollingEnemyChaseState implements IFSMState {

    private enemy: PatrollingEnemy = null;
    
    constructor(enemy : PatrollingEnemy)
    {
        this.enemy = enemy;
    }
        
    onEnter(): void {
       log("Chasing"); 
    }
    onUpdate(deltaTime: number): void {
        
    }
    onLateUpdate(deltaTime: number): void {
        
    }
    onExit(): void {
        
    }
    toString(): string {
        return "PECS";
    }
    
}


