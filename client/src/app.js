import React, { useState } from 'react';
import Streamer from './streamer';
import View from './view';
import Menu from './menu';
import './app.scss';

function App() {
    const [viewSize, setViewSize] = useState('256x256');
    
    function handleViewSizeChange(event) {
        setViewSize(event.target.value);
    };
    
    return (
        <div className="app">
            <Menu sizes={['1280x720', '640x480', '256x256', '512x512']} 
                onViewSizeChange={handleViewSizeChange} />
            <Streamer>
                <View apovDisplaySize="2x2" size={viewSize} />
            </Streamer>
        </div>
    );
}

export default App;
