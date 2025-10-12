import { _decorator, Component, log, Node, Vec3 } from 'cc';
import { IFSMState } from '../../../core/stateMachineManagement/FSMMgmt/IFSMState';
import { PatrollingEnemy } from './PatrollingEnemy';
import { FuncStopwatch } from '../../../core/FuncStopwatch';


export class PatrollingEnemySuspiciousState implements IFSMState
{
    private enemy: PatrollingEnemy = null;
    private detectStopwatch: FuncStopwatch = null; 
    private noSuspicionStopwatch: FuncStopwatch = null;
    private shouldCheckNoSuspicion: boolean = false;

    public constructor(enemy: PatrollingEnemy)
    {
        this.enemy = enemy;
        this.detectStopwatch = new FuncStopwatch(null);
        this.noSuspicionStopwatch = new FuncStopwatch(null);
    }

    onEnter(): void {
        log("Suspicious");
        this.detectStopwatch.setCondition(()=> {
                                            return this.enemy.getChaseVisualConeDetectedNodes().length > 0
                                          });
        this.detectStopwatch.resetTimer();
        this.detectStopwatch.startTimer();

        this.noSuspicionStopwatch.setCondition(()=>{ 
                                            return this.enemy.getChaseVisualConeDetectedNodes().length == 0
                                        });

        this.noSuspicionStopwatch.resetTimer();
        this.shouldCheckNoSuspicion = false;
    }


    onUpdate(deltaTime: number): void 
    {   
        //log("Suspicious position: " + this.enemy.getSuspiciousPosition().toString());

        this.detectStopwatch.update(deltaTime);

        if(this.detectStopwatch.getElapsedTime() >= this.enemy.getChaseSwitchTime())
        {
            log("Switching from patrol state to chase state");
            this.enemy.setSwitchFromSuspStateToChaseState(true);
            return;
        }

        let destination = this.enemy.getSuspiciousPosition();
        let squareDistance = Vec3.squaredDistance(this.enemy.node.worldPosition, destination);
        if(squareDistance > this.enemy.getStopDistance() * this.enemy.getStopDistance() &&
           this.enemy.isNotMoving() && 
           this.enemy.moveTowardsDestination(destination, this.enemy.getSuspiciousSpeed()))
        {
            //log("Moving over suspicious position");
            //log("Square distance: " + squareDistance);
        }
        else
        {
            this.enemy.stop();
            if(!this.shouldCheckNoSuspicion)
            {
                this.shouldCheckNoSuspicion = true;
                this.noSuspicionStopwatch.startTimer();
                log("Started no suspicion timer");
            }

            this.noSuspicionStopwatch.update(deltaTime);

            //log("No suspicion stopwatch time: " + this.noSuspicionStopwatch.getElapsedTime());

            if(this.noSuspicionStopwatch.getElapsedTime() >= this.enemy.getNoSuspicionTime())
            {
                this.enemy.setSwitchFromSuspStateToPatrolState(true);
                return;
            }
        }
    }
    
    onLateUpdate(deltaTime: number): void {
        
    }
    
    onExit(): void {
        this.detectStopwatch.resetTimer();
        this.noSuspicionStopwatch.resetTimer();
        this.shouldCheckNoSuspicion = false;
    }
    
    toString(): string {
        return "PESS";
    }
    
    

}


