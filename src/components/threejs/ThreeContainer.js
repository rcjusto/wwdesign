import React, { Component } from 'react';
import threeEntryPoint from './threeEntryPoint';

export default class ThreeContainer extends Component {

    onElementClicked = (data) => {
        this.props.onElementClicked(data);
    };

    componentDidMount() {
        this.three = threeEntryPoint(this.threeRootElement, this.onElementClicked);
        this.three.updateData(this.props.data)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.three.updateData(this.props.data);
    }

    getSnapShot() {
        return this.three.getSnapShot();
    }

    getCameraAxis() {
        return this.three.getCameraAxis();
    }

    sceneToJSON() {
        return this.three.sceneToJSON();
    }

    render () {
        return (
            <div style={{height: '100%'}} ref={element => this.threeRootElement = element} />
        );
    }

}