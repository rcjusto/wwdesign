import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "react-bootstrap/es/Modal";
import {render, unmountComponentAtNode} from 'react-dom';

class ModalMessage extends Component {

    static propTypes = {
        onConfirm: PropTypes.func,
        onCancel: PropTypes.func
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.onClickConfirm();
    };

    onClickConfirm = () => {
        if (this.props.onConfirm) {
            this.props.onConfirm();
        }
        this.close();
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

    render() {
        return (<div>
            <Modal show={true} onHide={this.close}>
                {this.props.title &&
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                }
                <Modal.Body>
                    <h4 className="text-center">{this.props.message}</h4>
                </Modal.Body>
                {this.props.buttons &&
                <Modal.Footer>
                    <button type="button" className="btn btn-primary" ref='confirm' onClick={this.onClickConfirm}>OK</button>
                    {this.props.buttons.cancel &&
                    <button type="button" className="btn btn-default" onClick={this.onClickCancel}>Cancel</button>
                    }
                </Modal.Footer>
                }
            </Modal></div>);
    }

}

function createElementReconfirm(properties) {
    const divTarget = document.createElement('div');
    divTarget.id = 'modal-message';
    document.body.appendChild(divTarget);
    render(<ModalMessage {...properties} />, divTarget);
}

function removeElementReconfirm() {
    const target = document.getElementById('modal-message');
    setTimeout(() => {
        unmountComponentAtNode(target);
        target.parentNode.removeChild(target);
    });
}

export function modalMessage(properties) {
    createElementReconfirm(properties);
}
