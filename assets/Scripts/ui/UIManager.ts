import { _decorator, Component, Node, error, warn, log } from 'cc';
import {Page} from './Page';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property({
        type: Page
    })
    initialPage: Page = null; // Equivalent of Unity's serialized field for the initial page

    private pageStack: Array<Page> = []; // Stack to manage pages

    get PageCount(): number {
        if(this.pageStack == null)
        {
            return -1;
        }
        return this.pageStack.length;
    }

    /**
     * Check if a page is in the stack
     * @param page The page node to check
     * @returns true if the page is in the stack
     */
    public isPageInStack(page: Page): boolean {
        return this.pageStack.indexOf(page) != -1;
    }

    /**
     * Check if a page is on top of the stack
     * @param page The page node to check
     * @returns true if the page is on top of the stack
     */
    public isPageOnTopOfStack(page: Page): boolean {
        return this.pageStack.length > 0 && this.pageStack[this.pageStack.length - 1] === page;
    }

    /**
     * Push a page onto the stack
     * @param page The page node to push
     */
    public pushPage(page: Page): void {
        if(page == undefined)
        {
            error("Page is undefined!");
            return;
        }
        
        if (!page) {
            error("Page is null!");
            return;
        }
        
        if (!page.node.active) {
            page.node.active = true;
        }

        page.enter();

        if (this.pageStack.length > 0) {
            const currentPage = this.pageStack[this.pageStack.length - 1];
            
            if (currentPage != null && currentPage.exitOnNewPagePush()) {
                currentPage.exit();
            }
        }

        this.pageStack.push(page);
    }

    /**
     * Pop the top page from the stack
     */
    public popPage(): void {
        if (this.pageStack.length > 1) {
            const page = this.pageStack.pop();
            
            page.exit();
            

            const newCurrentPage = this.pageStack[this.pageStack.length - 1];
            
            if (newCurrentPage != null) {
                newCurrentPage.enter();
            }
        } else {
            warn("Trying to pop a page but only 1 page remains in the stack!");
        }
    }

    /**
     * Pop all pages except the bottom-most page
     */
    public popAllPages(): void {
        while (this.pageStack.length > 1) {
            this.popPage();
        }
    }

    onLoad() {
        this.pageStack = [];
    }

    start() {
        if (this.initialPage) {
            this.pushPage(this.initialPage);
        }
    }

    /*
    protected update(dt: number): void 
    {
        if(this.PageCount > 0)
        {
            log("Top page: " + this.pageStack[this.pageStack.length - 1].node.name);    
        }    
    }
    */

}


