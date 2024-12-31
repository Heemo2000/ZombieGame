import { _decorator, CCInteger, Component, instantiate, Node, log, error, Vec3, Prefab } from 'cc';
import { SoundData } from './SoundData';
import { SoundEmitter } from './SoundEmitter';
import { ObjectPool } from '../utilities/ObjectPool';
import { SoundType } from './SoundType';
//import { Constants } from '../core/Constants';
const { ccclass, executionOrder, property } = _decorator;

@ccclass('SoundManager')
//@executionOrder(Constants.SOUND_MANAGER_SCR_ORD)
export class SoundManager extends Component {
    
    @property
    ({
        type: Prefab
    })
    private soundEmitterPrefab: Prefab = null;

    @property
    ({
        type: CCInteger,
        min: 10
    })
    private soundEmitterPoolSize: 50;
    @property
    ({
        type: CCInteger,
        min: 1
    })
    private maxRunningSoundEmitters: number = 30;

    @property
    (
        {
            readonly: true
        }
    )
    private musicEnabled: boolean = true;

    @property
    ({
        readonly: true
    })
    private sfxEnabled: boolean = true;

    
    private static instance: SoundManager = null;

    private activeSoundEmitters: SoundEmitter[] = [];

    private soundEmitterPool: ObjectPool<SoundEmitter>;

    public static getInstance(): SoundManager
    {
        return SoundManager.instance;
    }

    public play(data: SoundData, position: Vec3) : void
    {
        if(this.activeSoundEmitters.length > this.maxRunningSoundEmitters)
        {
            error("No more sound emitters available");
            return;
        }

        let soundEmitter = this.soundEmitterPool.getValueFromPool();
        soundEmitter.node.setWorldPosition(position);
        soundEmitter.initialize(data);

        switch(data.soundType)
        {
            case SoundType.MUSIC:
                                 soundEmitter.setMute(!this.musicEnabled);
                                 break;
            case SoundType.SFX:
                                 soundEmitter.setMute(!this.sfxEnabled);
                                 break;
        }
        
        soundEmitter.play();
    }

    public returnToPool(emitter: SoundEmitter)
    {
        this.soundEmitterPool.returnValueToPool(emitter);
    }

    public getMusicMuteStatus(): boolean
    {
        return !this.musicEnabled;
    }

    public getSFXMuteStatus(): boolean
    {
        return !this.sfxEnabled;
    }

    public setMusicMuteStatus(value: boolean) : void
    {
        log("Setting music mute status to " + value);
        for(let i = 0; i < this.activeSoundEmitters.length; i++)
        {
            let emitter = this.activeSoundEmitters[i];
            
            if(emitter.getSoundType() == SoundType.MUSIC)
            {
                emitter.setMute(value);
            }
        }

        this.musicEnabled = !value;
    }

    public setSFXMuteStatus(value: boolean) : void
    {
        for(let i = 0; i < this.activeSoundEmitters.length; i++)
        {
            let emitter = this.activeSoundEmitters[i];
            if(emitter.getSoundType() == SoundType.SFX)
            {
                emitter.setMute(value);
            }
        }
        
        this.sfxEnabled = !value;
    }

    public setPauseStatus(value: boolean)
    {
        for(let i = 0; i < this.activeSoundEmitters.length; i++)
        {
            let emitter = this.activeSoundEmitters[i];
            emitter.setPause(value);
        } 
        
    }

    public stop() : void
    {
        while(this.activeSoundEmitters.length > 0)
        {
            let emitter = this.activeSoundEmitters.pop();
            emitter.stop();
        }
    }

    private createSoundEmitter() : SoundEmitter
    {
        //log("This object: " + this.name);
        //log("Is sound emitter prefab undefined: " + (this.soundEmitterPrefab == undefined));
        let soundEmitterNode =  instantiate(this.soundEmitterPrefab);
        //log("Is Sound Emitter undefined: " + (soundEmitterNode === undefined));
        //log("Is Sound Emitter null: " + (soundEmitterNode === null));
        this.node.addChild(soundEmitterNode);
        soundEmitterNode.active = false;

        let soundEmitter = soundEmitterNode.getComponent(SoundEmitter);
        
        if(soundEmitter == null)
        {
            return null;
        }
        
        soundEmitter.onStop = this.returnToPool.bind(this);
        return soundEmitter;
    }

    private gettingSoundEmitter(emitter: SoundEmitter): void
    {
        //log("Getting sound emitter");
        emitter.node.active = true;
        this.activeSoundEmitters.push(emitter);
        //log("Active sound emitters: " + this.activeSoundEmitters.length);
    }

    private returnSoundEmitter(emitter: SoundEmitter): void
    {
        emitter.node.active = false;
        let index = this.activeSoundEmitters.indexOf(emitter);
        if(index != -1)
        {
            this.activeSoundEmitters.splice(index, 1);
        }
    }

    private destroySoundEmitter(emitter: SoundEmitter)
    {
        if(emitter == null)
        {
            error("Sound Emitter is null. Can't destroy.");
            return;
        }
        emitter.node.destroy();
    }

    protected onLoad(): void {
        if(SoundManager.instance == null)
        {
            SoundManager.instance = this;    
        }
        else
        {
            this.destroy();
        }        
    }


    start() 
    {
        //log("Is sound emitter prefab undefined: " + (this.soundEmitterPrefab == undefined));
        if(this.soundEmitterPool == null)
        {
            this.soundEmitterPool = new ObjectPool<SoundEmitter>(this.createSoundEmitter.bind(this), 
                                                                 this.gettingSoundEmitter.bind(this), 
                                                                 this.returnSoundEmitter.bind(this), 
                                                                 this.destroySoundEmitter.bind(this), 
                                                                 this.soundEmitterPoolSize);
        }
    }

    protected update(dt: number): void {
        //log("Active sound emitters: " + this.activeSoundEmitters.length);
    }

    protected onDestroy(): void 
    {
        this.soundEmitterPool.clear();
        SoundManager.instance = null;    
    }
}


