import { IFSMTransition } from "./IFSMTransition";
import { IFSMState } from "./IFSMState";
import { IFSMPredicate } from "./IFSMPredicate";

export class FSMTransition implements IFSMTransition {
    
    public to: IFSMState;
    public condition: IFSMPredicate;

    public constructor(to: IFSMState, condition: IFSMPredicate)
    {
        this.to = to;
        this.condition = condition;    
    }

    
}


