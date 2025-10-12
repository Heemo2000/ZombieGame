import { _decorator, Color, Component, Node, log, Vec3, Vec2 } from 'cc';
import { CharacterMovement } from '../../CharacterMovement';
import { LineOfSightSensor } from '../../LineOfSightSensor';
import { FSMStateMachine } from '../../../core/stateMachineManagement/FSMMgmt/FSMStateMachine';
import { PatrollingEnemyPatrolState } from './PatrollingEnemyPatrolState';
import { PatrollingEnemyChaseState } from './PatrollingEnemyChaseState';
import { PatrollingEnemyAttackState } from './PatrollingEnemyAttackState';
import { VisualDebug } from '../../../core/VisualDebug';
import { FSMFuncPredicate } from '../../../core/stateMachineManagement/FSMMgmt/FSMFuncPredicate';
import { PatrollingEnemySuspiciousState } from './PatrollingEnemySuspiciousState';
import { FuncStopwatch } from '../../../core/FuncStopwatch';
const { ccclass, property } = _decorator;

@ccclass('PatrollingEnemy')
export class PatrollingEnemy extends Component {

    @property
    private rotateSpeed: number = 10;

    @property
    private stopDistance: number = 0.5;
    @property(
        {
            type: [Node],
            visible: true
        })
    private waypoints: Node[] = [];

    @property
    private patrolWaitingTime: number = 1.0;

    @property
    private patrolSpeed: number = 5.0;

    @property
    private suspiciousSpeed: number = 2.0;

    @property
    (
        {
            type: LineOfSightSensor,
            visible: true
        })
    private suspiciousVisualCone: LineOfSightSensor;

    @property
    private noSuspicionTime: number = 5.0;

    @property(
        {
            type: LineOfSightSensor,
            visible: true
        })
    private chaseVisualCone: LineOfSightSensor;

    @property
    private chaseSpeed: number = 10.0;

    @property
    (
        {
            visible: true,
            min: 0.01
        }
    )
    private chaseSwitchTime: number = 3.0;


    @property
    ({
        type: LineOfSightSensor,
        visible: true
    })
    private attackVisualCone: LineOfSightSensor;
    

    private movement: CharacterMovement = null;
    private fsm: FSMStateMachine = null;
    private patrolState: PatrollingEnemyPatrolState = null;
    private suspiciousState: PatrollingEnemySuspiciousState = null;
    private chaseState: PatrollingEnemyChaseState = null;
    private attackState: PatrollingEnemyAttackState = null;
    private moveDirection: Vec2;
    private suspiciousPosition: Vec3;
    private switchFromSuspStateToChaseState: boolean = false;
    private switchFromSuspStateToPatrolState: boolean = false;

    public getSuspiciousVisualConeDetectedNodes(): Node[]
    {
        return this.suspiciousVisualCone.getDetectedTargets();
    }
    
    public getChaseVisualConeDetectedNodes(): Node[]
    {
        return this.chaseVisualCone.getDetectedTargets();
    }

    public getAttackVisualConeDetectedNodes(): Node[]
    {
        return this.attackVisualCone.getDetectedTargets();
    }

    public moveTowardsDestination(destination: Vec3, moveSpeed: number): boolean
    {
        
        let direction: Vec3 = destination.clone().subtract(this.node.worldPosition).normalize();

        this.moveDirection = new Vec2(-direction.x, direction.z);
        //log("Move direction: " + this.moveDirection.toString());
        //log("Move Direction Length: " + this.moveDirection.length());
        this.movement.handleGravity();
        if(this.moveDirection.length() <= 0.01)
        {
            this.moveDirection = Vec2.ZERO.clone();
            this.movement.handleMovement(this.moveDirection, 0, 0);
            return false;
        }
        this.movement.handleMovement(this.moveDirection, moveSpeed, this.rotateSpeed);
        return true;
    }

    public isNotMoving(): boolean
    {
        return this.moveDirection.x == 0.0 && this.moveDirection.y == 0.0;
    }

    public stop(): void
    {
        this.movement.handleGravity();
        this.moveDirection = Vec2.ZERO.clone();
        this.movement.handleMovement(this.moveDirection, 0, 0);
    }

    public getPatrolSpeed(): number
    {
        return this.patrolSpeed;
    }

    public getSuspiciousSpeed(): number
    {
        return this.suspiciousSpeed;
    }

    public getChaseSpeed(): number
    {
        return this.chaseSpeed;
    }

    public getSuspiciousPosition(): Vec3
    {
        return this.suspiciousPosition;
    }

    public getStopDistance(): number
    {
        return this.stopDistance;
    }

    public getChaseSwitchTime(): number
    {
        return this.chaseSwitchTime;
    }

    public setSwitchFromSuspStateToChaseState(status: boolean): void
    {
        this.switchFromSuspStateToChaseState = status;
    }

    public setSwitchFromSuspStateToPatrolState(status: boolean): void
    {
        this.switchFromSuspStateToPatrolState = status;
    }

    public getWaypoints(): Node[]
    {
        return this.waypoints;
    }

    public getPatrolWaitingTime(): number
    {
        return this.patrolWaitingTime;
    }

    public getNoSuspicionTime(): number
    {
        return this.noSuspicionTime;
    }

    private displayWaypoints(): void
    {
        if(this.waypoints == null || this.waypoints == undefined)
        {
            return;
        }

        for(let i = 0; i < this.waypoints.length; i++)
        {
            let wayPt = this.waypoints[i];

            VisualDebug.getInstance().drawWireSphere(wayPt.worldPosition.clone(), 1.0, Color.YELLOW);
        }
    }

    start() {
        this.movement = this.getComponent(CharacterMovement);

        this.moveDirection = Vec2.ZERO;
        
        this.fsm = new FSMStateMachine();
        this.patrolState = new PatrollingEnemyPatrolState(this);
        this.suspiciousState = new PatrollingEnemySuspiciousState(this);
        this.chaseState = new PatrollingEnemyChaseState(this);
        this.attackState = new PatrollingEnemyAttackState(this);

        this.fsm.addTransition(this.patrolState, this.suspiciousState, new FSMFuncPredicate(()=> 
            {
                return this.suspiciousVisualCone.getDetectedTargets().length > 0;  
            }),
            ()=>
            {
                this.suspiciousPosition = this.suspiciousVisualCone.getDetectedTargets()[0].worldPosition.clone();
                
            });

        this.fsm.addTransition(this.suspiciousState, this.chaseState, new FSMFuncPredicate(()=> 
            {
                return this.switchFromSuspStateToChaseState == true;
            }),
            ()=>
            {
                this.switchFromSuspStateToChaseState = false;
            }
            );
        
        this.fsm.addTransition(this.suspiciousState, this.patrolState, new FSMFuncPredicate(()=>
        {
            return this.switchFromSuspStateToPatrolState == true;
        }),
        ()=>
        {
            this.switchFromSuspStateToPatrolState = false;
        });

        this.fsm.addTransition(this.chaseState, this.attackState, new FSMFuncPredicate(()=> 
            {
                return this.attackVisualCone.getDetectedTargets().length > 0;
            }));
        
        this.fsm.setState(this.patrolState);
        
    }

    update(deltaTime: number) {
        this.fsm.onUpdate(deltaTime);
        this.displayWaypoints();    
    }

    protected lateUpdate(deltaTime: number): void {
        this.fsm.onLateUpdate(deltaTime);
    }
}


