import React, { useState } from 'react';
import View from './view';
import Menu from './menu';
import './app.scss';

function App() {
    const [viewSize, setViewSize] = useState('640x480');
    
    function handleViewSizeChange(event) {
        setViewSize(event.target.value);
    };
    
    return (
        <div className="app">
            <Menu sizes={['1280x720', '640x480', '256x256', '512x512']} 
                onViewSizeChange={handleViewSizeChange} />
            <View size={viewSize} />
        </div>
    );
}

export default App;
