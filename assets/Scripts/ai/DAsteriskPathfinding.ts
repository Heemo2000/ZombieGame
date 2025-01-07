import { _decorator, Component, Node, Vec2, Vec3, PhysicsSystem, geometry, error, log, Color } from 'cc';
import { Grid } from '../utilities/Grid';
import { PathNode } from './PathNode';
import { PriorityQueue } from '../utilities/PriorityQueue';
import { Constants } from '../core/Constants';
import { PhysicsGroup } from '../core/PhysicsGroup';
import { VisualDebug } from '../core/VisualDebug';
const { ccclass, property } = _decorator;

@ccclass('DAsteriskPathfinding')
export class DAsteriskPathfinding extends Component {

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
    
    private static instance: DAsteriskPathfinding = null;

    private kConstant: number = 10;
    private diagonalCost: number = 14;
    private straightCost: number = 10;


    private grid: Grid<PathNode> = null;
    private startNode: PathNode = null;
    private endNode: PathNode = null;
    private path: Vec3[] = [];


    private priorityQueue: PriorityQueue<PathNode> = null;

    public static getInstance(): DAsteriskPathfinding
    {
        return DAsteriskPathfinding.instance;
    }

    public findPath(startPosition: Vec3, endPosition: Vec3): Vec3[]
    {
        let xz: Vec2 = this.getXZ(startPosition);
        
        if(!this.grid.isIndexInBounds(xz.x, xz.y))
        {
            error("Can't find start position node!");
            return;
        }

        this.startNode = this.grid.getItem(xz.x,xz.y);

        xz = this.getXZ(endPosition);
        if(!this.grid.isIndexInBounds(xz.x, xz.y))
        {
            error("Can't find end position node!");
            return;
        }

        this.endNode = this.grid.getItem(xz.x, xz.y);

        this.initialize();
        this.computeShortestPath();
        this.findPathVertices();

        return this.path;
    }

    private getXZ(worldPosition: Vec3): Vec2
    {
        let origin = this.node.worldPosition;
        let x = Math.floor((worldPosition.x - origin.x)/this.cellSize);
        let z = Math.floor((worldPosition.z - origin.z)/this.cellSize);
        return new Vec2(x,z);
    }

    private getWorldPosition(x: number, z: number): Vec3
    {
        let origin = this.node.worldPosition.clone();

        return origin.add(new Vec3(-z * this.cellSize,0,x * this.cellSize)).clone();
    }


    private compareNode(node1: PathNode, node2: PathNode): boolean
    {
        return node1.getKey1() < node2.getKey1() || (node1.getKey1() == node2.getKey1() && node1.getKey2() <= node2.getKey2());
    }

    private compareKey(node1Key1: number, node1Key2: number, node2Key1: number, node2Key2: number): boolean
    {
        return node1Key1 < node2Key1 || (node1Key1 == node2Key1 && node1Key2 <= node2Key2);
    }

    private updateVertex(node: PathNode): void
    {
        if(!node.equals(this.endNode))
        {
            let rhsCost = Constants.MAX_INT_VALUE;
            let successors = this.getSuccessors(node);

            for(let i = 0; i < successors.length; i++)
            {
                rhsCost = Math.min(rhsCost, successors[i].getGCost() + this.getHeuristicCost(node, successors[i]));
            }

            node.setRHSCost(rhsCost);
        }

        if(this.priorityQueue.contains(node))
        {
            this.priorityQueue.removeValue(node);
        }

        if(node.getGCost() != node.getRHSCost())
        {
            this.calculateKey1(node);
            this.calculateKey2(node);

            this.priorityQueue.insert(node);
        }
    }

    private initialize(): void
    {
        this.priorityQueue.clear();
        //this.kConstant = 0;

        let checkGroup = PhysicsGroup.GROUND | PhysicsGroup.WORLD;
        let checkRay = new geometry.Ray(0.0, 0.0, 0.0, 0.0, -1.0, 0.0);
        for(let i = 0; i < this.grid.getWidth(); i++)
        {
            for(let j = 0; j < this.grid.getHeight(); j++)
            {
                let node = this.grid.getItem(i, j);

                node.setRHSCost(Constants.MAX_INT_VALUE);
                node.setGCost(Constants.MAX_INT_VALUE);
                
                let checkPosition = this.getWorldPosition(i,j).add(Vec3.UP.clone().multiplyScalar(this.cellSize)).clone();
                checkRay.o = checkPosition.clone();
                let walkable = PhysicsSystem.instance.sweepSphereClosest(checkRay, this.cellSize, checkGroup, this.cellSize, true);
                node.setWalkable(walkable);
                
                this.grid.setItem(node,i,j);
            }
        }

        this.endNode.setRHSCost(0);
        this.priorityQueue.insert(this.endNode);
    } 

    private computeShortestPath(): void
    {
        while((this.priorityQueue.getCount() > 0 && this.compareNode(this.priorityQueue.peek(), this.startNode)) || this.startNode.getRHSCost() != this.startNode.getGCost())
        {
            let currentNode = this.priorityQueue.remove();

            let oldKey1 = currentNode.getKey1();
            let oldKey2 = currentNode.getKey2();

            let newKey1 = this.calculateKey1(currentNode);
            let newKey2 = this.calculateKey2(currentNode);
            if(this.compareKey(oldKey1, oldKey2, newKey1, newKey2))
            {
                currentNode.setKey1(newKey1);
                currentNode.setKey2(newKey2);
                this.priorityQueue.insert(currentNode);
            }
            else if(currentNode.getGCost() > currentNode.getRHSCost())
            {
                currentNode.setGCost(currentNode.getRHSCost());
                
                let predecessors = this.getPredecessors(currentNode);
                for(let i = 0; i < predecessors.length; i++)
                {
                    this.updateVertex(predecessors[i]);
                }
            }
            else
            {
                currentNode.setGCost(Constants.MAX_INT_VALUE);
                let predecessors = this.getPredecessors(currentNode);

                for(let i = 0; i < predecessors.length; i++)
                {
                    this.updateVertex(predecessors[i]);
                }
            }

        }
    }

    private findPathVertices(): void
    {
        this.path.length = 0;

        let inGridPos = this.startNode.getInGridPos();
        
        this.path.push(this.getWorldPosition(inGridPos.x, inGridPos.y));
        
        while(!this.startNode.equals(this.endNode))
        {
            if(this.startNode.getGCost() == Constants.MAX_INT_VALUE)
            {
                this.path.length = 0;
                return;
            }

            let successors = this.getSuccessors(this.startNode);
            let minNode = this.startNode;
            let minCost = Constants.MAX_INT_VALUE;
            for(let i = 0; i < successors.length; i++)
            {
                let currentNode = successors[i];
                let currentCost = this.getHeuristicCost(this.startNode, currentNode) + currentNode.getGCost();
                if(currentCost < minCost)
                {
                    minCost = currentCost;
                    minNode = successors[i];
                }
            }

            inGridPos = minNode.getInGridPos();
            this.path.push(this.getWorldPosition(inGridPos.x, inGridPos.y));
            this.startNode = minNode;
        }
    }

    private getPredecessors(node: PathNode): PathNode[]
    {
        return this.getNeighbours(node);
    }

    private getSuccessors(node: PathNode): PathNode[]
    {
        return this.getNeighbours(node);
    }

    private getNeighbours(node: PathNode): PathNode[]
    {
        let result:PathNode[] = [];
        
        let x: number = node.getInGridPos().x;
        let y: number = node.getInGridPos().y;

        let width: number = this.grid.getWidth();
        let height: number = this.grid.getHeight();

        //Top Row
        if(x - 1 >= 0)
        {
            //Top Left
            if(y -1 >= 0)
            {
                result.push(this.grid.getItem(x-1, y-1));
            }
            
            //Top
            result.push(this.grid.getItem(x-1,y));

            //Top Right
            if(y + 1 < width)
            {
                result.push(this.grid.getItem(x-1, y+1));
            }
        }
        //Mid Row
        //Top Left
        if(y -1 >= 0)
        {
            result.push(this.grid.getItem(x, y-1));
        }
        if(y + 1 < width)
        {
            result.push(this.grid.getItem(x, y+1));
        }

        //Bottom Row
        if(x + 1 < height)
        {
            //Bottom Left
            if(y -1 >= 0)
            {
                result.push(this.grid.getItem(x+1, y-1));
            }
            
            //Bottom
            result.push(this.grid.getItem(x+1,y));

            //Bottom Right
            if(y + 1 < width)
            {
                result.push(this.grid.getItem(x+1, y+1));
            }
        }
        return result;
    }

    private calculateKey1(node: PathNode): number
    {
        let key1Cost = Math.min(node.getGCost(), node.getRHSCost()) + this.getHeuristicCost(this.startNode, node) + this.kConstant;
        node.setKey1(key1Cost);
        return key1Cost;
    }

    private calculateKey2(node: PathNode): number
    {
        let key2Cost = Math.min(node.getGCost(), node.getRHSCost());
        node.setKey2(key2Cost);
        return key2Cost;
    }

    private getHeuristicCost(node1: PathNode, node2: PathNode) : number
    {
        return this.manhattanHeuristic(node1, node2);
    }

    private manhattanHeuristic(node1: PathNode, node2: PathNode): number
    {
        let xDistance = Math.abs(node1.getInGridPos().x - node2.getInGridPos().x);
        let yDistance = Math.abs(node1.getInGridPos().y - node2.getInGridPos().y);

        let remaining = Math.abs(xDistance - yDistance);

        return this.diagonalCost * Math.min(xDistance,yDistance) + this.straightCost * remaining;
    }

    private createNode(): PathNode
    {
        return new PathNode(Vec2.ZERO.clone(), false);
    }

    protected onLoad(): void 
    {
        if(DAsteriskPathfinding.instance == null)
        {
            DAsteriskPathfinding.instance = this;
            this.priorityQueue = new PriorityQueue<PathNode>(this.compareNode);
            this.grid = new Grid<PathNode>(this.width, this.height, this.createNode.bind(this));
            for(let i = 0; i < this.width; i++)
            {
                for(let j = 0; j < this.height; j++)
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


    protected update(dt: number): void 
    {
        for(let i = 0; i < this.width; i++)
        {
            for(let j = 0; j < this.height; j++)
            {
                let worldPosition = this.getWorldPosition(i,j);
                //log("World Position: " + worldPosition.toString());
                VisualDebug.getInstance().drawWireCube(worldPosition, Vec3.ONE.clone().multiplyScalar(this.cellSize), Color.RED);    
            }    
        }    
    }
}


