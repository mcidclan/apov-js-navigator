import React, { Component } from 'react';
import './streamer.scss';

export const Context = React.createContext({frame : []});

class Streamer extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            frame: [],
            size: 0
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
                
                this.frameWidth = this.SPACE_BLOCK_SIZE;
                this.frameHeight = this.SPACE_BLOCK_SIZE;
                
                this.FRAME_BYTES_COUNT = this.frameWidth * this.frameHeight * 4;
                this.SPACE_BYTES_COUNT = ((this.DEPTH_BLOCK_COUNT *
                this.SPACE_BLOCK_SIZE) / this.RAY_STEP) * this.FRAME_BYTES_COUNT;
            });
    }
    
    getOffset(move, hrotate, vrotate) {
        return this.FRAME_BYTES_COUNT * move + (hrotate *
            this.VERTICAL_POV_COUNT + vrotate) * this.SPACE_BYTES_COUNT;
    }
    
    gaugeCache() {
        const d = this.HORIZONTAL_POV_COUNT * this.VERTICAL_POV_COUNT;
        return Math.floor(100 * (this._hrotate + this._vrotate * this.HORIZONTAL_POV_COUNT) / d);
    }
        
    resetGauge(reset = false) {
        if(this._hrotate === undefined || reset) { this._hrotate = 0; }
        if(this._vrotate === undefined || reset) { this._vrotate = 0; }
        if(reset) {
            this.fillUpCache();
        }
    }
    
    fillUpCache() {
        clearTimeout(this.fcid);
        this.resetGauge();
        const offset = this.getOffset(0, this._hrotate, this._vrotate);
        const url = `/frame/${offset}/${this.SPACE_BLOCK_SIZE}`;
        caches.open('apov_frames').then(cache => {
            cache.match(url).then(res => {
                if(res === undefined) {
                    return fetch(url).then(data => cache.put(url, data));
                }
                return res;
            }).then(() => {
                const progression = this.gaugeCache();
                if(progression < 100) {
                    this._hrotate = (this._hrotate + 1) % this.HORIZONTAL_POV_COUNT;
                    if(!this._hrotate) {
                        this._vrotate++;
                    }
                    this.fcid = setTimeout(() => {
                        this.fillUpCache();
                    }, 10);
                }
                this.props.onFillUp(progression);
            })
        });
    }
    
    getFrame(offset) {
        const url = `/frame/${offset}/${this.SPACE_BLOCK_SIZE}`;
        return caches.open('apov_frames').then(cache => {
            return cache.match(url).then(res => {
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
            .then(data => this.setState({
                frame: new Uint8Array(data),
                size: this.SPACE_BLOCK_SIZE
            }))
        });
    }
    
    // Todo, move
    rotate(obj, max, started = false) {
        clearTimeout(this.lrid);
        const key = Object.keys(obj)[0];        
        if(key in {hrotate:'', vrotate:''}) {
            const value = Object.values(obj)[0];
            this[key] += value;
            if(this[key] >= max) {
                this[key] = 0;
            } else if(this[key] < 0) {
                this[key] = max - 1;
            }
            this.getFrame(this.getOffset(0, this.hrotate, this.vrotate)).then(() => {
                if(started) {
                    this.lrid = setTimeout(() => {
                        this._rotate(obj, max);
                    }, 500);
                } else {
                    this.lrid = setTimeout(() => {
                        this._rotate(obj, max);
                    }, 1000/30);
                }
            });
        }
    }
    
    content() {
        if(this.SPACE_BLOCK_SIZE !== undefined) {
            const vr = (v) => {
                this._rotate = this.rotate;
                this.rotate({vrotate:v}, this.VERTICAL_POV_COUNT, true);
            };
            const hr = (v) => {
                this._rotate = this.rotate;
                this.rotate({hrotate:v}, this.HORIZONTAL_POV_COUNT, true);
            };
            const sr = () => {
                this._rotate = () => {
                    clearTimeout(this.lrid);
                };
            };
            
            return  <div className="control">
                        <div><span
                                onMouseLeave={e => {sr()}}
                                onMouseEnter={e => {vr(-1)}}/></div>
                        <div><span 
                                onMouseLeave={e => {sr()}}
                                onMouseEnter={e => {hr(1)}}/
                            ><span
                                onMouseLeave={e => {sr()}}
                                onMouseEnter={e => {hr(-1)}}/></div>
                        <div><span
                                onMouseLeave={e => {sr()}}
                                onMouseEnter={e => {vr(1)}}/></div>
                    </div>;
        }
        return <div></div>;
    }
    
    render() {
        const component = this.state.size !== 0 ?
                <Context.Provider value={this.state}>
                    {this.content()}{this.props.children}
                </Context.Provider> : <div></div>;
        return  component;
    }
    
    componentDidMount() {
        this.getOptions().then(() => {
            this.getFrame(this.getOffset(0/*m*/, 0/*h*/, 0/*v*/));
            this.fillUpCache();
        });
    }
}

export default Streamer;
