import React, {Component} from 'react';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import * as styles from "./Header.styles";
import {Link} from "react-router-dom";

export default class Header extends Component {

    clickAction(action) {
        if (this.props.onAction)
            this.props.onAction(action);
    }

    render() {
        const {title, actions} = this.props;
        return (<div style={styles.CONTAINER}>
            <span style={styles.TITLE}>{title}</span>
            {actions && <div style={styles.ACTIONS}>
                {actions.map((el, ind) => {
                    return el.route
                        ? (<Link key={ind} to={el.route} className="no-underline header-action" style={styles.ACTION}>
                            {el.icon && <FontAwesomeIcon icon={el.icon}/>}
                            <span> {el.label}</span>
                        </Link>)
                        : (<a key={ind} className="no-underline header-action" style={styles.ACTION} href="/" onClick={(e) => {
                        e.preventDefault();
                        this.clickAction(el)
                    }}>
                            {el.icon && <FontAwesomeIcon icon={el.icon}/>}
                            <span> {el.label}</span>
                    </a>)
                })}
            </div>
            }
        </div>)
    }

}
