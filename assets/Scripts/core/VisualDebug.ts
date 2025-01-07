import { _decorator, Camera, Component, GeometryRenderer, Node, Vec3, Color, geometry, log } from 'cc';
import { MathUtility } from '../utilities/MathUtility';
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
    
    public drawWireSphere(position: Vec3, radius: number,color: Color) : void
    {
        //this.geometryRenderer.reset();
        this.geometryRenderer.addSphere(position, radius, color, 4, 4, true, false, true, false);
    }

    public drawWireCube(position: Vec3, size: Vec3, color: Color): void
    {
        //log("Drawing wire cube");
        //this.geometryRenderer.reset();
        let dimensions = MathUtility.getBoundingBoxDimensions(position, size.multiplyScalar(0.5).clone());
        this.geometryRenderer.addBoundingBox(dimensions, color, true, true, true, false);
    }

    public drawLine(start: Vec3, end: Vec3, color: Color): void
    {
        //this.geometryRenderer.reset();
        this.geometryRenderer.addLine(start, end, color, true);
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


