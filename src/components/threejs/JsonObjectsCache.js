import * as THREE from 'three';
import {Storage} from "aws-amplify";

export default class TexturesCache {

    constructor() {
        this.jsonLoader = new THREE.JSONLoader();
        this.objectLoader = new THREE.ObjectLoader();
        this._objects = {};
    }

    getJsonObject(url) {
        return new Promise((resolve, reject) => {
            if (this._objects[url]) {
                resolve(this._objects[url]);
            } else {
                let self = this;
                Storage.get(url)
                    .then(file => {
                        fetch(file)
                            .then(res => {
                                if (res.ok) {
                                    res.json()
                                        .then(data => {
                                            if (data.object) {
                                                try {
                                                    this.objectLoader.parse(data, (obj) => {
                                                        console.log(obj);
                                                        self._objects[url] = {type: 'object', obj: obj};
                                                        resolve(self._objects[url]);
                                                    })
                                                } catch (e) {
                                                    console.log(e)
                                                    reject(e)
                                                }
                                            } else {
                                                const obj = this.jsonLoader.parse(data);
                                                console.log(obj)
                                                self._objects[url] = {type:'json', obj:obj};
                                                resolve(self._objects[url]);
                                            }
                                        })
                                } else {
                                    reject()
                                }

                            })
                            .catch(err => {
                                console.log(err);
                                reject(err)
                            });
                    })
            }
        })
    }

    tryJSONLoader(file) {
        return new Promise((resolve, reject) => {
            try {
                this.jsonLoader.load(
                    file,
                    function (geometry, materials) {
                        resolve({geometry: geometry, materials: materials});
                    },
                    undefined,
                    function (err) {
                        reject(err);
                    }
                );
            } catch (err) {
                reject(err);
            }
        });
    }

    tryObjectLoader(file) {
        return new Promise((resolve, reject) => {
            this.objectLoader.load(
                file,
                function (geometry, materials) {
                    resolve({geometry: geometry, materials: materials});
                },
                undefined,
                function (err) {
                    reject(err);
                }
            )
        });
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

}
