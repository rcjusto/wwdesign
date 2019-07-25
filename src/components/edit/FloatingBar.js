import React, {Component} from 'react';
import * as styles from "./FloatingBar.styles";
import TreeView from "./TreeView";
import Properties from "./Properties";
import CutList from "./CutList";

class FloatingBar extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {import: ''};
        this.textures = [];
        this.toggleBar = this.toggleBar.bind(this);
        this.handleImportChange = this.handleImportChange.bind(this);
    }

    toggleBar = (e) => {
        e.preventDefault();
        const {hideBar} = this.state;
        this.setState({hideBar: !hideBar})
    };

    handleImportChange(e) {
        this.setState({
            import: e.target.value
        })
    }

    render() {
        let {model} = this.props;
        const selected = model.getSelected();
        return (
            <div style={styles.CONTAINER}>

                <TreeView model={model}/>

                {selected &&
                <Properties model={model} selected={selected}/>
                }

                <CutList model={model}/>

            </div>
        );
    }
}

export default FloatingBar;
