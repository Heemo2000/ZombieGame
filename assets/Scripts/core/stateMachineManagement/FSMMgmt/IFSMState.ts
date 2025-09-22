export interface IFSMState
{
    onEnter(): void;
    onUpdate(deltaTime: number): void;
    onLateUpdate(deltaTime: number): void;
    onExit(): void;
    toString(): string;    
}


