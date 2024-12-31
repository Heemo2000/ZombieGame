import { _decorator, Camera, Component, GeometryRenderer, Node, Vec3, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VisualDebug')
export class VisualDebug extends Component {

    private camera: Camera = null;
    private geometryRenderer: GeometryRenderer = null;

    private static instance: VisualDebug = null;

    public static getInstance() : VisualDebug
    {
        return this.instance;
    }
    
    public drawSphere(position: Vec3, radius: number,color: Color,  ) : void
    {
        this.geometryRenderer.addSphere(position, radius, color, 4, 4, true, true, true, false);
    }
    start() {
        if(VisualDebug.instance != null)
        {
            this.destroy();
            return;
        }
        VisualDebug.instance = this;
        this.camera = this.getComponent(Camera);
        this.camera.camera.initGeometryRenderer();
        this.geometryRenderer = this.camera.camera.geometryRenderer;
    }
}


