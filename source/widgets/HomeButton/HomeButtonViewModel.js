import { WidgetViewModel } from "../WidgetViewModel.js"

class HomeButtonViewModel extends WidgetViewModel {

    duration;//跳转到主视点的动画间隔(秒)

    constructor(options) {
        super(options);
        this.duration = options.duration || 2;
    }

    goHome(eventArg) {
        eventArg._map.flyHome(this.duration);
    }


    destrory() {
        this._map = undefined;
    }
}

export { HomeButtonViewModel }