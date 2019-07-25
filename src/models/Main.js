import uuidv4 from 'uuid/v4';
import Utils from "../services/Utils";

export default class MainModel {

    static TYPE_FOLDER = 'folder';
    static TYPE_BOX = 'box';
    static TYPE_SPHERE = 'sphere';
    static TYPE_CYLINDER = 'cylinder';
    static TYPE_JSON = 'json';

    constructor() {
        this.tree = [];
        this.elements = {};
        this.folders = {};
        this.clipboard = null;

        this.onChanged = null;
    }

    fromJSON(json) {
        if (Utils.isArray(json.tree)) this.tree = json.tree;
        if (Utils.isObject(json.elements)) this.elements = json.elements;
        if (Utils.isObject(json.folders)) this.folders = json.folders;
        this._triggerChange();
    }

    toJSON() {
        return {
            version: '0.2',
            tree: this.tree,
            elements: this.elements,
            folders: this.folders
        }
    }

    addNewElement(type, parentId = null) {
        let element = MainModel.getTemplate(type);
        return this.addElement(element, parentId);
    }

    addElement(element, parentId = null) {
        if (!element.id) {
            element.id = uuidv4();
        }

        element.visible = true;

        // add to list
        this.elements[element.id] = element;

        // add to tree
        const parentNode = !!parentId ? this._findNodeRecursive(parentId) : null;
        const node = {
            type: element.type,
            id: element.id,
            name: element.type + '_' + (Object.keys(this.elements).length),
            parentId: parentId
        };
        if (parentNode) {
            parentNode.children.push(node);
        } else {
            this.tree.push(node);
        }
        return node;
    }

    addNewFolder(name, parentId = null) {
        const parentNode = !!parentId ? this._findNodeRecursive(parentId) : null;
        const node = {
            type: MainModel.TYPE_FOLDER,
            id: uuidv4(),
            name: name,
            children: [],
            parentId: parentId,
            visible: true
        };

        // add to list
        this.folders[node.id] = node;

        if (parentNode) {
            parentNode.children.push(node)
        } else {
            this.tree.push(node);
        }
        this._triggerChange({list:false,tree:true});
        return node;
    }

    delElement(id) {

        const treeNode = this._findNodeRecursive(id);
        const ids = this._getRecursiveNodes(treeNode).map(node => {
            return node.id
        });
        this._deleteTreeNode(treeNode);
        ids.forEach(id => {
            if (this.elements[id]) {
                delete this.elements[id];
            }
            if (this.folders[id]) {
                delete this.folders[id];
            }
        });
        this._triggerChange();
    }

    getElementList() {
        return Object.values(this.elements).filter(el => {
            return !!el.visible && this._checkParentVisibility(el.id);
        });
    }

    getFolderList() {
        return Object.values(this.folders);
    }

    getSelected(all = false) {
        let arr = Object.values(this.elements).filter(el => {return el.selected}).concat(Object.values(this.folders).filter(el => {return el.selected}));
        return all ? arr : (arr.length>0 ? arr[0] : null);
    }

    getElementTree() {
        return this.tree;
    }

    moveSelected(index, value) {
        Object.values(this.elements)
            .filter(el => {return el.selected})
            .forEach(el => {
                el.position[index] += value;
            });
        this._triggerChange();
    }

    selectElement(id, deselectOthers = true) {
        if (deselectOthers) {
            Object.values(this.elements).forEach(n => {
                n.selected = false;
            });
            Object.values(this.folders).forEach(n => {
                n.selected = false;
            });
        }
        if (this.elements[id]) {
            this.elements[id].selected = true;
        }
        if (this.folders[id]) {
            this.folders[id].selected = true;
        }
        this._triggerChange();
    }

    toggleVisible(id) {
        if (this.elements[id]) {
            this.elements[id].visible = !this.elements[id].visible;
        }
        if (this.folders[id]) {
            this.folders[id].visible = !this.folders[id].visible;
        }
        this._triggerChange({list:true,tree:true});
    }

    duplicateNode(node, newParentID = null, level=0) {
        const newId = uuidv4();
        if (node.type===MainModel.TYPE_FOLDER) {
            // add to list
            const newFol = {
                type: MainModel.TYPE_FOLDER,
                id: newId,
                name: node.name,
                children: [],
                parentId: newParentID || node.parentId,
                visible: true
            };
            this.folders[newFol.id] = newFol;

            // add to tree
            const parentNode = this._findNodeRecursive(newParentID || node.parentId);
            if (parentNode) parentNode.children.push(newFol);
            else this.tree.push(newFol);

            // process children
            node.children.forEach(el => {
               this.duplicateNode(el, newFol.id, level+1);
            });

        } else {
            // add to list
            const newEl = JSON.parse(JSON.stringify(this.elements[node.id]));
            newEl.id = newId;
            this.elements[newEl.id] = newEl;

            // add to tree
            const newNode = JSON.parse(JSON.stringify(node));
            newNode.id = newEl.id;
            newNode.parentId = newParentID || node.parentId;
            const parentNode = this._findNodeRecursive(newParentID || node.parentId);
            if (parentNode) parentNode.children.push(newNode);
            else this.tree.push(newNode);
        }
        if (level===0) {
            this.selectElement(newId);
        }
    }

    copyNode(node) {
        this.clipboard = node;
        this._triggerChange({list:false,tree:true});
    }

    pasteOnNode(node) {
        if (this.clipboard!=null && node.type===MainModel.TYPE_FOLDER) {
            this.duplicateNode(this.clipboard, node.id)
        }
    }

    replaceTexture(oldTexture, newTexture) {
        Object.values(this.elements).forEach(el => {
            if (el.texture === oldTexture) {
                el.texture = newTexture;
            }
        });
        this._triggerChange();
    }

    _checkVisibility = (id) => {
        if (this.elements[id]) {
            return !!this.elements[id].visible;
        }
        if (this.folders[id]) {
            return !!this.folders[id].visible;
        }
        return true;
    };

    _checkParentVisibility = (id) => {
        if (!this._checkVisibility(id)) return false;

        let node = this._findNodeRecursive(id);
        while (node && node.parentId) {
            if (!this._checkVisibility(node.parentId)) return false;
            node = this._findNodeRecursive(node.parentId);
        }

        return true;
    };

    // finds a node by id on the tree
    _findNodeRecursive = (id, list = null) => {
        if (!list) list = this.tree;
        let res = list.filter(n => {
            return n.id === id
        });
        if (res.length > 0) {
            return res[0];
        }

        const subFolders = list.filter(n => {
            return n.type === MainModel.TYPE_FOLDER
        });

        let found = null;
        subFolders.forEach(folder => {
            const res = this._findNodeRecursive(id, folder.children);
            if (res !== null) {
                found = res;
            }
        });

        return found;
    };

    // get a list of all children nodes including the parent
    _getRecursiveNodes = (node) => {
        let result = [];
        if (node) {
            result.push(node);
            if (node.type === MainModel.TYPE_FOLDER) {
                node.children.forEach(c => {
                    result = result.concat(this._getRecursiveNodes(c));
                });
            }
        }
        return result;
    };

    // deletes a node from the model tree
    _deleteTreeNode = (node) => {
        let list = this.tree;
        if (node.parentId) {
            const parentNode = this._findNodeRecursive(node.parentId);
            if (parentNode && parentNode.children) {
                list = parentNode.children;
            }
        }

        const ind = list.indexOf(node);
        if (ind > -1) {
            list.splice(ind, 1);
        }
    };

    _triggerChange = (changes = null) => {
        if (this.onChanged) {
            if (changes == null) {
                changes = {tree: true, list: true};
            }
            this.onChanged(changes);
        }
    };

    static getTemplate(type) {
        switch (type) {
            case MainModel.TYPE_SPHERE:
                return {
                    type: type,
                    position: [0, 0, 0],
                    radius: 3
                };
            case MainModel.TYPE_CYLINDER:
                return {
                    type: type,
                    position: [0, 0, 0],
                    radius: 3,
                    height: 3
                };
            case MainModel.TYPE_JSON:
                return {
                    type: type,
                    position: [0, 0, 0],
                    url: ''
                };
            default:
                return {
                    type: MainModel.TYPE_BOX,
                    position: [0, 0, 0],
                    size: [1, 1, 1]
                };
        }
    }

}