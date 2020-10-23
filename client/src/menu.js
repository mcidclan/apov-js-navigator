import React, { Component } from "react";
import './menu.scss';

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {viewSize: ''};
        this.onChangeViewSize = this.onChangeViewSize.bind(this);
        this.onClickViewSize = this.onClickViewSize.bind(this);
    }
    genSizes(value, index) {
        return <option key={index} value={value} />;
    }
    
    onChangeViewSize(event) {
        const filtered = event.target.value.replace(/[^0-9x]/g, '');
        this.setState({
                viewSize: filtered
        });
        if(this.props.sizes.indexOf(event.target.value) !== -1) {
            this.props.onViewSizeChange(event);
        }
    }
    
    onClickViewSize(event) {
        this.setState({
           viewSize: '' 
        });
    }
    
    render() {
        return <div className="menu">
            <input className="element"
                value={this.state.viewSize}
                onClick={this.onClickViewSize}
                onChange={this.onChangeViewSize}
                list="viewsize" placeholder="Change view size" />
            <datalist id="viewsize">{this.props.sizes.map(this.genSizes)}</datalist>
        </div>;
    }
}

export default Menu;
