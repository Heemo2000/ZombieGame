import { _decorator, Component, Node, log } from 'cc';
import { AStarPathfinding } from '../ai/AStarPathfinding';
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

    public findPath(): void
    {
        AStarPathfinding.getInstance().checkGrid();
        let foundPath = AStarPathfinding.getInstance().findPath(this.startLocation.worldPosition.clone(), this.endLocation.worldPosition.clone());
        log("Found Path: " + foundPath);
    }

    protected update(dt: number): void {
        AStarPathfinding.getInstance().showPath();
    }
}


