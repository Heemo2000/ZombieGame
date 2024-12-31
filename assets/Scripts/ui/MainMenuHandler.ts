import { _decorator, Component, Node, Button, EventHandler, error } from 'cc';
import { UIManager } from './UIManager';
import { Page } from './Page';
const { ccclass, property } = _decorator;

@ccclass('MainMenuHandler')
export class MainMenuHandler extends Component {
    
    @property
    ({
        type: UIManager
    })
    private uiManager: UIManager = null;

    @property
    ({
        type: Page
    })
    private mainMenu: Page = null;

    @property
    ({
        type: Page
    })
    private levelSelection: Page = null;

    @property
    ({
        type: Button
    })
    private playButton: Button = null;

    @property
    ({
        type: Button
    })
    private goBackToMain: Button = null;

    @property
    ({
        type: Button
    })
    private levelBtns: Button[] = [];



    start() 
    {
        this.uiManager.node.active = true;
        this.levelSelection.node.active = false;
        this.uiManager.pushPage(this.mainMenu);

        let eventToOpenLevelSel = new EventHandler();
        eventToOpenLevelSel.target = this.node;
        eventToOpenLevelSel.component = "MainMenuHandler";
        eventToOpenLevelSel.handler = "openLevelSelection";

        this.playButton.clickEvents.push(eventToOpenLevelSel);
    
        let eventToGoBackToMain = new EventHandler();
        eventToGoBackToMain.target = this.node;
        eventToGoBackToMain.component = "MainMenuHandler";
        eventToGoBackToMain.handler = "closeLevelSel";

        this.goBackToMain.clickEvents.push(eventToGoBackToMain);

    }

    public openLevelSelection() : void
    {
        this.uiManager.pushPage(this.levelSelection);
    }

    public closeLevelSel(): void
    {
        if(this.uiManager.isPageInStack(this.mainMenu) && this.uiManager.isPageOnTopOfStack(this.levelSelection))
        {
            this.uiManager.popPage();
        }
        else
        {
            error("Failed to go back to main menu");
        }
    }
    
}


