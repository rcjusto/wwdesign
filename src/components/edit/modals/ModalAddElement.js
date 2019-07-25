import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "react-bootstrap/es/Modal";
import {render, unmountComponentAtNode} from 'react-dom';
import MainModel from "../../../models/Main";
import * as styles from "./ModalAddElement.styles";
import img_sphere from '../../../images/sphere.png';
import img_box from '../../../images/cube.png';
import img_cyl from '../../../images/cylinder.png';
import img_dots from '../../../images/points.png';

class ModalAddElement extends Component {

    constructor(props, context) {
        super(props, context);

        this.types = [
            {
                img: img_box,
                name: 'Box',
                type: MainModel.TYPE_BOX
            },
            {
                img: img_sphere,
                name: 'Sphere',
                type: MainModel.TYPE_SPHERE
            },
            {
                img: img_cyl,
                name: 'Cylinder',
                type: MainModel.TYPE_CYLINDER
            },
            {
                img: img_dots,
                name: 'Imported Object',
                type: MainModel.TYPE_JSON
            }
        ];

        this.state = {
            type: MainModel.TYPE_BOX,
            name: ''
        };
    }

    static propTypes = {
        onConfirm: PropTypes.func,
        onCancel: PropTypes.func
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.onClickConfirm();
    };

    onClickConfirm = () => {
        if (this.state.name.trim().length > 0) {
            if (this.props.onConfirm) {
                this.props.onConfirm(this.state.name, this.state.type);
            }
            this.close();
        }
    };

    onClickCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.close();
    };

    close = () => {
        removeElementReconfirm();
    };

    onChangeValue = (event) => {
        this.setState({name: event.target.value});
    };

    render() {
        return (<div>
            <Modal show={true} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Element</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={this.onSubmit}>
                        <h4>Select a type</h4>
                        <ul style={styles.UL}>
                            {this.types.map((el, ind) => {
                                return (<li key={ind} style={styles.LI}>
                                    <a className="no-underline" style={el.type === this.state.type ? styles.SELECTED : styles.UNSELECTED} href="/" onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({type: el.type})
                                    }}>
                                        <img src={el.img} alt=" " style={el.type === this.state.type ? styles.LI_IMG_SELECTED : styles.LI_IMG}/>
                                        <span style={styles.LI_SPAN}>{el.name}</span>
                                    </a>
                                </li>)
                            })}
                        </ul>

                        <h4>Select a name</h4>
                        <div>
                            <input ref={input => input && input.focus()} type="text" className="form-control" value={this.state.name} onChange={this.onChangeValue}/>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" disabled={this.state.name.trim().length<1} className="btn btn-primary" ref='confirm' onClick={this.onClickConfirm}>OK</button>
                    <button type="button" className="btn btn-default" onClick={this.onClickCancel}>Cancel</button>
                </Modal.Footer>
            </Modal></div>);
    }

}

function createElementReconfirm(properties) {
    const divTarget = document.createElement('div');
    divTarget.id = 'modal-add-folder';
    document.body.appendChild(divTarget);
    render(<ModalAddElement {...properties} />, divTarget);
}

function removeElementReconfirm() {
    const target = document.getElementById('modal-add-folder');
    setTimeout(() => {
        unmountComponentAtNode(target);
        target.parentNode.removeChild(target);
    });
}

export function modalAddElement(properties) {
    createElementReconfirm(properties);
}
