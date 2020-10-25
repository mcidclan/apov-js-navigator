import React, { Component } from 'react';
import './streamer.scss';

export const Context = React.createContext({frame : []});

class Streamer extends Component {
    
    constructor(props) {
        super(props);
        this.size = +this.props.frameSize.split('x')[0];
        this.state = {
            frame: []
        };
    }
    
    retrieveFrame(offset) {
        fetch(`/frame/0/${this.size}`)
            .then(data => data.arrayBuffer())
            .then(data => this.setState({frame:new Uint8Array(data)}));
    }
    
    render() {
        return  <Context.Provider value={this.state}>
                    <div>Controls</div>
                    {this.props.children}
                </Context.Provider>;
    }
    
    componentDidMount() {
        this.retrieveFrame(0);
    }
}

export default Streamer;
