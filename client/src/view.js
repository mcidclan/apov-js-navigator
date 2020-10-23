import React, {Component} from 'react';
import mat4 from 'gl-mat4'
import './view.scss';

const FRAGMENT_SHADER = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

const VERTEX_SHADER = `
    //gl_VertexID;
    attribute vec4 position;
    uniform mat4 projection;
    uniform mat4 model;
    void main() {
        gl_Position = projection * model * position;
    }
`;

class View extends Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        
        const displaySizes = this.props.apovDisplaySize.split('x');
        this.displayWidth = displaySizes[0];
        this.displayHeight = displaySizes[1];
        this.atomCount = this.displayHeight*this.displayWidth*6;
    }
    
    initApovShaders(gl) {
        const vshader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vshader, VERTEX_SHADER);
        gl.compileShader(vshader);
        if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
            console.log('Can\'t compile vertex shader.',
            gl.getShaderInfoLog(vshader));
            gl.deleteShader(vshader);
        }
        const fshader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fshader, FRAGMENT_SHADER);
        gl.compileShader(fshader);
        
        if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
            gl.deleteShader(fshader);
            throw new Error('Can\'t comile fragment shader.');
        }
        const program = gl.createProgram();
        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Can\'t link shader program.');
        }
        gl.useProgram(program);
        this.program = program;
    }
    
    initApovDisplay(gl) {
        let display = [];
        const DISPLAY_HALF_WIDTH = this.displayWidth / 2;
        const DISPLAY_HALF_HEIGHT = this.displayHeight / 2;
        let offset = 0;
        let i = -DISPLAY_HALF_WIDTH;
        while(i < DISPLAY_HALF_WIDTH) {
            let j = -DISPLAY_HALF_HEIGHT;
            while(j < DISPLAY_HALF_HEIGHT) {
                display[offset + 0] = i+1.0;
                display[offset + 1] = j+1.0;
                display[offset + 2] = 0.0;
                display[offset + 3] = i;
                display[offset + 4] = j+1.0;
                display[offset + 5] = 0.0;
                display[offset + 6] = i+1.0;
                display[offset + 7] = j;
                display[offset + 8] = 0.0;
                display[offset + 9] = i;
                display[offset + 10] = j+1.0;
                display[offset + 11] = 0.0;
                display[offset + 12] = i;
                display[offset + 13] = j;
                display[offset + 14] = 0.0;
                display[offset + 15] = i+1.0;
                display[offset + 16] = j;
                display[offset + 17] = 0.0;
                offset += 18;
                j++;
            }
            i++;
        }

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(display),
        gl.STATIC_DRAW);

        const position = gl.getAttribLocation(this.program, 'position');
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(position);
        
        console.log('Display builded with ', this.displayWidth,
        'atoms in width and ', this.displayHeight, 'atoms in height.');
    }
    
    initProjection(gl) {
        gl.viewport(0, 0, this.width, this.height);
        
        const projection = mat4.create();
        mat4.perspective(projection, 53.0 * Math.PI / 180.0,
        this.width / this.height, 0.1, 100.0);
        gl.uniformMatrix4fv(gl.getUniformLocation(
        this.program, 'projection'), false, projection);
    }
    
    initModelView(gl) {
        const model = mat4.create();
        mat4.translate(model, model, [0.0, 0.0, -1.0]);
        mat4.scale(model, model, [
            1.0 / this.displayWidth,
            1.0 / this.displayHeight, 0.0
        ]);
        gl.uniformMatrix4fv(gl.getUniformLocation(
        this.program, 'model'), false, model);
    }
    
    initWebglContext(gl) {
        gl.clearDepth(1.0);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.initProjection(gl);
        this.initModelView(gl);
    }
    
    render() {
        const size = this.props.size.split('x');
        this.width = size[0];
        this.height = size[1];
        return <canvas ref={this.canvas} className="view" width={this.width}
            height={this.height}></canvas>;
    }
    
    draw() {
        clearTimeout(this.timer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.atomCount);
        this.timer = setTimeout(() => {
            this.draw();
        }, 1000/30);
    }
    
    componentDidMount() {
        this.gl = this.canvas.current.getContext('webgl');
        if(!this.gl) {
           throw new Error('Can\'t initialize webgl.');
        }
        this.initApovShaders(this.gl);
        this.initApovDisplay(this.gl);
        this.initWebglContext(this.gl);
        this.draw();
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.size !== this.props.size) {
            this.initProjection(this.gl, true);
        }
    }
    
    componentWillUnmount() {
        clearTimeout(this.timer);
    }
}

export default View;