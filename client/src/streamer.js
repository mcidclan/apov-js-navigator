import React, { Component } from 'react';
import './streamer.scss';

export const Context = React.createContext({frame : []});

class Streamer extends Component {
    
    constructor(props) {
        super(props);
        this.frameWidth = +this.props.frameSize.split('x')[0];
        this.frameHeight = +this.props.frameSize.split('x')[1];
        this.size = this.frameWidth;
        
        this.state = {
            frame: [],
            offset: 0
        };
        
        this.hrotate = 0;
        this.vrotate = 0;
        
        // Todo, set options via the ui
        this.VERTICAL_POV_COUNT = 12;
        this.HORIZONTAL_POV_COUNT = 12;
        this.DEPTH_BLOCK_COUNT = 1;
        this.SPACE_BLOCK_SIZE = 256;
        this.RAY_STEP = 256;
        this.FRAME_BYTES_COUNT = this.frameWidth * this.frameHeight * 4;
        this.SPACE_BYTES_COUNT = ((this.DEPTH_BLOCK_COUNT *
            this.SPACE_BLOCK_SIZE) / this.RAY_STEP) * this.FRAME_BYTES_COUNT;
    }
    
    getOffset(move, hrotate, vrotate) {
        return this.FRAME_BYTES_COUNT * move + (hrotate *
            this.VERTICAL_POV_COUNT + vrotate) * this.SPACE_BYTES_COUNT;
    }
    
    getFrame(offset) {
        const url = `/frame/${offset}/${this.size}`;
        return caches.open('apov_frames').then(cache => {
            
            cache.match(url).then(res => {
                if(res === undefined) {
                    return fetch(url)
                        .then(data => {
                            const clone = data.clone();
                            return cache.put(url, data).then(() => clone);
                        });
                }
                return res;
            })

            .then(data => data.arrayBuffer())
            .then(data => this.setState({frame: new Uint8Array(data)}))
        });
    }


    // Todo, move    
    rotate(obj, max) {
        console.log(obj, max, "<<");
        
        const key = Object.keys(obj)[0];        
        if(key in {hrotate:'', vrotate:''}) {
            const value = Object.values(obj)[0];
            this[key] += value;
            if(this[key] >= max) {
                this[key] = 0;
            } else if(this[key] < 0) {
                this[key] = max - 1;
            }
            this.getFrame(this.getOffset(0, this.hrotate, this.vrotate));
        }
    }
    
    content() {
        return  <div className="control">
                    <div><span onMouseUp={e => {
                        this.rotate({hrotate:1}, this.HORIZONTAL_POV_COUNT);
                    }}/></div>
                    <div><span/><span/></div>
                    <div><span onMouseUp={e => {
                        this.rotate({hrotate:-1}, this.HORIZONTAL_POV_COUNT);
                    }}/></div>
                </div>;
    }
    
    render() {
        return  <Context.Provider value={this.state.frame}>
                    {this.content()}{this.props.children}
                </Context.Provider>;
    }
    
    componentDidMount() {
        this.getFrame(this.getOffset(0/*m*/, 0/*h*/, 0/*v*/));
    }
}

export default Streamer;
