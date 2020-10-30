import React, { useState, useRef } from 'react';
import Streamer from './streamer';
import View from './view';
import Menu from './menu';
import './app.scss';

function App() {
    const [progression, setProgression] = useState(0);
    const [viewSize, setViewSize] = useState('256x256');
    const streamer = useRef();
    
    function handleViewResize(event) {
        setViewSize(event.target.value);
    };
    
    function onFillUp(value) {
        setProgression(value);
    }
    
    return (
        <div className="app">
            <Menu sizes={['1280x720', '640x480', '256x256', '512x512']} 
                onViewResize={handleViewResize}
                onClearCache={(e)=>streamer.current.resetGauge(true)}
                progression={progression}/>
            <Streamer ref={streamer} onFillUp={onFillUp}>
                <View size={viewSize} />
            </Streamer>
        </div>
    );
}

export default App;
