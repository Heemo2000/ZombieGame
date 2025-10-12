import { Enum } from "cc";


export enum PhysicsGroup
{
    DEFAULT = 1 << 0,
    PLAYER = 1 << 1,
    GROUND = 1 << 2,
    WORLD = 1 << 3,
    ENEMY = 1 << 4
};

Enum(PhysicsGroup);
