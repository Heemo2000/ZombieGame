import { _decorator, Component, Node, Toggle, EventHandler, Vec3, input, EventMouse, Input, log, geometry, CameraComponent } from 'cc';
import { SoundManager } from '../soundManagement/SoundManager';
import { SoundData } from '../soundManagement/SoundData';
//import { Constants } from '../core/Constants';
const { ccclass, executionOrder, property } = _decorator;

@ccclass('SoundTest')
//@executionOrder(Constants.SOUND_TEST_SCR_ORD)
export class SoundTest extends Component {

    @property
    ({
        type: SoundData
    })
    private musicData: SoundData = null;

    @property
    ({
        type: SoundData
    })
    private sfxData: SoundData = null;

    @property
    ({
        type: Toggle
    })
    private musicToggle: Toggle = null;

    @property
    ({
        type: Toggle
    })
    private sfxToggle: Toggle = null;
    
    @property
    ({
        type: CameraComponent
    })
    private lookCamera: CameraComponent = null;

    private toggleMusic(): void
    {
        log("Toggling music");
        let muteStatus = SoundManager.getInstance().getMusicMuteStatus();
        SoundManager.getInstance().setMusicMuteStatus(!muteStatus);
    }

    private toggleSFX(): void
    {
        log("Toggling SFX");
        let muteStatus = SoundManager.getInstance().getSFXMuteStatus();
        SoundManager.getInstance().setSFXMuteStatus(!muteStatus);
    }

    private onMousePressed(event: EventMouse)
    {
        if(event.getButton() != EventMouse.BUTTON_LEFT)
        {
            return;
        }

        //log("Position: " + event.getLocation());

        let ray = this.lookCamera.screenPointToRay(event.getLocationX(), event.getLocationY());
        let planePoint = this.node.worldPosition;
        let planeNormal = Vec3.FORWARD.clone();
        let denominator = Vec3.dot(ray.d, planeNormal);

        if(denominator != 0.0)
        {
            let t = Vec3.dot(Vec3.subtract(new Vec3(), planePoint, ray.o), planeNormal) / denominator;

            if(t >= 0)
            {
                let playSoundPos = Vec3.add(new Vec3(), ray.o, Vec3.multiplyScalar(new Vec3(), ray.d, t));
                //log("SFX play position: " + playSoundPos);
                SoundManager.getInstance().play(this.sfxData, playSoundPos);
            }
        }

        
    }

    protected onLoad(): void 
    {

    }

    start() {

        SoundManager.getInstance().setMusicMuteStatus(false);
        SoundManager.getInstance().setSFXMuteStatus(false);

        this.musicToggle.isChecked = true;
        this.sfxToggle.isChecked = true;

        let eventToToggleMusic = new EventHandler();
        eventToToggleMusic.target = this.node;
        eventToToggleMusic.component = "SoundTest";
        eventToToggleMusic.handler = "toggleMusic";

        this.musicToggle.checkEvents.push(eventToToggleMusic);
    
        let eventToToggleSFX = new EventHandler();
        eventToToggleSFX.target = this.node;
        eventToToggleSFX.component = "SoundTest";
        eventToToggleSFX.handler = "toggleSFX";

        this.sfxToggle.checkEvents.push(eventToToggleSFX);
        input.on(Input.EventType.MOUSE_DOWN, this.onMousePressed, this);
        
        SoundManager.getInstance().play(this.musicData, Vec3.ZERO.clone());
    }

    protected onDestroy(): void {
        input.off(Input.EventType.MOUSE_DOWN, this.onMousePressed, this);
    }
}


