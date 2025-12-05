import { _decorator, Component, Node, log, Vec3 } from 'cc';
import { GlobalReferencesManager } from '../gameplay/GlobalReferencesManager';
const { ccclass, property } = _decorator;

@ccclass('PathfindingTest')
export class PathfindingTest extends Component {
    @property({
        type: Node
    })
    private startLocation: Node = null;

    @property({
        type: Node
    })
    private endLocation: Node = null;
    
    private path: Vec3[] = [];

    public findPath(): void
    {
        GlobalReferencesManager.getInstance().getPathfindingManager().checkGrid();
        let foundPath = GlobalReferencesManager.getInstance().getPathfindingManager().generatePath(this.startLocation.worldPosition.clone(), this.endLocation.worldPosition.clone());
        this.path = foundPath;
        log("Found Path: " + foundPath);
    }

    protected update(dt: number): void 
    {
        if(this.path.length != 0)
        {
            GlobalReferencesManager.getInstance().getPathfindingManager().showPath(this.path);
        }    
    }
}


