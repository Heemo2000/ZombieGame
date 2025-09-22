import { FSMStateNode } from "./FSMStateNode";
import { IFSMPredicate } from "./IFSMPredicate";
import { IFSMState } from "./IFSMState";
import { IFSMTransition } from "./IFSMTransition";
import { FSMTransition } from "./FSMTransition";

export class FSMStateMachine 
{
    private current: FSMStateNode = null;
    private nodes: Map<string, FSMStateNode> = null;
    private anyTransitions: Set<IFSMTransition> = null;
    
    public constructor()
    {
        this.current = null;
        this.nodes = new Map<string, FSMStateNode>();
    }

    public onUpdate(deltaTime: number): void
    {
        let transition = this.getTransition();
        if(transition != null)
        {
            this.changeState(transition.to);
        }
        this.current.state?.onUpdate(deltaTime);
    }

    public onLateUpdate(deltaTime: number): void
    {
        this.current.state?.onLateUpdate(deltaTime);
    }

    public changeState(state: IFSMState): void
    {
        if(this.current.state == null || this.current.state.toString() == state.toString())
        {
            return;
        }

        let previousState = this.current?.state;
        let nextNode = this.nodes.get(state.toString());
        if(nextNode == null || nextNode == undefined)
        {
            return;
        }

        let nextState = nextNode.state;
        previousState.onExit();
        nextState?.onEnter();

        this.current = nextNode;
    }

    public setState(state: IFSMState): void
    {
        this.current = this.nodes.get[state.toString()];
        if(this.current == undefined)
        {
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

        if(this.current != null || this.current != undefined)
        {
            for(let transition of this.current.transitions)
            {
                if(transition.condition.evaluate())
                {
                    return transition;
                }
            }
        }
        
        return null;
    }

    public addTransition(from: IFSMState, to: IFSMState, condition: IFSMPredicate): void 
    {
        this.getOrAddNode(from).addTransition(this.getOrAddNode(to).state, condition);
    }
        
    public addAnyTransition(to: IFSMState, condition: IFSMPredicate): void  {
        this.anyTransitions.add(new FSMTransition(this.getOrAddNode(to).state, condition));
    }

    getOrAddNode(state: IFSMState): FSMStateNode 
    {
        var node = this.nodes.get(state.toString());
            
        if (node == null) {
            node = new FSMStateNode(state);
            this.nodes.set(state.toString(), node);
        }
        
        return node;
    }
}


