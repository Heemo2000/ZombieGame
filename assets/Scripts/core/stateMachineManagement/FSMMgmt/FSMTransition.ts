import { IFSMTransition } from "./IFSMTransition";
import { IFSMState } from "./IFSMState";
import { IFSMPredicate } from "./IFSMPredicate";

export class FSMTransition implements IFSMTransition {
    
    public to: IFSMState;
    public condition: IFSMPredicate;
    public onBeforeTransition: ()=> void;

    public constructor(to: IFSMState, condition: IFSMPredicate, onBeforeTransition: ()=> void = null)
    {
        this.to = to;
        this.condition = condition;
        this.onBeforeTransition = onBeforeTransition;    
    }

    
}


