import React, {Component} from 'react';
import './view.scss';

class View extends Component {
    constructor(props) {
        super(props);
        this.state = {time: 0};
        this.canvas = React.createRef();
    }
    
    render() {
        const size = this.props.size.split('x');
        return <canvas ref={this.canvas} className="view" width={size[0]}
            height={size[1]}></canvas>;
    }
    
    componentDidMount() {
        this.gl = this.canvas.current.getContext('webgl');
        if(!this.gl) {
           throw new Error('Can\'t initialize webgl.');
        }
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.timer = setInterval(() => {
            this.setState((state, props) => ({ time: Date.now() }));
        }, 1);
    }
    
    componentDidUpdate() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    
    componentWillUnmount() {
        clearInterval(this.timer);
    }
}

export default View;