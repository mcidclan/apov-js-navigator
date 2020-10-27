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
    }
                
    getOptions() {   
        return fetch('/header')
            .then(data => data.arrayBuffer())
            .then(data => {
                const header = new Uint32Array(data);
                this.SPACE_BLOCK_SIZE = header[0];
                this.HORIZONTAL_POV_COUNT = header[1];
                this.VERTICAL_POV_COUNT = header[2];
                this.RAY_STEP = header[3];
                this.WIDTH_BLOCK_COUNT = header[4]
                this.DEPTH_BLOCK_COUNT = header[5];
                this.FRAME_BYTES_COUNT = this.frameWidth * this.frameHeight * 4;
                this.SPACE_BYTES_COUNT = ((this.DEPTH_BLOCK_COUNT *
                this.SPACE_BLOCK_SIZE) / this.RAY_STEP) * this.FRAME_BYTES_COUNT;
                this.setState({optionUpdated: true});
            });
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

    stopRotation() {
        clearTimeout(this.lrid);
        clearTimeout(this.srid);
    }

    loopRotation(obj, max) {
        clearTimeout(this.lrid);
        this.rotate(obj, max, false);
        this.lrid = setTimeout(() => {
            this.loopRotation(obj, max);
        }, 1000/30);
    }
    // Todo, move
    rotate(obj, max, started = true) {
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
        
        if(started) {
            this.srid = setTimeout(() => {
                this.loopRotation(obj, max);
                clearTimeout(this.srid);
            }, 1000);
        }
    }
    
    content() {
        if(this.SPACE_BLOCK_SIZE !== undefined) {
            return  <div className="control" onMouseUp={e => {this.stopRotation()}}>
                        <div><span onMouseDown={e => {
                            this.rotate({vrotate:-1}, this.VERTICAL_POV_COUNT);
                        }}/></div>
                        <div><span onMouseDown={e => {
                            this.rotate({hrotate:1}, this.HORIZONTAL_POV_COUNT);
                        }}/><span onMouseDown={e => {
                            this.rotate({hrotate:-1}, this.HORIZONTAL_POV_COUNT);
                        }}/></div>
                        <div><span onMouseDown={e => {
                            this.rotate({vrotate:1}, this.VERTICAL_POV_COUNT);
                        }}/></div>
                    </div>;
        }
        return <div></div>;
    }
    
    render() {
        return  <Context.Provider value={this.state.frame}>
                    {this.content()}{this.props.children}
                </Context.Provider>;
    }
    
    componentDidMount() {
        this.getOptions().then(() => {
            this.getFrame(this.getOffset(0/*m*/, 0/*h*/, 0/*v*/));
        });
    }
}

export default Streamer;
