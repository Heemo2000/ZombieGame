import { _decorator, Component, Node, Collider, RigidBody, error, log, Enum } from 'cc';
import { PhysicsGroup } from './PhysicsGroup';
const { ccclass, property } = _decorator;

@ccclass('GroupSetter')
export class GroupSetter extends Component {
    @property({
        type: PhysicsGroup
    })
    private physicsGroup: PhysicsGroup = PhysicsGroup.DEFAULT;

    private collider: Collider = null;
    private rigidBody: RigidBody = null;

    start() {
        this.collider = this.getComponent(Collider);
        this.rigidBody = this.getComponent(RigidBody);

        if(this.collider == null)
        {
            error("No collider found, cannot set group");
            return;
        }

        let group = this.physicsGroup;

        if(this.rigidBody != null)
        {
            this.rigidBody.setGroup(group);
            //this.rigidBody.setMask(-1);
        }

        
        this.collider.setGroup(group);
        //this.collider.setMask(-1);
        
        log("Setting " + this.node.name + "'s group to " + group);
    }
}


