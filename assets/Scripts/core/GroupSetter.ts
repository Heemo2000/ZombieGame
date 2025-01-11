import { _decorator, Component, Node, Collider, RigidBody, error, log, Enum } from 'cc';
import { PhysicsGroup } from './PhysicsGroup';
const { ccclass, property } = _decorator;

@ccclass('GroupSetter')
export class GroupSetter extends Component {
    @property({
        type: Enum(PhysicsGroup)
    })
    private physicsGroup: PhysicsGroup = PhysicsGroup.DEFAULT;

    private collider: Collider = null;

    start() {
        this.collider = this.getComponent(Collider);
        if(this.collider == null)
        {
            error("No collider found, cannot set group");
            return;
        }

        let group = this.physicsGroup;
        this.collider.setGroup(group);
        this.collider.setMask(group);
        
        log("Setting " + this.node.name + "'s group to " + group);
    }
}


