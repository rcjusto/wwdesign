import * as THREE from 'three';

export default function GeneralLights(scene, index) {

    let light;
    switch (index) {
        case 0:
            light = new THREE.PointLight("#ffffff", 1, 0 ,2);
            light.position.set( 50, 50, 50 );
            light.castShadow = true;
            break;
        default:
            light = new THREE.AmbientLight("#ffffff", 0.5);


    }

    scene.add(light);

    this.update = function(time) {
    }
}