import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "react-bootstrap/es/Modal";
import {render, unmountComponentAtNode} from 'react-dom';

class ModalExportMesh extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
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
                this.props.onConfirm(this.state.name);
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
                    <Modal.Title>Export Model</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={this.onSubmit}>
                        <h4>Select a model name</h4>
                        <div>
                            <input ref={input => input && input.focus()} type="text" className="form-control" value={this.state.name} onChange={this.onChangeValue}/>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" disabled={this.state.name.trim().length<1}  className="btn btn-primary" ref='confirm' onClick={this.onClickConfirm}>OK</button>
                    <button type="button" className="btn btn-default" onClick={this.onClickCancel}>Cancel</button>
                </Modal.Footer>
            </Modal></div>);
    }

}

function createElementReconfirm(properties) {
    const divTarget = document.createElement('div');
    divTarget.id = 'modal-exp-mesh';
    document.body.appendChild(divTarget);
    render(<ModalExportMesh {...properties} />, divTarget);
}

function removeElementReconfirm() {
    const target = document.getElementById('modal-exp-mesh');
    setTimeout(() => {
        unmountComponentAtNode(target);
        target.parentNode.removeChild(target);
    });
}

export function modalExportMesh(properties) {
    createElementReconfirm(properties);
}
