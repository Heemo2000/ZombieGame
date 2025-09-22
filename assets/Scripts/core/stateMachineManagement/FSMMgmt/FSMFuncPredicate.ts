import { IFSMPredicate } from "./IFSMPredicate"

export class FSMFuncPredicate implements IFSMPredicate
{
    private func: () => boolean;

    public constructor(func: () => boolean)
    {
        this.func = func;
    }

    evaluate(): boolean 
    {
        return this.func();
    }
}


