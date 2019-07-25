import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import * as styles from "./Properties.styles";
import DropDown from "./Dropdown";
import {LABELED_ROW} from "./Properties.styles";
import {Button, DropdownButton, FormControl, InputGroup, MenuItem} from "react-bootstrap";
import {faCaretDown, faCubes, faExpandArrowsAlt, faImage, faLocationArrow, faFolder, faUndoAlt} from "@fortawesome/fontawesome-free-solid/index.es";
import MainModel from "../../models/Main";
import {modalSelTexture} from "./modals/ModalSelTexture";
import img_sphere from '../../images/sphere.png';
import img_box from '../../images/cube.png';
import img_cyl from '../../images/cylinder.png';
import img_dots from '../../images/points.png';
import {Storage} from "aws-amplify";
import {S3Image} from 'aws-amplify-react';

export default class Properties extends Component {

    static RESET = '[reset]';

    constructor(props, context) {
        super(props, context);
        this.state = {
            element: null,
            node: null,
            textures: [],
            objects: [],
            textureUrl: null
        };

        this.options = {
            position: ["-10","-5","-2","-1","-0.5","-0.25","+0.25","+0.5","+1","+2","+5","+10"],
            rotation: [Properties.RESET,"-90","-60","-45","-30","-15","-5","+5","+15","+30","+45","+60","+90"],
            size: [0.75, 1, 1.5, 2, 2.5,3,3.5,4,4.5,5]
        };

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handlePositionChange = this.handlePositionChange.bind(this);
        this.handleRotationChange = this.handleRotationChange.bind(this);
        this.handleSizeChange = this.handleSizeChange.bind(this);
        this.handlePropChange = this.handlePropChange.bind(this);
        this.handleTextureChange = this.handleTextureChange.bind(this);
        this.handleObjectChange = this.handleObjectChange.bind(this);
    }

    handleNameChange(event) {
        let {node} = this.state;
        if (node.name !== event.target.value) {
            node.name = event.target.value;
            this.setState({node});
            this.props.model._triggerChange({tree: true, list: false});
        }
    }

    handleTextureChange() {
        let {element} = this.state;
        modalSelTexture({
            textures: this.state.textures,
            selected: element.texture,
            onConfirm: (texture) => {
                element.texture = texture;
                this.setState({element});
            }
        })
    }

    handleObjectChange(event) {
        let {element} = this.state;
        if (element.url !== event.target.value) {
            element.url = event.target.value;
            this.setState({element});
            this.props.model._triggerChange();
        }
    }

    handlePropChange(event) {
        let {element} = this.state;
        element[event.target.name] = event.target.value;
        this.setState({element});
    }

    handlePositionChange(index, value, method = null) {
        let {element} = this.state;
        if (method===DropDown.METHOD_SEL) {
            element.position[index] += parseFloat(value);
        } else {
            element.position[index] = value;
        }
        this.setState({element});
    }

    handleRotationChange(index, value, method = null) {
        let {element} = this.state;
        if (!element.rotation) element.rotation = [0, 0, 0];
        if (method===DropDown.METHOD_SEL) {
            if (value===Properties.RESET) {
                element.rotation[index] = 0;
            } else {
                element.rotation[index] += parseFloat(value) * Math.PI / 180;
            }
        } else {
            element.rotation[index] = value;
        }
        this.setState({element});
    }

    handleSizeChange(index, value, method = null) {
        let {element} = this.state;
        if (!element.size) element.size = [0, 0, 0];
        element.size[index] = value;
        this.setState({element});
        this.props.model._triggerChange();
    }

    componentDidMount() {

        Storage.list('textures/')
            .then(result => {
                this.setState({textures: result.map(it => it.key)})
            })
            .catch(err => console.log(err));

        Storage.list('models/')
            .then(result => {
                this.setState({objects: result.map(it => it.key)});
            })
            .catch(err => console.log(err));

        if (this.props.model) {
            this.setState({
                element: this.props.selected,
                node: this.props.model._findNodeRecursive(this.props.selected.id)
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.model && prevProps.selected && prevProps.selected !== this.props.selected) {
            this.setState({
                element: this.props.selected,
                node: this.props.model._findNodeRecursive(this.props.selected.id)
            });
        }
    }

    getImageType(element) {
        switch (element.type) {
            case MainModel.TYPE_CYLINDER:
                return img_cyl;
            case MainModel.TYPE_SPHERE:
                return img_sphere;
            case MainModel.TYPE_JSON:
                return img_dots;
            default:
                return img_box;
        }
    }

    render() {
        let {element, node, objects, textureUrl} = this.state;
        const styleTexture = {
            backgroundImage: (element && element.texture) ? 'url(' + textureUrl + ')' : 'none'
        };

        return (
            <div className="bar-block-next">
                {element && element.texture &&
                <S3Image hidden imgKey={element.texture} onLoad={url => {this.setState({textureUrl: url})}} />
                }
                <div className="bar-block-name">Properties</div>
                <div style={styles.CONTAINER} className="properties-block">
                    {node &&
                    <div style={LABELED_ROW} className="clearfix">
                        <div style={styles.LABELED_ROW_LABEL}>
                            {element.type!==MainModel.TYPE_FOLDER &&
                            <img src={this.getImageType(element)} style={styles.IMG_TYPE} alt=" "/>
                            }
                            {element.type===MainModel.TYPE_FOLDER &&
                            <FontAwesomeIcon icon={faFolder}/>
                            }
                        </div>
                        <div style={styles.COL_1_1}>
                            <FormControl type="text" name="name" value={node.name} onChange={this.handleNameChange}/>
                        </div>
                    </div>
                    }
                    {element && element.type !== MainModel.TYPE_FOLDER &&
                    <div style={LABELED_ROW} className="clearfix">
                        <div style={styles.LABELED_ROW_LABEL}>
                            <FontAwesomeIcon icon={faLocationArrow}/>
                        </div>
                        {[0, 1, 2].map((ind) => {
                            return (<div key={ind} style={styles.COL_1_3}>
                                <DropDown
                                    index={ind}
                                    value={element.position[ind] || 0}
                                    options={this.options.position}
                                    onUpdated={this.handlePositionChange}/>
                            </div>);
                        })}
                    </div>}
                    {element && element.type !== MainModel.TYPE_FOLDER &&
                    <div style={LABELED_ROW} className="clearfix">
                        <div style={styles.LABELED_ROW_LABEL}>
                            <FontAwesomeIcon icon={faUndoAlt}/>
                        </div>
                        {[0, 1, 2].map((ind) => {
                            return (<div key={ind} style={styles.COL_1_3}>
                                <DropDown
                                    index={ind}
                                    value={element.rotation ? element.rotation[ind] : 0}
                                    options={this.options.rotation}
                                    onUpdated={this.handleRotationChange}/>
                            </div>);
                        })}
                    </div>}
                    {element && element.type !== MainModel.TYPE_FOLDER &&
                    <div style={LABELED_ROW} className="clearfix">
                        <div style={styles.LABELED_ROW_LABEL}>
                            <FontAwesomeIcon icon={faExpandArrowsAlt}/>
                        </div>
                        {[0, 1, 2].map((ind) => {
                            return (<div key={ind} style={styles.COL_1_3}>
                                <DropDown
                                    index={ind}
                                    value={element.size ? element.size[ind] : 0}
                                    options={this.options.size}
                                    onUpdated={this.handleSizeChange}
                                />
                            </div>);
                        })}
                    </div>}

                    {element && element.type !== MainModel.TYPE_JSON && element.type !== MainModel.TYPE_FOLDER &&
                    <div style={LABELED_ROW} className="clearfix">
                        <div style={styles.LABELED_ROW_LABEL}>
                            <FontAwesomeIcon icon={faImage}/>
                        </div>
                        <div style={styles.COL_1_1}>
                            <InputGroup>
                                <div onClick={this.handleTextureChange} className="form-control" style={styleTexture}/>
                                <InputGroup.Button>
                                    <Button onClick={this.handleTextureChange}>
                                        <FontAwesomeIcon icon={faCaretDown}/>
                                    </Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </div>
                    </div>
                    }
                    {element && element.type === MainModel.TYPE_JSON &&
                    <div style={LABELED_ROW} className="clearfix">
                        <div style={styles.LABELED_ROW_LABEL}>
                            <FontAwesomeIcon icon={faCubes}/>
                        </div>
                        <div style={styles.COL_1_1}>
                            <InputGroup>
                                <div className="form-control" style={styleTexture}>
                                    {element.url}
                                </div>
                                {objects && objects.length > 0 &&
                                <DropdownButton componentClass={InputGroup.Button} pullRight id="input-dropdown-addon" title="">
                                    {objects.map((s, ind) => {
                                        return (<MenuItem key={ind} onClick={(e) => {
                                            e.preventDefault();
                                            this.handleObjectChange({
                                                target: {
                                                    value: s
                                                }
                                            })
                                        }}>{s}</MenuItem>)
                                    })}
                                </DropdownButton>
                                }
                            </InputGroup>
                        </div>
                    </div>
                    }
                </div>
            </div>
        )
    }
}