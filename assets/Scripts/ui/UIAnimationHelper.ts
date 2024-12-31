import { _decorator, Node, tween, Tween,Vec3,UIOpacity,Canvas, UITransform, error, log } from 'cc';
import { Direction } from './Direction';
const { ccclass, property } = _decorator;

export default class UIAnimationHelper {
    public static zoomIn(node: Node, speed: number, onEnd?: ()=> void) : Tween
    {
        node.active = true;
        node.setScale(Vec3.ZERO.clone());
        const opacityComp = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacityComp.opacity = 255;
        return tween(node).to(1.0 / speed, {scale: Vec3.ONE.clone()}, 
                             {easing: "quadOut",
                              onUpdate(target, ratio) {
                                    //log(target.name + " Scale: " + target.getScale());
                                    //log("Delta: " + ratio);
                                },
                             })
                          .call(()=> {
                            if(onEnd)
                            {
                                onEnd();
                            }
                          }).start();
    }


    public static zoomOut(
        node: Node,
        speed: number,
        onEnd?: () => void
    ): Tween {
        node.active = true;
        node.setScale(Vec3.ONE.clone());
        const opacityComp = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacityComp.opacity = 255;

        return tween(node)
            .to(1 / speed, { scale: Vec3.ZERO.clone() }, { easing: "quadIn" })
            .call(() => {
                if (onEnd) onEnd();
                node.active = false; // Disable the node after animation
            })
            .start();
    }

    // Fade In
    public static fadeIn(
        node: Node,
        speed: number,
        onEnd?: () => void
    ): Tween {
        node.active = true;
        node.setScale(Vec3.ONE.clone());
        const opacityComp = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacityComp.opacity = 0;
        return tween(opacityComp)
            .to(1 / speed, { opacity: 255 }, 
                { 
                    easing: "quadOut",
                    onUpdate(target, ratio) 
                    {
                        //log("Opacity: " + target.opacity);    
                    } 
                })
            .call(() => {
                if (onEnd) onEnd();
            })
            .start();
    }

    // Fade Out
    public static fadeOut(
        node: Node,
        speed: number,
        onEnd?: () => void
    ): Tween {
        node.active = true;
        node.setScale(Vec3.ONE.clone());
        const opacityComp = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacityComp.opacity = 255;
        return tween(opacityComp)
            .to(1 / speed, { opacity: 0 }, { easing: "quadIn" })
            .call(() => {
                if (onEnd) onEnd();
                node.active = false; // Disable the node after animation
            })
            .start();
    }

    // Slide In
    public static slideIn(
        node: Node,
        direction: Direction,
        speed: number,
        onEnd?: () => void
    ): Tween {
        node.active = true;
        node.setScale(Vec3.ONE.clone());

        const startPos = this.getSlideStartPosition(node, direction);
        node.setPosition(startPos);
        return tween(node)
            .to(1 / speed, { position: Vec3.ZERO.clone() }, { easing: "quadOut" })
            .call(() => {
                if (onEnd) onEnd();
            })
            .start();
    }

    // Slide Out
    public static slideOut(
        node: Node,
        direction: Direction,
        speed: number,
        onEnd?: () => void
    ): Tween {
        node.active = true;
        node.setScale(Vec3.ONE.clone());
        node.setPosition(Vec3.ZERO.clone());
        const endPos = this.getSlideEndPosition(node, direction);
        return tween(node)
            .to(1 / speed, { position: endPos }, { easing: "quadIn" })
            .call(() => {
                if (onEnd) onEnd();
                node.active = false; // Disable the node after animation
            })
            .start();
    }

    // Utility to calculate slide start position
    private static getSlideStartPosition(node: Node, direction: Direction): Vec3 {
        const transform: UITransform = node.getComponent(UITransform);
        if(transform == null)
        {
            error("Can't find UITransform component on " + node.name);
            return Vec3.ZERO.clone();
        }
        const size = transform.contentSize;
        switch (direction) {
            case Direction.UP:
                return new Vec3(0, -size.height);
            case Direction.RIGHT:
                return new Vec3(-size.width, 0);
            case Direction.DOWN:
                return new Vec3(0, size.height);
            case Direction.LEFT:
                return new Vec3(size.width, 0);
            default:
                return Vec3.ZERO.clone();
        }
    }

    // Utility to calculate slide end position
    private static getSlideEndPosition(node: Node, direction: Direction): Vec3 {
        const transform: UITransform = node.getComponent(UITransform);
        if(transform == null)
        {
            error("Can't find UITransform component on " + node.name);
            return Vec3.ZERO.clone();
        }
        const size = transform.contentSize;
        switch (direction) {
            case Direction.UP:
                return new Vec3(0, size.height);
            case Direction.RIGHT:
                return new Vec3(size.width, 0);
            case Direction.DOWN:
                return new Vec3(0, -size.height);
            case Direction.LEFT:
                return new Vec3(-size.width, 0);
            default:
                return Vec3.ZERO.clone();
        }
    }
}


