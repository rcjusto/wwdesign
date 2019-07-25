import * as THREE from 'three';
import SceneSubject from './SceneSubject';
import TexturesCache from './TexturesCache';
import JsonObjectsCache from "./JsonObjectsCache";


export default (model) => {

    // get list of elements to render
    const folder = Object.values(model.folders).find(el => {return el.selected});
    const node = folder ? model._findNodeRecursive(folder.id) : null;
    const array = node ? model._getRecursiveNodes(node) : [];

    const textures = new TexturesCache();
    const jsonObjects = new JsonObjectsCache();

    const scene = new THREE.Scene();
    array.forEach(n => {
        if (model.elements[n.id]) {
            new SceneSubject(model.elements[n.id], textures, jsonObjects).then(subject => {
                scene.add(subject.mesh);
                subject.update();
            });
        }
    });

    return scene.toJSON();
}