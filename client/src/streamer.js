import React, { Component } from 'react';
import './streamer.scss';

export const Context = React.createContext({frame : []});

class Streamer extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            frame: []
        };
    }
    
    render() {
        return  <Context.Provider value={this.state}>
                    <div>Controls</div>
                    {this.props.children}
                </Context.Provider>;
    }
    
    componentDidMount() {
        fetch('/frame/0/32')
            .then(data => data.arrayBuffer())
            .then(data => this.setState({frame:new Uint8Array(data)}));
    }
}

export default Streamer;
