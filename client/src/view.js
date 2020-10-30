import React, {PureComponent} from 'react';
import { Context } from "./streamer";
import mat4 from 'gl-mat4'
import './view.scss';

const ENV_FRAGMENT_SHADER = 
`   #version 300 es
    precision middlep float;
    out vec4 f_color;
    void main() {
        f_color = vec4(0.5, 0.5, 0.5, 1.0);
    }
`

const ENV_VERTEX_SHADER = 
`   #version 300 es
    precision middlep float;
    layout(location = 0) in vec3 position;
    gl_Position = vec4(position, 1.0);
`

const FRAGMENT_SHADER_SINGLE_QUAD = 
`   #version 300 es
    precision highp float;
    uniform vec2 vsize;
    uniform sampler2D frame;
    out vec4 f_color;
    void main() {
        float d = 0.0;
        float u = gl_FragCoord.xy.x / vsize.y;
        float v = gl_FragCoord.xy.y / vsize.y;
        if(vsize.x > vsize.y) {
            d = 1.0 / vsize.y;
            d *= (vsize.x - vsize.y) / 2.0;
        }
        vec4 color = texture(frame, vec2(u - d, v));
        f_color = vec4(color.r, color.g, color.b, 1.0);
    }
`;

const FRAGMENT_SHADER = 
`   #version 300 es
    precision highp float;
    uniform float twidth;
    uniform sampler2D frame;
    in float v_index;
    out vec4 f_color;
    void main() {
        float f = 1.0/twidth;
        float index = floor(v_index / 6.0);
        float u = f * mod(index, twidth);
        float v = f * (index/twidth);
        vec4 bytes = texture(frame, vec2(u, v));
        f_color = vec4(bytes.r, bytes.g, bytes.b, 1.0);
        //gl_FragDepth = bytes.a;
    }
`;

const VERTEX_SHADER = 
`   #version 300 es
    precision highp float;
    layout(location = 0) in vec3 position;
    uniform mat4 projection;
    uniform mat4 model;
    out float v_index;
    in vec4 f_color;
    void main() {
        v_index = float(gl_VertexID);
        vec4 pos = vec4(position.y, -position.x, 0.0, 1.0);
        gl_Position = projection * model * pos;
    }
`;

class View extends PureComponent {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.state = {
            mounted: false
        };
        
        // Todo, available option from the ui
        this.useSingleQuad = true;
    }
    
    initShaders(gl, vertexShader, fragmentShader) {
        const vshader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vshader, vertexShader);
        gl.compileShader(vshader);
        if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
            console.log('Can\'t compile vertex shader.',
            gl.getShaderInfoLog(vshader));
            gl.deleteShader(vshader);
        }
        const fshader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fshader, fragmentShader);
        gl.compileShader(fshader);
        
        if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
            console.log('Can\'t compile fragment shader.', 
            gl.getShaderInfoLog(fshader));
            gl.deleteShader(fshader);
        }
        
        const program = gl.createProgram();
        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('Can\'t link shader program.', 
            gl.getProgramInfoLog(program));
        }
        
        return program;
    }
     
    initApovShaders(gl) {
        const frag = this.useSingleQuad ? FRAGMENT_SHADER_SINGLE_QUAD : FRAGMENT_SHADER;
        this.program = this.initShaders(gl, VERTEX_SHADER, frag);
        gl.useProgram(this.program);
    }
    
    initEnvShaders(gl) {
        //this.initShaders(gl, ENV_VERTEX_SHADER, ENV_FRAGMENT_SHADER);
    }
    
    updateApovTexture(gl, buffer) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        this.displayWidth, this.displayHeight, 0, gl.RGBA,
        gl.UNSIGNED_BYTE, buffer);
    }
    
    initApovTexture(gl) {
        this.texture = gl.createTexture();
        const buff = new Uint8Array(this.atomCount*4).fill(0x00);

        this.updateApovTexture(gl, buff);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(gl.getUniformLocation(this.program, "frame"), 0);
        
        if(this.useSingleQuad) {
            const vsize = [this.width, this.height];
            gl.uniform2fv(gl.getUniformLocation(this.program, 'vsize'), vsize);
        } else gl.uniform1f(gl.getUniformLocation(this.program, 'twidth'), this.displayWidth);
    }
    
    initApovDisplay(gl) {
        let display = [];
        const DISPLAY_HALF_WIDTH = this.displayWidth / 2;
        const DISPLAY_HALF_HEIGHT = this.displayHeight / 2;
        
        if(this.useSingleQuad) {
            const DHW = DISPLAY_HALF_WIDTH;
            const DHH = DISPLAY_HALF_HEIGHT;
            display = [
                DHW, DHH, 0.0,
                -DHW, DHH, 0.0,
                DHW, -DHH, 0.0,
                -DHW, DHH, 0.0,    
                -DHW, -DHH, 0.0,
                DHW, -DHH, 0.0,
            ];
        } else {
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
        }
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(display),
        gl.STATIC_DRAW);

        const position = 0;
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

    updateUniforms(gl) {
        if(this.useSingleQuad) {
            const vsize = [this.width, this.height];
            gl.uniform2fv(gl.getUniformLocation(this.program, 'vsize'), vsize);
        }
    }
    
    initModelView(gl) {
        const model = mat4.create();
        mat4.translate(model, model, [0.0, 0.0, -1.0]);
        mat4.scale(model, model, [
            1.0 / this.displayWidth,
            1.0 / this.displayHeight, 1.0
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
    
    initApovContext(gl, size) {
        this.displayWidth = size;
        this.displayHeight = size;
        this.atomCount = this.displayHeight*this.displayWidth;
    
        this.initApovShaders(gl);
        this.initApovTexture(gl);
        this.initApovDisplay(gl);
        this.initWebglContext(gl);
        this.draw();
    }
    
    setFrame(gl, frame) {
        if(frame instanceof Uint8Array &&
            frame.length > 0 && this.texture !== undefined) {
            this.updateApovTexture(gl, frame);
        }
    }
    
    render() {
        console.log("View render called.");
        const size = this.props.size.split('x');
        this.width = size[0];
        this.height = size[1];
        /*const cStyle = {
            "maxHeight": `${this.height}px`
        };
        style={cStyle}*/
        return  <div className="view">
                    <canvas ref={this.canvas}
                        width={this.width} height={this.height}>
                            {this.state.mounted ? <Context.Consumer>{
                                value => {
                                if(this.dlid === undefined) {
                                    this.initApovContext(this.gl, value.size);
                                }
                                this.setFrame(this.gl, value.frame);
                            }}</Context.Consumer> : ''}
                    </canvas>
                </div>;
    }
    
    draw() {
        const count = 6 * (this.useSingleQuad ? 1 : this.atomCount);
        clearTimeout(this.dlid);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, count);
        this.dlid = setTimeout(() => {
            this.draw();
        }, 1000/30);
    }
    
    componentDidMount() {
        this.gl = this.canvas.current.getContext('webgl2');
        if(!this.gl) {
           throw new Error('Can\'t initialize webgl2.');
        }
        this.setState({
            mounted: true
        });
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.size !== this.props.size) {
            this.initProjection(this.gl, true);
            this.updateUniforms(this.gl);
        }
    }
    
    componentWillUnmount() {
        clearTimeout(this.dlid);
    }
}

export default View;
