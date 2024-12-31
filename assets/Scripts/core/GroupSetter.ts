import { _decorator, Component, Node, Collider, RigidBody, error, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GroupSetter')
export class GroupSetter extends Component {
    @property
    private groupNumber: number = 0;

    private collider: Collider = null;

    start() {
        this.collider = this.getComponent(Collider);
        if(this.collider == null)
        {
            error("No collider found, cannot set group");
            return;
        }

        let group = 1 << this.groupNumber;
        this.collider.setGroup(group);
        this.collider.setMask(group);
        
        log("Setting " + this.node.name + "'s group to " + group);
    }
}


