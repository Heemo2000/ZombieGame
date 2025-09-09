import { _decorator, Component, Node, Vec2, Vec3, PhysicsSystem, geometry, error, log, Color, warn } from 'cc';
import { Grid } from '../utilities/Grid';
import { AStarPathNode } from './AStarPathNode';
import { PriorityQueue } from '../utilities/PriorityQueue';
import { Constants } from '../core/Constants';
import { PhysicsGroup } from '../core/PhysicsGroup';
import { VisualDebug } from '../core/VisualDebug';
import { MathUtility } from '../utilities/MathUtility';

const { ccclass, property } = _decorator;

@ccclass('AStarPathfinding')
export class AStarPathfinding extends Component {
    @property({
        min: 1
    })
    private cellSize: number = 1;

    @property({
        min:5
    }) 
    private width: number = 5;
    
    @property({
        min:5
    })
    private height: number = 5;

    @property
    private shouldShowGrid: boolean = false;
    
    private static instance: AStarPathfinding = null;
    private diagonalCost: number = 14;
    private straightCost: number = 10;
    private grid: Grid<AStarPathNode> = null;


    private openSet: PriorityQueue<AStarPathNode> = null;
    private closeSet: PriorityQueue<AStarPathNode> = null;
    
    private path: Vec3[] = [];
    public static getInstance(): AStarPathfinding
    {
        return this.instance;
    }

    public checkGrid(): void
    {
        let checkGroup = PhysicsGroup.GROUND | PhysicsGroup.WORLD;

        for(let i = 0; i < this.grid.getWidth(); i++)
        {
            for(let j = 0; j < this.grid.getHeight(); j++)
            {
                let node = this.grid.getItem(i, j);

                node.setGCost(0);
                node.setHCost(0);                
                
                let checkPosition = this.getWorldPosition(i,j); //this.getWorldPosition(i,j).add(Vec3.UP.clone().multiplyScalar(this.cellSize)).clone();
                let checkRay = new geometry.Ray(checkPosition.x, checkPosition.y, checkPosition.z, 0.0 -1.0, 0.0);
                //checkRay.o = checkPosition.clone();
                let walkable = PhysicsSystem.instance.sweepSphereClosest(checkRay, this.cellSize, checkGroup, this.cellSize, true);
                node.setWalkable(walkable);

                //log("Is walkable on (" + i + ", " + j + "): " + walkable);
                if(!walkable)
                {
                    log("Node at (" + i + ", " + j + "): is not walkable");    
                }               

                this.grid.setItem(node,i,j);
            }
        }
    }

    public findPath(startPosition: Vec3, endPosition: Vec3): Vec3[]
    {
        this.path.length = 0;

        let xz1: Vec2 = this.getXZ(startPosition);

        if(!this.grid.isIndexInBounds(xz1.x, xz1.y))
        {
            error("Can't find start position node!");
            return this.path;
        }

        let startNode = this.grid.getItem(xz1.x,xz1.y);

        let xz2 = this.getXZ(endPosition);

        if(!this.grid.isIndexInBounds(xz2.x, xz2.y))
        {
            error("Can't find end position node!");
            return this.path;
        }

        let endNode = this.grid.getItem(xz2.x, xz2.y);

        if(!startNode.isWalkable() || !endNode.isWalkable())
        {
            warn("Start or end node is not walkable");
            return this.path;
        }

        for(let i = 0; i < this.grid.getWidth(); i++)
        {
            for(let j = 0; j < this.grid.getHeight(); j++)
            {
                let node = this.grid.getItem(i,j);
                node.setGCost(Constants.MAX_INT_VALUE);
                node.setHCost(0);
                node.setParentNode(null);
                this.grid.setItem(node, i, j);
            }
        }


        startNode.setGCost(0);
        startNode.setHCost(this.getHeuristicCost(startNode, endNode));
        let findPathSuccess: boolean = false;

        this.openSet.clear();
        this.closeSet.clear();

        this.openSet.insert(startNode);
        

        while(this.openSet.getCount() > 0)
        {
            let currentNode = this.openSet.remove();

            //log("current node position: " + currentNode.getInGridPos().toString());
            if(currentNode.equals(endNode))
            {
                findPathSuccess = true;
                break;
            }

            this.closeSet.insert(currentNode);

            let neighbours = this.getNeighbours(currentNode);

            for(let i = 0; i < neighbours.length; i++)
            {
                let neighbour = neighbours[i];
                let neighbourInGridPos = neighbour.getInGridPos();

                if(!neighbour.isWalkable() || this.closeSet.contains(neighbour, this.nodeCheck.bind(this)))
                {
                    continue;
                }

                let newMoveCostToNeighbour = currentNode.getGCost() + this.getHeuristicCost(neighbour, currentNode);

                let containsNeighbour = this.openSet.contains(neighbour, this.nodeCheck.bind(this));
                if(newMoveCostToNeighbour < neighbour.getGCost() || !containsNeighbour)
                {
                    neighbour.setGCost(newMoveCostToNeighbour);
                    neighbour.setHCost(this.getHeuristicCost(neighbour, endNode));
                    neighbour.setParentNode(currentNode);

                    this.grid.setItem(neighbour, neighbourInGridPos.x, neighbourInGridPos.y);
                    
                    //log("Modifying costs");
                    if(!containsNeighbour)
                    {
                        this.openSet.insert(neighbour);
                    }
                }
            }
        }

        if(findPathSuccess)
        {
            this.tracePath(startNode, endNode);
        }

        return this.path;
    }

    public showGrid(): void
    {
        if(!this.shouldShowGrid)
        {
            return;
        }

        for(let i = 0; i < this.width; i++)
        {
            for(let j = 0; j < this.height; j++)
            {
                let worldPosition = this.getWorldPosition(i,j);
                let showColor = Color.RED;

                VisualDebug.getInstance().drawWireCube(worldPosition, Vec3.ONE.clone().multiplyScalar(this.cellSize), showColor);    
            }    
        }
    }

    public showPath(): void
    {
        for(let i = 0; i < this.path.length; i++)
        {
            let worldPosition = this.path[i].clone();
            VisualDebug.getInstance().drawWireCube(worldPosition, Vec3.ONE.clone().multiplyScalar(this.cellSize), Color.BLACK);
        }
    }

    private tracePath(startNode: AStarPathNode, endNode: AStarPathNode): void
    {
        let currentNode = endNode;

        while(!currentNode.equals(startNode))
        {
            let inGridPosition = currentNode.getInGridPos();
            let worldPosition = this.getWorldPosition(inGridPosition.x, inGridPosition.y);
            
            //log("in grid position: " + inGridPosition.toString() + ", world position: " + worldPosition.toString());
            this.path.push(worldPosition);
            currentNode = currentNode.getParentNode();
        }

        this.path.reverse();

    }

    private nodeCheck(node1: AStarPathNode, node2: AStarPathNode): boolean
    {
        return node1.equals(node2);
    }
    
    private getNeighbours(node: AStarPathNode): AStarPathNode[]
    {
        let result:AStarPathNode[] = [];
        
        let x: number = node.getInGridPos().x;
        let y: number = node.getInGridPos().y;

        let width: number = this.grid.getWidth();
        let height: number = this.grid.getHeight();

        //Left
        if(x - 1 >= 0)
        {
            result.push(this.grid.getItem(x - 1, y));
            //Down left
            if(y - 1 >= 0)
            {
                result.push(this.grid.getItem(x - 1,y - 1));
            }
            //Up Left.
            if(y + 1 < height)
            {
                result.push(this.grid.getItem(x - 1,y + 1));
            }
        }
        //Right
        if(x + 1 < width)
        {
            result.push(this.grid.getItem(x + 1, y));
            //Down Right
            if(y - 1 >= 0)
            {
                result.push(this.grid.getItem(x + 1,y - 1));
            }
            //Up Right.
            if(y + 1 < height)
            {
                result.push(this.grid.getItem(x + 1, y + 1));
            }
        }
        //Up
        if(y - 1 >= 0)
        {
            result.push(this.grid.getItem(x, y - 1));
        }
        //Down
        if(y + 1 < height)
        {
            result.push(this.grid.getItem(x, y + 1));
        }

        //log("Neighbours count: " + result.length);
        return result;
    }

    private getXZ(worldPosition: Vec3): Vec2
    {
        let origin = this.node.worldPosition.clone();
        let x = -Math.floor((worldPosition.x - origin.x)/this.cellSize);
        let z = Math.floor((worldPosition.z - origin.z)/this.cellSize);
        return new Vec2(x,z);
    }

    private getWorldPosition(x: number, z: number): Vec3
    {
        let origin = this.node.worldPosition.clone();

        let originX = origin.x - x * this.cellSize;
        let originZ = origin.z + z * this.cellSize;

        return new Vec3(originX, origin.y, originZ);
    }

    private getHeuristicCost(node1: AStarPathNode, node2: AStarPathNode) : number
    {
        return this.manhattanHeuristic(node1, node2);
    }

    private manhattanHeuristic(node1: AStarPathNode, node2: AStarPathNode): number
    {
        let xDistance = Math.abs(node1.getInGridPos().x - node2.getInGridPos().x);
        let yDistance = Math.abs(node1.getInGridPos().y - node2.getInGridPos().y);

        let remaining = Math.abs(xDistance - yDistance);

        return this.diagonalCost * Math.min(xDistance,yDistance) + this.straightCost * remaining;
    }

    private compareNode(node1: AStarPathNode, node2: AStarPathNode): boolean
    {
        return node1.getFCost() < node2.getFCost() || (node1.getFCost() == node2.getFCost() && node1.getHCost() < node2.getHCost());
    }

    private createNode(): AStarPathNode
    {
        return new AStarPathNode(Vec2.ZERO.clone(), false);
    }
    


    protected onLoad(): void {
        
        if(AStarPathfinding.instance == null)
        {
            AStarPathfinding.instance = this;
            this.openSet = new PriorityQueue<AStarPathNode>(this.compareNode);
            this.closeSet = new PriorityQueue<AStarPathNode>(this.compareNode);

            this.grid = new Grid<AStarPathNode>(this.width, this.height, this.createNode.bind(this));
            let width = this.grid.getWidth();
            let height = this.grid.getHeight();
            
            for(let i = 0; i < width; i++)
            {
                for(let j = 0; j < height; j++)
                {
                    let node = this.grid.getItem(i, j);
                    node.setInGridPos(new Vec2(i,j));
                    this.grid.setItem(node, i ,j);
                }    
            }
        }
        else
        {
            this.destroy();
        }
    }

}


