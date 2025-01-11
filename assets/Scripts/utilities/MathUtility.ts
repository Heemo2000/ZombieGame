import { math, Vec2, Vec3, Quat, Mat3, random, geometry, log } from 'cc';


export class MathUtility 
{
    private static epsilon: number = 0.005;
    public static getRotation(forward: Vec3, right: Vec3) : Quat
    {
        if(forward.lengthSqr() > 1.0 * 1.0)
        {
            forward.set(forward.normalize());
        }

        if(right.lengthSqr() > 1.0 * 1.0)
        {
            right.set(right.normalize());
        }

        let up = new Vec3();
        Vec3.cross(up, forward, right);

        let rotationMat = new Mat3();

        rotationMat.m00 = right.x;
        rotationMat.m01 = right.y;
        rotationMat.m02 = right.z;

        rotationMat.m03 = forward.x;
        rotationMat.m04 = forward.y;
        rotationMat.m05 = forward.z;

        rotationMat.m06 = up.x;
        rotationMat.m07 = up.y;
        rotationMat.m08 = up.z;

        let rotation = new Quat();
        Quat.fromMat3(rotation, rotationMat);

        return rotation;
    }

    public static lerpAngle(a: number, b: number, t: number): number 
    {
        
        // Normalize angles to the range [0, 360)
        a = ((a % 360) + 360) % 360;
        b = ((b % 360) + 360) % 360;
    
        // Calculate the difference and ensure the shortest path
        let delta = b - a;
        if (delta > 180) {
            delta -= 360;
        } else if (delta < -180) {
            delta += 360;
        }
    
        // Interpolate
        return a + delta * t;
    }

    public static getBoundingBoxDimensions(position: Vec3, halfExtents: Vec3): geometry.AABB
    {
        let dimensions = geometry.AABB.create(position.x, position.y, position.z, 
                                              halfExtents.x, halfExtents.y, halfExtents.z);
        return dimensions;
    }
    
    public static checkVec2Equal(first: Vec2, second: Vec2): boolean
    {
        let xDifference = Math.abs(first.x - second.x);
        let yDifference = Math.abs(first.y - second.y);
       
        //log("x difference: " + xDifference);
        //log("y difference: " + yDifference);

        return xDifference <= MathUtility.epsilon &&
               yDifference <= MathUtility.epsilon;
    }

    public static checkVec3Equal(first: Vec3, second: Vec3): boolean
    {
        return Math.abs(first.x - second.x) <= MathUtility.epsilon &&
               Math.abs(first.y - second.y) <= MathUtility.epsilon &&
               Math.abs(first.z - second.z) <= MathUtility.epsilon;
    }
}


