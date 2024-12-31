import { _decorator, Component, Node, AudioSource, error, EventHandler, log } from 'cc';
import { SoundData } from './SoundData';
import { CommonUtility } from '../utilities/CommonUtility';
import { SoundType } from './SoundType';
//import { Constants } from '../core/Constants';
const { ccclass, executionOrder, property } = _decorator;

@ccclass('SoundEmitter')
//@executionOrder(Constants.SOUND_EMITTER_SCR_ORD)
export class SoundEmitter extends Component {
    
    public onStop: (emitter: SoundEmitter)=> void;

    private audioSource: AudioSource = null;
    private data: SoundData = null;
    private playingCoroutine: any = null;
    private paused: boolean = true;
    private mute: boolean = false;
    private soundType: SoundType = SoundType.MUSIC;

    public getData(): SoundData
    {
        return this.data;
    }

    public getSoundType(): SoundType
    {
        return this.soundType;
    }

    public isMuted(): boolean
    {
        return this.mute;
    }

    public isPaused(): boolean
    {
        return this.paused;
    }

    public initialize(data: SoundData): void {
        if(data == null)
        {
            error("Sound Data is null, can't initialize.");
            return;
        }
        else if(this.audioSource == null)
        {
            error("Audio Source is null");
            return;
        }
        
        this.data = data;

        this.soundType = data.soundType;
        this.audioSource.clip = data.clip;
        this.audioSource.loop = data.loop;
        this.audioSource.playOnAwake = data.playOnAwake;

        this.audioSource.volume = data.volume;
    }

    public play(): void {
        if(this.audioSource == null)
        {
            error("Audio Source is null. Can't play!");
            return;
        }
        if (this.playingCoroutine != null) {
            CommonUtility.stopCoroutine(this.playingCoroutine);
            this.playingCoroutine = null;
        }
        this.paused = false;
        this.audioSource.play();
        this.playingCoroutine = CommonUtility.startCoroutine(() => this.waitForSoundToEnd());
    }

    public setPause(value: boolean)
    {
        if(this.audioSource == null)
        {
            error("Audio Source is null. Can't modify pause status");
            return;
        }
        this.paused = value;
        if(value == true)
        {
            this.audioSource.pause();
        }
        else
        {
            this.audioSource.play();
        }
    }

    public setMute(value: boolean)
    {
        if(this.audioSource == null)
        {
            error("Audio Source is null. Can't modify pause status");
            return;
        }
        //log("Setting mute to " + value);
        this.mute = value;
        if(value == true)
        {
            this.audioSource.volume = 0.0; 
        }
        else
        {
            this.audioSource.volume = this.data.volume;
        }
    }


    private *waitForSoundToEnd(): Generator<Promise<void>, void, unknown> {
        yield new Promise<void>((resolve) => setTimeout(resolve, 100));
        //log("Waiting for end");
        while (this.paused == true || this.audioSource.playing) {
            //log("Sound has not end yet");
            yield new Promise<void>((resolve) => setTimeout(resolve, 100));
        }
        //log("Sound stopped");
        this.stop();
    }

    public stop(): void {
        if (this.playingCoroutine != null) {
            CommonUtility.stopCoroutine(this.playingCoroutine);
            this.playingCoroutine = null;
        }

        this.paused = false;
        this.mute = false;
        this.audioSource.volume = this.data.volume;
        this.audioSource.stop();
        this.onStop(this);
    }

    

    protected onLoad(): void {
        //log("Trying to get audio source");
        this.audioSource = this.getComponent(AudioSource);
    }

    start() {
        
    }


}


