import { _decorator, ccenum, CCFloat, Component, Node, Enum,EventHandler,Tween, CCBoolean } from 'cc';
import { UIAnimationMode } from './UIAnimationMode';
import { Direction } from './Direction';
import UIAnimationHelper from './UIAnimationHelper';
const { ccclass, property } = _decorator;

@ccclass('Page')
export class Page extends Component {
    @property
    ({
        type: CCFloat,
        min: 0.1
    })
    private animationSpeed: number = 1.0

    @property
    ({
        type: Enum(UIAnimationMode)
    })
    private entryMode: UIAnimationMode = UIAnimationMode.DO_NOTHING

    @property
    ({
        type: Enum(Direction)
    })
    private entryDirection: Direction = Direction.NONE;

    @property
    ({
        type: Enum(UIAnimationMode)
    })
    private exitMode: UIAnimationMode = UIAnimationMode.DO_NOTHING;

    @property
    ({
        type: Enum(Direction)
    })
    private exitDirection: Direction = Direction.NONE;

    @property
    ({
        type: CCBoolean
    })
    private shouldExitOnNewPagePush: boolean = false;

    @property({
        type: EventHandler
    })
    public onPushAction: EventHandler[] = [];

    @property({
        type: EventHandler
    })
    public onPostPushAction: EventHandler[] = [];

    @property({
        type: EventHandler
    })
    public onPrePopAction: EventHandler[] = [];

    @property({
        type: EventHandler
    })
    public onPostPopAction: EventHandler[] = [];

    private animationTween: Tween<any>  = null;

    
    public exitOnNewPagePush(): boolean
    {
        return this.shouldExitOnNewPagePush;
    }

    public enter(): void {
        this.invokeHandlers(this.onPushAction);

        switch (this.entryMode) {
            case UIAnimationMode.SLIDE:
                this.slideIn();
                break;
            case UIAnimationMode.ZOOM:
                this.zoomIn();
                break;
            case UIAnimationMode.FADE:
                this.fadeIn();
                break;
        }
    }

    public exit(): void {
        this.invokeHandlers(this.onPrePopAction);

        switch (this.exitMode) {
            case UIAnimationMode.SLIDE:
                this.slideOut();
                break;
            case UIAnimationMode.ZOOM:
                this.zoomOut();
                break;
            case UIAnimationMode.FADE:
                this.fadeOut();
                break;
        }
    }

    private slideIn() {
        this.stopAnimation();
        this.animationTween = UIAnimationHelper.slideIn(
            this.node,
            this.entryDirection,
            this.animationSpeed,
            () => this.invokeHandlers(this.onPostPushAction)
        );
    }

    private slideOut() {
        this.stopAnimation();
        this.animationTween = UIAnimationHelper.slideOut(
            this.node,
            this.exitDirection,
            this.animationSpeed,
            () => this.invokeHandlers(this.onPostPopAction)
        );
    }

    private zoomIn() {
        this.stopAnimation();
        this.animationTween = UIAnimationHelper.zoomIn(
            this.node,
            this.animationSpeed,
            () => this.invokeHandlers(this.onPostPushAction)
        );
    }

    private zoomOut() {
        this.stopAnimation();
        this.animationTween = UIAnimationHelper.zoomOut(
            this.node,
            this.animationSpeed,
            () => this.invokeHandlers(this.onPostPopAction)
        );
    }

    private fadeIn() {
        this.stopAnimation();
        this.animationTween = UIAnimationHelper.fadeIn(
            this.node,
            this.animationSpeed,
            () => this.invokeHandlers(this.onPostPushAction)
        );
    }

    private fadeOut() {
        this.stopAnimation();
        this.animationTween = UIAnimationHelper.fadeOut(
            this.node,
            this.animationSpeed,
            () => this.invokeHandlers(this.onPostPopAction)
        );
    }

    private stopAnimation() {
        if (this.animationTween) {
            this.animationTween.stop();
            this.animationTween = null;
        }
    }

    private invokeHandlers(handlers: EventHandler[]) {
        handlers.forEach(handler => handler.emit([]));
    }
}


