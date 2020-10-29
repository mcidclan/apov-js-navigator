import React, { Component } from "react";
import './progress.scss';

class Progress extends Component {
    render() {
        const pStyle = {
            "width": `${this.props.progression}%`
        };
        
        return <div className="progress">
            <div style={pStyle}>
                {this.props.progression < 100 ? <span className="on"></span> :
                <span className="done"></span>}
            </div>
        </div>;
    }
}

export default Progress;
