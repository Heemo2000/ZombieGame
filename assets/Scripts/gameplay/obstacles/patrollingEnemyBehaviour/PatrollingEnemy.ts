import { _decorator, Color, Component, Node, log } from 'cc';
import { LineOfSightSensor } from '../../LineOfSightSensor';
import { FSMStateMachine } from '../../../core/stateMachineManagement/FSMMgmt/FSMStateMachine';
import { PatrollingEnemyPatrolState } from './PatrollingEnemyPatrolState';
import { PatrollingEnemyChaseState } from './PatrollingEnemyChaseState';
import { PatrollingEnemyAttackState } from './PatrollingEnemyAttackState';
import { VisualDebug } from '../../../core/VisualDebug';
import { FSMFuncPredicate } from '../../../core/stateMachineManagement/FSMMgmt/FSMFuncPredicate';
const { ccclass, property } = _decorator;

@ccclass('PatrollingEnemy')
export class PatrollingEnemy extends Component {

    @property(
        {
            type: [Node],
            visible: true
        })
    private waypoints: Node[] = [];

    @property
    private patrolSpeed: number = 5.0;

    @property(
        {
            type: LineOfSightSensor,
            visible: true
        })
    private chaseVisualCone: LineOfSightSensor;

    @property
    private chaseSpeed: number = 10.0;

    @property
    ({
        type: LineOfSightSensor,
        visible: true
    })
    private attackVisualCone: LineOfSightSensor;
    
    private fsm: FSMStateMachine = null;
    private patrolState: PatrollingEnemyPatrolState = null;
    private chaseState: PatrollingEnemyChaseState = null;
    private attackState: PatrollingEnemyAttackState = null;

    private areTargetDetected(): boolean
    {
        //log("Detecting targets condition");
        return this.chaseVisualCone.getDetectedTargets().length > 0;
    }

    private areNoTargetDetected(): boolean
    {
        return !this.areTargetDetected();
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

            VisualDebug.getInstance().drawWireSphere(wayPt.worldPosition.clone(), 1.0, Color.RED);
        }
    }

    start() {
        this.fsm = new FSMStateMachine();
        this.patrolState = new PatrollingEnemyPatrolState(this);
        this.chaseState = new PatrollingEnemyChaseState(this);
        this.attackState = new PatrollingEnemyAttackState(this);
        this.fsm.addTransition(this.patrolState, this.chaseState, new FSMFuncPredicate(this.areTargetDetected.bind(this)));        
        this.fsm.addTransition(this.chaseState, this.patrolState, new FSMFuncPredicate(this.areNoTargetDetected.bind(this)));
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


