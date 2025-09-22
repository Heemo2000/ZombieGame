import { FSMTransition } from "./FSMTransition";
import { IFSMPredicate } from "./IFSMPredicate";
import { IFSMState } from "./IFSMState";
import { IFSMTransition } from "./IFSMTransition";

export class FSMStateNode
{
    public state: IFSMState;
    public transitions: Set<IFSMTransition>;
            
    public constructor(state: IFSMState) {
        this.state = state;
        this.transitions = new Set<IFSMTransition>();
    }
    
    public addTransition(to: IFSMState, condition: IFSMPredicate): void 
    {
        this.transitions.add(new FSMTransition(to, condition));
    }


}


