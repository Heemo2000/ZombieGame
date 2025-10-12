import { FSMStateNode } from "./FSMStateNode";
import { IFSMPredicate } from "./IFSMPredicate";
import { IFSMState } from "./IFSMState";
import { IFSMTransition } from "./IFSMTransition";
import { FSMTransition } from "./FSMTransition";
import { log } from "cc";

export class FSMStateMachine 
{
    private current: FSMStateNode = null;
    private nodes: Map<string, FSMStateNode> = null;
    private anyTransitions: Set<IFSMTransition> = null;
    
    public constructor()
    {
        this.current = null;
        this.nodes = new Map<string, FSMStateNode>();
        this.anyTransitions = new Set<IFSMTransition>();
    }

    public onUpdate(deltaTime: number): void
    {
        let transition = this.getTransition();
        if(transition != null)
        {
            this.changeState(transition);
        }

        this.current.state?.onUpdate(deltaTime);
    }

    public onLateUpdate(deltaTime: number): void
    {
        this.current.state?.onLateUpdate(deltaTime);
    }    

    public setState(state: IFSMState): void
    {
        this.current = this.nodes.get(state.toString());
        if(this.current === undefined)
        {
            log("Couldn't find state node");
            return;
        }
        this.current.state?.onEnter();
    }

    private getTransition(): IFSMTransition 
    {
        for(let transition of this.anyTransitions)
        {
            if(transition.condition.evaluate())
            {
                return transition;
            }
        }

        for(let transition of this.current.transitions)
        {
            if(transition.condition.evaluate())
            {
                return transition;
            }
        }
        
        return null;
    }

    public addTransition(from: IFSMState, to: IFSMState, condition: IFSMPredicate, onBeforeTransition: ()=> void = null): void 
    {
        let fromNode = this.getOrAddNode(from);
        //log("From node state: " + fromNode.state.toString());

        let toNode = this.getOrAddNode(to);
        //log("To node state: " + toNode.state.toString());

        fromNode.addTransition(toNode.state, condition, onBeforeTransition);
    }
        
    public addAnyTransition(to: IFSMState, condition: IFSMPredicate, onBeforeTransition: ()=> void = null): void  {
        this.anyTransitions.add(new FSMTransition(this.getOrAddNode(to).state, condition, onBeforeTransition));
    }

    private changeState(transition: IFSMTransition): void
    {
        if(transition.to == null || this.current != null && this.current.state.toString() == transition.to.toString())
        {
            log("Either transitioning state is null or State machine is already in " + this.current.state.toString() + " state");
            return;
        }

        let previousState = this.current?.state;
        let nextNode = this.nodes.get(transition.to.toString());
        if(nextNode == null || nextNode == undefined)
        {
            //log("Either next node is null or undefined");
            return;
        }

        if(transition instanceof FSMTransition)
        {
            (transition as FSMTransition).onBeforeTransition?.();
            //log("On before transition called");
        }
        
        let nextState = nextNode.state;
        previousState.onExit();
        nextState?.onEnter();

        this.current = nextNode;
    }

    private getOrAddNode(state: IFSMState): FSMStateNode 
    {
        let node = this.nodes.get(state.toString());
            
        if (node === undefined) {
            //log("Creating new state node: " + state.toString());
            node = new FSMStateNode(state);
            this.nodes.set(state.toString(), node);
        }
        
        return node;
    }

    private printStateTransitions(node: FSMStateNode): void
    {
        log("For " + node.state.toString());
        for(let t of node.transitions)
        {
            log("-->" + t.to.toString());
        }
    }
}


