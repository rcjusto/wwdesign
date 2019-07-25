import * as THREE from 'three';
import {Storage} from 'aws-amplify';

export default class TexturesCache {

    constructor() {
        this.loader = new THREE.TextureLoader();
        this._textures = {};
    }

    getTexture(key) {
        return new Promise((resolve, reject) => {
            if (this._textures[key]) {
                resolve(this._textures[key]);
            } else {
                let self = this;

                Storage.get(key)
                    .then(url => {
                        this.loader.load(
                            // resource URL
                            url,

                            // onLoad callback
                            function (texture) {
                                self._textures[key] = texture;
                                resolve(self._textures[key]);
                            },

                            // onProgress callback currently not supported
                            undefined,

                            // onError callback
                            function (err) {
                                reject(err);
                            }
                        )
                    })
                    .catch(err => console.log(err));


            }
        })
    }


}
