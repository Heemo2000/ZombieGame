import { _decorator, Component, Node, Vec2, Vec3, PhysicsSystem, geometry, error, log, Color } from 'cc';
import { Grid } from '../utilities/Grid';
import { DStarPathNode } from './DStarPathNode';
import { PriorityQueue } from '../utilities/PriorityQueue';
import { Constants } from '../core/Constants';
import { PhysicsGroup } from '../core/PhysicsGroup';
import { VisualDebug } from '../core/VisualDebug';
import { MathUtility } from '../utilities/MathUtility';
const { ccclass, property } = _decorator;

@ccclass('DStarPathfinding')
export class DStarPathfinding extends Component {

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
    private showGrid: boolean = false;
    
    private static instance: DStarPathfinding = null;

    private kConstant: number = 10;
    private diagonalCost: number = 14;
    private straightCost: number = 10;


    private grid: Grid<DStarPathNode> = null;
    private startNode: DStarPathNode = null;
    private endNode: DStarPathNode = null;
    private path: Vec3[] = [];
    //private predecessors: PathNode[] = [];
    //private successors: PathNode[] = [];

    private neigboursMap: Map<Vec2, DStarPathNode[]> = null;

    private priorityQueue: PriorityQueue<DStarPathNode> = null;

    public static getInstance(): DStarPathfinding
    {
        return DStarPathfinding.instance;
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

        //log("End Position grid bounds: " + xz.toString());

        if(!this.grid.isIndexInBounds(xz.x, xz.y))
        {
            error("Can't find end position node!");
            return;
        }

        this.endNode = this.grid.getItem(xz.x, xz.y);

        this.initialize();
        this.computeShortestPath();
        //this.findPathVertices();

        return this.path;
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

    private compareNode(node1: DStarPathNode, node2: DStarPathNode): boolean
    {
        return node1.getKey1() < node2.getKey1() || (node1.getKey1() == node2.getKey1() && node1.getKey2() <= node2.getKey2());
    }

    private nodeCheck(node1: DStarPathNode, node2: DStarPathNode): boolean
    {
        return node1.equals(node2);
    }

    private compareKey(node1Key1: number, node1Key2: number, node2Key1: number, node2Key2: number): boolean
    {
        return node1Key1 < node2Key1 || (node1Key1 == node2Key1 && node1Key2 <= node2Key2);
    }

    private updateVertex(node: DStarPathNode): void
    {
        log("Updating vertex");
        
        if(node.getGCost() != node.getRHSCost() && this.priorityQueue.contains(node, this.nodeCheck.bind(this)))
        {
            this.priorityQueue.removeValue(node, this.nodeCheck.bind(this));
            
            let inGridPos = node.getInGridPos();
            
            this.calculateKey1(node);
            this.calculateKey2(node);

            this.grid.setItem(node, inGridPos.x, inGridPos.y);

            this.priorityQueue.insert(node);
        }
        else if(node.getGCost() != node.getRHSCost() && !this.priorityQueue.contains(node,this.nodeCheck.bind(this)))
        {
            let inGridPos = node.getInGridPos();

            this.calculateKey1(node);
            this.calculateKey2(node);

            this.grid.setItem(node, inGridPos.x, inGridPos.y);

            this.priorityQueue.insert(node);
        }
        else if(node.getGCost() == node.getRHSCost() && this.priorityQueue.contains(node, this.nodeCheck.bind(this)))
        {
            this.priorityQueue.removeValue(node, this.nodeCheck.bind(this));
        }
    }

    private initialize(): void
    {
        this.priorityQueue.clear();
        //this.kConstant = 0;

        let checkGroup = PhysicsGroup.GROUND | PhysicsGroup.WORLD;
        
        for(let i = 0; i < this.grid.getWidth(); i++)
        {
            for(let j = 0; j < this.grid.getHeight(); j++)
            {
                let node = this.grid.getItem(i, j);

                node.setRHSCost(Constants.MAX_INT_VALUE);
                node.setGCost(Constants.MAX_INT_VALUE);
                
                
                let checkPosition = this.getWorldPosition(i,j); //this.getWorldPosition(i,j).add(Vec3.UP.clone().multiplyScalar(this.cellSize)).clone();
                let checkRay = new geometry.Ray(checkPosition.x, checkPosition.y, checkPosition.z, 0.0 -1.0, 0.0);
                //checkRay.o = checkPosition.clone();
                let walkable = PhysicsSystem.instance.sweepSphereClosest(checkRay, this.cellSize, checkGroup, this.cellSize, true);
                node.setWalkable(walkable);

                //log("Is walkable on (" + i + ", " + j + "): " + walkable);
                
                this.grid.setItem(node,i,j);
            }
        }

        this.endNode.setRHSCost(0);
        this.priorityQueue.insert(this.endNode);
    } 

    private computeShortestPath(): void
    {
        log("Computing shortest path");
        while((this.priorityQueue.getCount() > 0 && this.compareNode(this.priorityQueue.peek(), this.startNode)) || this.startNode.getRHSCost() != this.startNode.getGCost())
        {
            let currentNode = this.priorityQueue.remove();

            log("Current Node: " + currentNode.getInGridPos().toString());
            let oldKey1 = currentNode.getKey1();
            let oldKey2 = currentNode.getKey2();

            let newKey1 = this.calculateKey1(currentNode);
            let newKey2 = this.calculateKey2(currentNode);
            

            if(this.compareKey(oldKey1, oldKey2, newKey1, newKey2))
            {
                log("Comparing old key with new key");

                let inGridPos = currentNode.getInGridPos();
                currentNode.setKey1(newKey1);
                currentNode.setKey2(newKey2);
                
                this.priorityQueue.removeValue(currentNode, this.nodeCheck.bind(this));
                this.grid.setItem(currentNode, inGridPos.x, inGridPos.y);
                this.priorityQueue.insert(currentNode);

            }
            else if(currentNode.getGCost() > currentNode.getRHSCost())
            {
                log("Setting node's G Cost to RHS Cost");
                currentNode.setGCost(currentNode.getRHSCost());
                //this.computePredecessors(currentNode);

                let predecessors = this.neigboursMap.get(currentNode.getInGridPos());
                for(let i = 0; i < predecessors.length; i++)
                {
                    let node = predecessors[i];
                    let nodeInGridPos = node.getInGridPos();

                    if(!node.equals(this.endNode))
                    {
                        node.setRHSCost(Math.min(node.getRHSCost(), this.getHeuristicCost(node, currentNode) + currentNode.getGCost()));
                        this.grid.setItem(node, nodeInGridPos.x, nodeInGridPos.y);
                    }
                    this.updateVertex(predecessors[i]);
                }
            }
            else
            {
                log("Updating vertices");
                let oldGCost = currentNode.getGCost();
                currentNode.setGCost(Constants.MAX_INT_VALUE);

                //this.computePredecessors(currentNode);
                let predecessors = this.neigboursMap.get(currentNode.getInGridPos());

                predecessors.push(currentNode);

                for(let i = 0; i < predecessors.length; i++)
                {
                    let node = predecessors[i];
                    
                    if(node.getRHSCost() == this.getHeuristicCost(node, currentNode) + oldGCost && !node.equals(this.endNode))
                    {
                        let nodeInGridPos = node.getInGridPos();
                        let successors = this.neigboursMap.get(nodeInGridPos);

                        let minRHSCost = node.getRHSCost();

                        for(let j = 0; j < successors.length; j++)
                        {
                            minRHSCost = Math.min(minRHSCost, this.getHeuristicCost(node, successors[j]) + successors[j].getGCost());
                        }

                        node.setRHSCost(minRHSCost);
                        this.grid.setItem(node, nodeInGridPos.x, nodeInGridPos.y);
                    }

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

            //this.computeSuccessors(this.startNode);
            let successors = this.neigboursMap.get(this.startNode.getInGridPos());
            let minNode = this.startNode;
            let minCost = Constants.MAX_INT_VALUE;
            for(let i = 0; i < successors.length; i++)
            {
                let currentNode = successors[i];
                let currentCost = this.getHeuristicCost(this.startNode, currentNode) + currentNode.getGCost();
                if(currentCost < minCost)
                {
                    minCost = currentCost;
                    minNode = currentNode;
                }
            }

            inGridPos = minNode.getInGridPos();
            this.path.push(this.getWorldPosition(inGridPos.x, inGridPos.y));
            this.startNode = minNode;
        }
    }

    /*
    private computePredecessors(node: PathNode): void
    {
        while(this.predecessors.length > 0)
        {
            this.predecessors.pop();
        }

        let neighbours = this.getNeighbours(node);
        for(let i = 0; i < neighbours.length; i++)
        {
            this.predecessors.push(neighbours[i]);
        }
    }
    */

    /*
    private computeSuccessors(node: PathNode): void
    {
        while(this.successors.length > 0)
        {
            this.successors.pop();
        }
        
        let neighbours = this.getNeighbours(node);
        for(let i = 0; i < neighbours.length; i++)
        {
            this.successors.push(neighbours[i]);
        }
    }
    */

    private getNeighbours(node: DStarPathNode): DStarPathNode[]
    {
        let result:DStarPathNode[] = [];
        
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

    private calculateKey1(node: DStarPathNode): number
    {
        let key1Cost = Math.min(node.getGCost(), node.getRHSCost()) + this.getHeuristicCost(this.startNode, node) + this.kConstant;
        node.setKey1(key1Cost);
        return key1Cost;
    }

    private calculateKey2(node: DStarPathNode): number
    {
        let key2Cost = Math.min(node.getGCost(), node.getRHSCost());
        node.setKey2(key2Cost);
        return key2Cost;
    }

    private getHeuristicCost(node1: DStarPathNode, node2: DStarPathNode) : number
    {
        return this.manhattanHeuristic(node1, node2);
    }

    private manhattanHeuristic(node1: DStarPathNode, node2: DStarPathNode): number
    {
        let xDistance = Math.abs(node1.getInGridPos().x - node2.getInGridPos().x);
        let yDistance = Math.abs(node1.getInGridPos().y - node2.getInGridPos().y);

        let remaining = Math.abs(xDistance - yDistance);

        return this.diagonalCost * Math.min(xDistance,yDistance) + this.straightCost * remaining;
    }

    private createNode(): DStarPathNode
    {
        return new DStarPathNode(Vec2.ZERO.clone(), false);
    }

    protected onLoad(): void 
    {
        if(DStarPathfinding.instance == null)
        {
            DStarPathfinding.instance = this;
            this.priorityQueue = new PriorityQueue<DStarPathNode>(this.compareNode);
            this.neigboursMap = new Map<Vec2, DStarPathNode[]>();

            this.grid = new Grid<DStarPathNode>(this.width, this.height, this.createNode.bind(this));
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
            
            
            for(let i = 0; i < width; i++)
            {
                for(let j = 0; j < height; j++)
                {
                    let node = this.grid.getItem(i,j);
                    this.neigboursMap.set(node.getInGridPos(), this.getNeighbours(node));
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
        if(!this.showGrid)
        {
            return;
        }
        for(let i = 0; i < this.width; i++)
        {
            for(let j = 0; j < this.height; j++)
            {
                let worldPosition = this.getWorldPosition(i,j);
                //log("World Position: " + worldPosition.toString());
                let isApproximatelyClose = (value: Vec3) => MathUtility.checkVec3Equal(value, worldPosition);
                
                let showColor = Color.RED;
                if(this.path.findIndex(isApproximatelyClose) != -1)
                {
                    showColor = Color.BLACK;
                }

                VisualDebug.getInstance().drawWireCube(worldPosition, Vec3.ONE.clone().multiplyScalar(this.cellSize), showColor);    
            }    
        }    
    }
}


