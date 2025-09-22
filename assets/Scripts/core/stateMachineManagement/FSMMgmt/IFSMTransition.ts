import { IFSMPredicate } from "./IFSMPredicate";
import { IFSMState } from "./IFSMState";

export interface IFSMTransition {
    
    to: IFSMState;
    condition: IFSMPredicate;
}


