import SceneManager from './SceneManager';
export default (containerElement, onElementClicked) => {

    const canvas = createCanvas(document, containerElement);
    const sceneManager = new SceneManager(canvas, {
        mousedown: (data) => {
            onElementClicked(data);
        }
    });

    bindEventListeners();
    render();

    function createCanvas(document, containerElement) {
        const canvas = document.createElement('canvas');
        containerElement.appendChild(canvas);
        return canvas;
    }
    function bindEventListeners() {
        window.onresize = resizeCanvas;
        resizeCanvas();
    }
    function resizeCanvas() {
        canvas.style.width = '100%';
        canvas.style.height= '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        sceneManager.onWindowResize();
    }
    function render(time) {
        requestAnimationFrame(render);
        sceneManager.update();
    }
    function updateData(elements) {
        sceneManager.updateSceneSubjects(elements);
        sceneManager.update();
    }
    function addData(element) {
        sceneManager.addSceneSubject(element);
        sceneManager.update();
    }

    function getSnapShot() {
        return sceneManager.getSnapShot()
    }

    function getCameraAxis() {
        return sceneManager.getCameraAxis()
    }

    function sceneToJSON() {
        return sceneManager.sceneToJSON()
    }


    return {updateData, addData, getSnapShot, getCameraAxis, sceneToJSON}
}