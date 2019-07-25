import React, {Component} from 'react';
import MainModel from "../../models/Main";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import * as styles from "./CutList.styles";
import {faCaretRight, faRulerCombined} from "@fortawesome/fontawesome-free-solid/index.es";

export default class CutList extends Component {

    static UNIT_INCHES = 'inches';
    static UNIT_FEET = 'feet';
    static UNIT_BOARD_8 = 'board8';

    constructor(props, context) {
        super(props, context);
        this.state = {
            unit: CutList.UNIT_INCHES,
            show: {}
        };
        this.changeUnit = this.changeUnit.bind(this);
    }

    generateList(model) {
        const list = {};
        JSON.parse(JSON.stringify(Object.values(model.getElementList())))
            .filter(el => {
                return el.type === MainModel.TYPE_BOX && !!el.visible
            })
            .forEach(el => {
                const arr = el.size.sort((e1,e2)=>{ return parseFloat(e1)<parseFloat(e2) ? -1 : 1 });
                const key = arr[0] + ' x ' + arr[1];
                if (list[key]) {
                    list[key].push({element: el, dimension: arr[2]});
                } else {
                    list[key] = [{element: el, dimension: arr[2]}];
                }
            });
        return Object.keys(list).map(k => {
            return {
                key : k,
                value: list[k],
            }
        }).sort((e1,e2) => {
            const arr1 = e1.key.split(' x ');
            const arr2 = e2.key.split(' x ');
            const v1 = parseFloat(arr1[0]);
            const v2 = parseFloat(arr2[0]);
            const v3 = parseFloat(arr1[1]);
            const v4 = parseFloat(arr2[1]);
            if (v1>v2) return -1;
            else if (v2>v1) return 1;
            else return v3 > v4 ? -1 : 1;
        });
    }

    getSize(obj) {
        let v = 0;
        obj.forEach(el => {
            v += el.dimension;
        });
        return this.getSizeInUnit(v, this.state.unit);
    }

    getSizeInUnit(v, unit ) {
        switch (unit) {
            case CutList.UNIT_FEET:
                return Math.ceil(v/12) + ' ft';
            case CutList.UNIT_BOARD_8:
                return Math.ceil(v/(12*8)) + ' bd';
            default:
                return Math.ceil(v) + ' in';
        }
    }

    changeUnit() {
        switch (this.state.unit) {
            case CutList.UNIT_FEET:
                this.setState({unit: CutList.UNIT_BOARD_8});
                break;
            case CutList.UNIT_BOARD_8:
                this.setState({unit: CutList.UNIT_INCHES});
                break;
            default:
                this.setState({unit: CutList.UNIT_FEET});
        }
    }

    static getUnitDesc(unit) {
        switch (unit) {
            case CutList.UNIT_FEET:
                return 'feet';
            case CutList.UNIT_BOARD_8:
                return '8-feet boards';
            default:
                return 'inches';
        }
    }

    toggleShow(key) {
        const {show} = this.state;
        show[key] = !show[key];
        this.setState({show});
    }

    selectElement(element) {
        const {model} = this.props;
        model.selectElement(element.id);
    }

    selectAll(list) {
        const {model} = this.props;
        model.selectElement(0);
        list.forEach(it => {
            model.selectElement(it.element.id, false);
        })
    }

    render() {
        const {show} = this.state;
        const {model} = this.props;
        const list = this.generateList(model);
        return list && list.length>0 ? (<div className="bar-block">
            <div className="bar-block-name">
                <a className="right-link" href="/" onClick={(e) => {
                    e.preventDefault();
                    this.changeUnit();
                }} title="Change Unit"><FontAwesomeIcon icon={faRulerCombined}/></a>
                Cut List <span style={styles.TITLE_DESC}>({CutList.getUnitDesc(this.state.unit)})</span>
            </div>
            <div style={styles.CONTAINER}>
                <ul style={styles.MAIN_UL}>
                    {list.map((el, ind) => {
                        return (<li key={ind} style={styles.LI}>
                            <a style={styles.LINK} href="/" onClick={(e) => {e.preventDefault(); this.toggleShow(el.key)}}  className="no-underline clearfix">
                                <span style={styles.LABEL}><FontAwesomeIcon icon={faCaretRight}/> {el.key}</span>
                                <span style={styles.VALUE}>{this.getSize(el.value)}</span>
                            </a>
                            {show[el.key] && <div style={styles.DETAIL_CONT}>
                                {el.value.map((it,ind)=>{
                                    return (<a className="no-underline" style={it.element.selected ? styles.DETAIL_SELECTED : styles.DETAIL} key={ind} href="/" onClick={(e)=>{e.preventDefault();this.selectElement(it.element)}}>
                                        {this.getSizeInUnit(it.dimension, CutList.UNIT_INCHES )}
                                    </a>)
                                })}
                                <a className="no-underline" style={styles.SELECT_ALL} href="/" onClick={(e)=>{e.preventDefault();this.selectAll(el.value)}}>all</a>
                            </div>}
                        </li>)
                    })}
                </ul>
            </div>
        </div>)
            : (<span/>);
    }
}