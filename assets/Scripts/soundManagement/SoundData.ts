import { _decorator, AudioClip, CCFloat, Enum } from 'cc';
import { SoundType } from './SoundType';
const { ccclass, property } = _decorator;

@ccclass('SoundData')
export class SoundData {

    @property
    ({
        type: Enum(SoundType)
    })
    public soundType: SoundType = SoundType.MUSIC;
    
    @property
    ({
        type: AudioClip
    })
    public clip: AudioClip = null;

    @property
    public loop: boolean = false;

    @property
    public playOnAwake: boolean = false;

    @property
    ({
        type: CCFloat,
        range: [0.0, 1.0],
        slide: true    
    })
    public volume: number = 1.0;
}


