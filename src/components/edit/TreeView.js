import React, {Component} from 'react';
import MainModel from "../../models/Main";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as styles from "./TreeView.styles";
import {faCircle, faSquare, faClone} from "@fortawesome/fontawesome-free-regular/index.es";
import {faBan, faCompress, faCopy, faExpand, faEye, faFolder, faFolderOpen, faPaste, faPlusCircle, faPlusSquare, faTrash} from "@fortawesome/fontawesome-free-solid/index.es";
import {DropdownButton, MenuItem} from "react-bootstrap";
import {modalAddFolder} from "./modals/ModalAddFolder";
import {modalAddElement} from "./modals/ModalAddElement";
import Utils from "../../services/Utils";

export default class TreeView extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            collapsed: {}
        };
        this.dragging = false;
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.clipboardEmpty = this.clipboardEmpty.bind(this);
        this.collapseAll = this.collapseAll.bind(this);
    }

    componentDidMount() {

    }

    toggleCollapse = (node) => {
        const {collapsed} = this.state;
        collapsed[node.id] = !collapsed[node.id];
        this.setState({collapsed});
    };

    collapseAll = () => {
        const collapsed = {};
        const {model} = this.props;
        model.tree.forEach((n) => {
            collapsed[n.id] = true;
        });
        this.setState({collapsed});
    };

    toggleVisible = (node) => {
        const {model} = this.props;
        model.toggleVisible(node.id);
    };

    isNodeSelected = (node) => {
        const {model} = this.props;
        return (model.elements[node.id] && model.elements[node.id].selected) || (model.folders[node.id] && model.folders[node.id].selected);
    };

    isNodeVisible = (node) => {
        const {model} = this.props;
        return (model.elements[node.id] && !!model.elements[node.id].visible) || (model.folders[node.id] && !!model.folders[node.id].visible);
    };

    selectNode = (node) => {
        if (this.isNodeSelected(node)) {
            this.toggleCollapse(node);
        } else {
            const {collapsed} = this.state;
            const {model} = this.props;
            model.selectElement(node.id);
            if (node.type === MainModel.TYPE_FOLDER && collapsed[node.id]) {
                this.toggleCollapse(node);
            }
        }
    };

    getIcon = (node) => {
        const {collapsed} = this.state;
        switch (node.type) {
            case MainModel.TYPE_FOLDER:
                return !collapsed[node.id] ? faFolderOpen : faFolder;
            case MainModel.TYPE_BOX:
                return faSquare;
            case MainModel.TYPE_SPHERE:
                return faCircle;
            case MainModel.TYPE_JSON:
                return faClone;
            default:
                return faExpand;
        }
    };

    addFolder = (node) => {
        const {model} = this.props;
        modalAddFolder({
            onConfirm: (name) => {
                model.addNewFolder(name, node ? node.id : null);
            }
        })
    };

    addElement = (node) => {
        const {model} = this.props;
        modalAddElement({
            onConfirm: (name, type) => {
                const el = model.addNewElement(type, node ? node.id : null);
                el.name = name;
                const newEl = model.elements[el.id];
                if (newEl) {
                    newEl.size = [1,1,1];
                    model._triggerChange();
                }
            }
        });
    };

    duplicate = (node) => {
        const {model} = this.props;
        model.duplicateNode(node);
    };

    copy = (node) => {
        const {model} = this.props;
        model.copyNode(node);
    };

    paste = (node) => {
        const {model} = this.props;
        model.pasteOnNode(node);
    };

    deleteElement = (node) => {
        const {model} = this.props;
        model.delElement(node.id);
    };

    clipboardEmpty = () => {
        const {model} = this.props;
        return model.clipboard == null;
    };

    onDragStart(event, node) {
        if (node) {
            this.dragging = true;
            const nodeStr = JSON.stringify(node);
            event.dataTransfer.setData("node", nodeStr);
        } else {
            event.preventDefault();
        }
    }

    onDragOver(event) {
        event.preventDefault();
    }

    onDragEnter(event) {
        if (this.dragging && Utils.hasClass(event.target, 'can-drop')) {
           Utils.addClass(event.target, 'drop-here');
        }
    }

    onDragLeave(event) {
        if (Utils.hasClass(this.dragging && event.target, 'drop-here')) {
            Utils.delClass(event.target, 'drop-here');
        }
    }

    onDrop(event, parent) {
        if (this.dragging && Utils.hasClass(event.target, 'drop-here')) {
            Utils.delClass(event.target, 'drop-here');
            this.dragging = false;

            const {model} = this.props;
            let node = JSON.parse(event.dataTransfer.getData("node"));

            //delete old node
            const nodeToDelete = model._findNodeRecursive(node.id);
            model._deleteTreeNode(nodeToDelete);

            //insert into new position
            model._triggerChange({list: false, tree: true});
            if (!parent) {
                model.tree.unshift(node);
                node.parentId = null;
            } else if (parent.type === MainModel.TYPE_FOLDER) {
                parent.children.unshift(node);
                node.parentId = parent.id;
            } else {
                const parentNode = model._findNodeRecursive(parent.parentId);
                const index = parentNode.children.indexOf(parent);
                parentNode.children.splice(index+1, 0, node);
                node.parentId = parentNode.id;
            }
        }
    }

    render() {
        const {model} = this.props;
        const {collapsed} = this.state;

        const addElement = (node) => {
            return (<a href="/" onClick={(e) => {
                e.preventDefault();
                this.addElement(node)
            }} className="dropdown" style={styles.LINK_ADD} title="Add object"><FontAwesomeIcon icon={faPlusSquare}/></a>)
        };

        const visible = (node) => {
            const v = this.isNodeVisible(node);
            return (<a href="/" onClick={(e) => {
                e.preventDefault();
                this.toggleVisible(node)
            }} className="dropdown" title="Show/Hide object"><FontAwesomeIcon icon={v ? faEye : faBan}/></a>)
        };

        const menu = (node) => {
            return (<DropdownButton bsSize="xsmall" title="..." pullRight id="dropdown-size-extra-small">
                {node.type === MainModel.TYPE_FOLDER &&
                <MenuItem eventKey="1" onClick={(e) => {
                    e.preventDefault();
                    this.addFolder(node);
                }}><FontAwesomeIcon icon={faFolder}/> Add Folder</MenuItem>
                }
                {node.type === MainModel.TYPE_FOLDER &&
                <MenuItem eventKey="2" onClick={(e) => {
                    e.preventDefault();
                    this.addElement(node);
                }}><FontAwesomeIcon icon={faPlusCircle}/> Add element</MenuItem>
                }
                {node.type === MainModel.TYPE_FOLDER &&
                <MenuItem divider/>
                }

                <MenuItem eventKey="1" onClick={(e) => {
                    e.preventDefault();
                    this.duplicate(node);
                }}><FontAwesomeIcon icon={faClone}/> Duplicate</MenuItem>
                <MenuItem eventKey="1" onClick={(e) => {
                    e.preventDefault();
                    this.copy(node);
                }}><FontAwesomeIcon icon={faCopy}/> Copy</MenuItem>

                {node.type === MainModel.TYPE_FOLDER &&
                <MenuItem eventKey="1" disabled={model.clipboard == null} onClick={(e) => {
                    e.preventDefault();
                    this.paste(node);
                }}><FontAwesomeIcon icon={faPaste}/> Paste</MenuItem>
                }

                <MenuItem divider/>

                <MenuItem eventKey="4" onClick={(e) => {
                    e.preventDefault();
                    this.deleteElement(node);
                }}><FontAwesomeIcon icon={faTrash}/> Delete</MenuItem>
            </DropdownButton>)
        };

        const elemNode = (node, index) => {
            return (<li key={index} style={styles.LI_ELEMENT}>
                <div style={styles.UNSELECTED}
                     className={this.isNodeSelected(node) ? 'selected can-drop' : 'hoverable can-drop'}
                     onDragEnter={(e)=>this.onDragEnter(e, node)}
                     onDragLeave={(e)=>this.onDragLeave(e, node)}
                     onDragOver={(e) => this.onDragOver(e, node)}
                     onDrop={(e) => this.onDrop(e,node)}
                >
                    {menu(node)}
                    {visible(node)}
                    <a href="/"
                       onClick={(e) => {e.preventDefault();this.selectNode(node)}}
                       style={styles.LINK_FILE}
                       draggable
                       onDragStart={(e) => this.onDragStart(e, node)}
                    >{node.name || '[no name]'}</a>
                </div>
            </li>)
        };

        const folderNode = (node, index) => {
            return (<li key={index} style={styles.LI_FOLDER}>
                <div style={styles.UNSELECTED}
                     className={this.isNodeSelected(node) ? 'selected can-drop' : 'hoverable can-drop'}
                     onDragEnter={(e)=>this.onDragEnter(e, node)}
                     onDragLeave={(e)=>this.onDragLeave(e, node)}
                     onDragOver={(e) => this.onDragOver(e, node)}
                     onDrop={(e) => this.onDrop(e,node)}
                >

                    {menu(node)}
                    {visible(node)}
                    {addElement(node)}
                    <a href="/"
                       onClick={(e) => {e.preventDefault();this.toggleCollapse(node)}}
                       style={styles.LINK_TREE}
                    >
                        <FontAwesomeIcon icon={this.getIcon(node)}/>
                    </a>
                    <a href="/" onClick={(e) => {
                        e.preventDefault();
                        this.selectNode(node)
                    }} style={styles.LINK_FOLDER}
                       draggable
                       onDragStart={(e) => this.onDragStart(e, node)}
                    >{node.name || '[no name]'}</a>
                </div>
                <ul style={styles.UL}>
                    {!collapsed[node.id] && node.children.map((n, ind) => {
                        return n.type === MainModel.TYPE_FOLDER
                            ? folderNode(n, ind)
                            : elemNode(n, ind)
                    })}
                </ul>
            </li>)
        };

        return (
            <div className="bar-block">
                <div className="bar-block-name">
                    <a className="right-link" href="/" onClick={(e)=>{e.preventDefault();this.addFolder(null);}} title="Add Folder"><FontAwesomeIcon icon={faFolder}/></a>
                    <a className="right-link" href="/" onClick={(e)=>{e.preventDefault();this.addElement(null);}} title="Add Object"><FontAwesomeIcon icon={faPlusSquare}/></a>
                    <a className="right-link" href="/" onClick={(e)=>{e.preventDefault();this.collapseAll();}} title="Collapse All"><FontAwesomeIcon icon={faCompress}/></a>
                    Objects
                </div>
                <div style={styles.SEPARATOR} className="can-drop"
                    onDragEnter={(e)=>this.onDragEnter(e, null)}
                    onDragLeave={(e)=>this.onDragLeave(e, null)}
                    onDragOver={(e) => this.onDragOver(e, null)}
                    onDrop={(e) => this.onDrop(e, null)}
                />
                <div style={styles.CONTAINER} className="tree">
                    <ul style={styles.MAIN_UL}>
                        {model.getElementTree().map((node, index) => {
                            return node.type === MainModel.TYPE_FOLDER
                                ? folderNode(node, index)
                                : elemNode(node, index)
                        })}
                    </ul>
                </div>
            </div>
        );
    }
}