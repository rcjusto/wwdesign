import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from "react-bootstrap/es/Modal";
import {render, unmountComponentAtNode} from 'react-dom';

class ModalEditPage extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            name: '',
            desc: ''
        };
        this.onChangeValue = this.onChangeValue.bind(this);
    }

    static propTypes = {
        onConfirm: PropTypes.func,
        onCancel: PropTypes.func
    };

    componentDidMount() {
        console.log('componentDidMount');
        this.setState({
            name: this.props.name,
            desc: this.props.desc
        })
    }

    componentWillUpdate(nextProps) {
        console.log('componentWillUpdate');
        if (nextProps.name !== this.props.name || nextProps.desc !== this.props.desc) {
            this.setState({
                name: nextProps.name,
                desc: nextProps.desc
            })
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.onClickConfirm();
    };

    onClickConfirm = () => {
        if (this.state.name.trim().length > 0) {
            if (this.props.onConfirm) {
                this.props.onConfirm({
                    name: this.state.name,
                    desc: this.state.desc
                });
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
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({[name]: value});
    };

    render() {
        return (<div>
            <Modal show={true} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Page Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={this.onSubmit}>
                        <h4>Name</h4>
                        <div>
                            <input name="name" type="text" className="form-control" value={this.state.name} onChange={this.onChangeValue}/>
                        </div>
                        <br/>
                        <h4>Description</h4>
                        <div>
                            <textarea name="desc" className="form-control" value={this.state.desc} onChange={this.onChangeValue}/>
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
    divTarget.id = 'modal-edit-page';
    document.body.appendChild(divTarget);
    render(<ModalEditPage {...properties} />, divTarget);
}

function removeElementReconfirm() {
    const target = document.getElementById('modal-edit-page');
    setTimeout(() => {
        unmountComponentAtNode(target);
        target.parentNode.removeChild(target);
    });
}

export function modalEditPage(properties) {
    createElementReconfirm(properties);
}
