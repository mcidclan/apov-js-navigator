import React, {Component} from 'react';
import './view.scss';

const atom = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, 1.0, 0.0,    
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
}

class View extends Component {
    constructor(props) {
        super(props);
        this.state = {time: 0};
        this.canvas = React.createRef();
    }
    
    buildApovShaders() {
        //in int gl_VertexID;
    }
    
    buildApovDisplay() {
        const display = [];
        const DISPLAY_HALF_WIDTH = this.width / 2;
        const DISPLAY_HALF_HEIGHT = this.height / 2;
        let i = -DISPLAY_HALF_WIDTH;
        while(i < DISPLAY_HALF_WIDTH) {
            let j = -DISPLAY_HALF_HEIGHT;
            while(j < DISPLAY_HALF_HEIGHT) {
                const atom = {
                    i+1.0, j+1.0, 0.0,
                    i,     j+1.0, 0.0,
                    i+1.0, j,     0.0,
                    i,     j+1.0, 0.0,
                    i,     j,     0.0,
                    i+1.0, j,     0.0,
                };
                display = this.display.concat(atom);
                j++;
            }
            i++;
        }

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.display),
        this.gl.STATIC_DRAW);
        
        const position = this.gl.getAttribLocation(program, 'position');
        this.gl.vertexAttribPointer(position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(position);

        console.log('Display builded with ', this.width,
        'atoms in width and ', this.height, 'atoms in height.');
    }
    
    render() {
        const size = this.props.size.split('x');
        this.width = size[0];
        this.height = size[1];
        return <canvas ref={this.canvas} className="view" width={this.width}
            height={this.height}></canvas>;
    }
    
    componentDidMount() {
        this.gl = this.canvas.current.getContext('webgl');
        if(!this.gl) {
           throw new Error('Can\'t initialize webgl.');
        }
        this.buildApovShaders();
        this.buildApovDisplay();
        this.gl.clearDepth(1.0);
        this.gl.depthFunc(gl.LEQUAL);
        this.gl.enable(gl.DEPTH_TEST);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.timer = setInterval(() => {
            this.setState((state, props) => ({ time: Date.now() }));
        }, 1000/30);
    }
    
    componentDidUpdate() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, this.width*this.height*6);
    }
    
    componentWillUnmount() {
        clearInterval(this.timer);
    }
}

export default View;