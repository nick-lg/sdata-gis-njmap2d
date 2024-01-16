
const fixedOptions = {
    asynchronous: false,//实验发现只有在false时更改geometry才有效
    // releaseGeometryInstances:false//这个最好设为false
}


class CustomPrimitve extends Cesium.Primitive {

    get context() {
        return this.#viewer.scene.context;
    }

    #viewer;
    get viewer() {
        return this.#viewer;
    }


    constructor(viewer, options = {}) {
        super(options.innerOption || fixedOptions);

        this.#viewer = viewer;
    }
    _createGeometryInstance() {
        throw new Error('method _createGeometryInstance of CustomPrimitive should be implemented in subclass');
    }

    _createAppearance() {
        throw new Error('method _createAppearance of CustomPrimitive should be implemented in subclass');
    }

}

export { CustomPrimitve }