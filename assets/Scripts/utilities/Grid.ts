

export class Grid<T>{
    
    private array: T[][] = [];

    private width: number = 0;
    private height: number = 0;

    public constructor(width: number, height: number, createFunc: () => T)
    {
        this.width = width;
        this.height = height;

        for(let i = 0; i < width; i++)
        {
            let container: T[] = [];
            for(let j = 0; j < height; j++)
            {
                let copy = createFunc();
                container.push(copy);
            }
            this.array.push(container);
        }
    }

    public isIndexInBounds(i: number, j: number): boolean
    {
        return i >= 0 && i < this.width && j >= 0 && j < this.height;
    }
    public getItem(i: number, j: number) : T
    {
        if(this.isIndexInBounds(i,j))
        {
            return this.array[i][j];
        }

        return undefined;
    }
}


