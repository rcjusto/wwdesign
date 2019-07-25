import React, {Component} from 'react';
import ThreeContainer from "../threejs/ThreeContainer";
import * as styles from "./Editor.styles";
import FloatingBar from "./FloatingBar";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faCamera,
    faDownload,
    faExpandArrowsAlt,
    faImages,
    faLongArrowAltLeft,
    faTh,
    faUpload
} from "@fortawesome/fontawesome-free-solid/index.es";
import ApiService from "../../services/Api";
import MainModel from "../../models/Main";
import {modalEditPage} from "./modals/ModalEditPage";
import {Link} from "react-router-dom";
import {modalSelTexture} from "./modals/ModalSelTexture";
import {modalImportText} from "./modals/ModalImportText";
import {modalMessage} from "./modals/ModalMessage";
import Header from "../Header";
import {modalExportMesh} from "./modals/ModalExportMesh";
import {Storage} from "aws-amplify";
import Utils from "../../services/Utils";

class Editor extends Component {

    constructor(props, context) {
        super(props, context);
        this.model = new MainModel();
        this.textures = [];
        this.state = {
            data: [],
            updateTree: false,
            hideBar: false
        };
        this.handleElementClicked = this.handleElementClicked.bind(this);
        this.editPageInfo = this.editPageInfo.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        document.addEventListener('keydown', this.handleKeyDown);

    }

    componentDidMount() {
        if (this.props.computedMatch) {
            this.loadDoc(this.props.computedMatch.params.id);
        }
        this.model.onChanged = (changes) => {
            const newState = {};
            if (changes.tree) {
                newState.updateTree = !this.state.updateTree
            }
            if (changes.list) {
                newState.data = this.model.getElementList()
            }
            this.setState(newState);
            this.saveDoc();
        };

        Storage.list('textures/')
            .then(result => {
                this.setState({textures: result.map(it => it.key)})
            })
            .catch(err => console.log(err));

    }

    loadDoc(id) {
        this.setState({id: id});
        ApiService.getOne(id)
            .then(res => {
                this.setState({
                    name: res.name,
                    desc: res.desc
                });
                this.model.fromJSON(res.data);
            })
            .catch(err => {

            })
    }

    saveDoc() {
        const {id, name, desc} = this.state;
        if (id) {
            const data = {
                id: id,
                name: name,
                desc: desc,
                data: this.model.toJSON()
            };
            ApiService.update(id, data)
                .then(() => {
                    this.setState({updated: true});
                });
        }
    }

    handleElementClicked(data) {
        if (data.ctrlKey) {
            this.model.selectElement(data.id);
        }
    }

    handleKeyDown(e) {
        if (this.threeContainer != null && (e.ctrlKey || e.shiftKey)) {
            let x, y, sx = 1, sy = 1;
            const axis = this.threeContainer.getCameraAxis();
            switch (axis) {
                case 'Z':
                    x = 0;
                    y = 1;
                    sx = -1;
                    break;
                case '-Z':
                    x = 0;
                    y = 1;
                    break;
                case 'Y':
                    x = 0;
                    y = 2;
                    sx = -1;
                    sy = -1;
                    break;
                case '-Y':
                    x = 0;
                    y = 2;
                    break;
                case 'X':
                    x = 2;
                    y = 1;
                    break;
                case '-X':
                    x = 2;
                    y = 1;
                    sx = -1;
                    break;
                default:
                    x = 2;
                    y = 1;
            }
            const step = e.ctrlKey ? .25 : 1;
            if (e.code === 'ArrowLeft') this.model.moveSelected(x, sx * step);
            if (e.code === 'ArrowRight') this.model.moveSelected(x, -sx * step);
            if (e.code === 'ArrowUp') this.model.moveSelected(y, sy * step);
            if (e.code === 'ArrowDown') this.model.moveSelected(y, -sy * step);
        }
    }

    editPageInfo(e) {
        e.preventDefault();
        modalEditPage({
            name: this.state.name,
            desc: this.state.desc,
            onConfirm: (res) => {
                this.setState(res, () => {
                    this.saveDoc()
                });
            }
        })
    }

    getSnapShot() {
        const data = this.threeContainer.getSnapShot();
        const block = data.split(";");
        const contentType = block[0].split(":")[1];
        const realData = block[1].split(",")[1];
        let buff = Utils.b64toBlob(realData, contentType);
        Storage.put(`snapshots/${this.state.id}.jpg`, buff)
            .then(() => {
                modalMessage({
                    message: 'Snapshot updated successfully'
                })
            })
            .catch(err => {
                console.log(err)
            });
    }

    replaceTexture() {
        modalSelTexture({
            title: 'Selected the texture to be replaced',
            textures: this.textures,
            selected: null,
            onConfirm: (oldTexture) => {
                modalSelTexture({
                    title: 'Selected the new texture',
                    textures: this.textures,
                    selected: null,
                    onConfirm: (newTexture) => {
                        this.model.replaceTexture(oldTexture, newTexture)
                    }
                })
            }
        })
    }

    importOldFormat() {
        modalImportText({
            title: 'Import Old JSON Format',
            onConfirm: (data) => {
                const obj = JSON.parse(data);
                if (obj.data) {
                    obj.data.forEach(el => {
                        this._importNode(el, null);
                    });
                    this.model._triggerChange();
                }
            }
        })
    }

    exportSelectedFolder() {
        const exp = this.threeContainer.sceneToJSON();
        if (exp != null) {
            modalExportMesh({
                onConfirm: (name) => {
                    const data = JSON.stringify(exp);
                    Storage.put('models/' + name, data).then(() => {
                        //this.model._triggerChange();
                        modalMessage({
                            message: 'Model successfully exported'
                        });
                    });
                }
            })
        }
    }

    _importNode(node, parentId) {
        if (node.children) {
            const el = this.model.addNewFolder(node.name, parentId);
            node.children.forEach(ch => {
                this._importNode(ch, el.id);
            })
        } else {
            const el = this.model.addNewElement(MainModel.TYPE_BOX, parentId);
            el.name = node.name;
            const newEl = this.model.elements[el.id];
            newEl.size = node.siz;
            newEl.position = node.pos;
            newEl.texture = '';
        }
    }

    render() {
        const {data, updateTree, hideBar, name} = this.state;

        return (<div style={styles.CONTAINER}>
            <Header title={name} actions={[{id: 'list', label: 'List of Models', icon: faTh, route: '/'}]}
                    onAction={this.onAction}/>
            <div style={{height: '100%', position: 'relative'}}>
                {!hideBar &&
                <div style={styles.BAR_CONTAINER}>
                    <a style={styles.HIDE_BAR} href="/" title="Hide this bar" onClick={(e) => {
                        e.preventDefault();
                        this.setState({hideBar: true});
                        this.model.selectElement(0);
                    }}><FontAwesomeIcon icon={faLongArrowAltLeft}/></a>
                    <div style={styles.BAR}>
                        <div style={styles.BAR_TITLE}>
                            <Link to="/" style={styles.NAME_ICON}><FontAwesomeIcon icon={faTh}/></Link>
                            <a href="/" onClick={this.editPageInfo} style={styles.NAME}>{name}</a>
                        </div>

                        <div style={styles.BAR_PROPS}><FloatingBar model={this.model} update={updateTree}/></div>

                        <div style={styles.BAR_FOOTER}>
                            <a href="/" onClick={(e) => {
                                e.preventDefault();
                                this.getSnapShot();
                            }} title="Update model snapshot" style={styles.BOTTOM_LINK}>
                                <FontAwesomeIcon icon={faCamera}/>
                            </a>
                            <a href="/" onClick={(e) => {
                                e.preventDefault();
                                this.replaceTexture();
                            }} title="Replace texture" style={styles.BOTTOM_LINK}>
                                <FontAwesomeIcon icon={faImages}/>
                            </a>
                            <a href="/" onClick={(e) => {
                                e.preventDefault();
                                this.importOldFormat();
                            }} title="Import old JSON format" style={styles.BOTTOM_LINK}>
                                <FontAwesomeIcon icon={faDownload}/>
                            </a>
                            <a href="/" onClick={(e) => {
                                e.preventDefault();
                                this.exportSelectedFolder();
                            }} title="Export Selected" style={styles.BOTTOM_LINK}>
                                <FontAwesomeIcon icon={faUpload}/>
                            </a>
                        </div>
                    </div>
                </div>
                }
                {hideBar &&
                <a style={styles.SHOW_BAR} href="/" title="Show properties bar" onClick={(e) => {
                    e.preventDefault();
                    this.setState({hideBar: false})
                }}><FontAwesomeIcon icon={faExpandArrowsAlt}/></a>
                }
                <div style={styles.CANVAS}>
                    <ThreeContainer ref={instance => {
                        this.threeContainer = instance
                    }} data={data} onElementClicked={this.handleElementClicked}/>
                </div>
            </div>
        </div>);
    }
}

export default Editor;
