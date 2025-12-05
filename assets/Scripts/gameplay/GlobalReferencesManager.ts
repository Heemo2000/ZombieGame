import { _decorator, Component, Node } from 'cc';
import { SoundManager } from '../soundManagement/SoundManager';
import { AStarPathfindingManager } from '../ai/AStarPathfindingManager';
import { VisualDebug } from '../core/VisualDebug';
import { GameInput } from '../core/GameInput';
const { ccclass, property } = _decorator;

@ccclass('GlobalReferencesManager')
export class GlobalReferencesManager extends Component {

    @property
    (
        {
            type: SoundManager,
            visible: true
        }
    )
    private soundManager: SoundManager = null;

    @property
    (
        {
            type: AStarPathfindingManager,
            visible: true
        }
    )
    private pathfindingManager: AStarPathfindingManager = null;
    
    
    @property
    (
        {
            type: VisualDebug,
            visible: true
        }
    )
    private visualDebug: VisualDebug = null;

    @property
    (
        {
            type: GameInput,
            visible: true
        }
    )
    private gameInput: GameInput = null;



    private static instance: GlobalReferencesManager = null;

    
    public static getInstance(): GlobalReferencesManager
    {
        return GlobalReferencesManager.instance;
    }

    public getSoundManager(): SoundManager
    {
        return this.soundManager;
    }

    public getPathfindingManager(): AStarPathfindingManager
    {
        return this.pathfindingManager;
    }

    public getVisualDebug(): VisualDebug
    {
        return this.visualDebug;
    }

    public getGameInput(): GameInput
    {
        return this.gameInput;
    }

    
    protected onLoad(): void 
    {
        if(GlobalReferencesManager.instance == null)
        {
            GlobalReferencesManager.instance = this;
            return;
        }

        this.node.destroy();
    }
}


