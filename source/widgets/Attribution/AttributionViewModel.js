import { WidgetViewModel } from "../WidgetViewModel.js"
import logo from "../../assets/image/smardaten-logo.png"


class AttributionViewModel extends WidgetViewModel {



    logoUrl;
    href;
    text;
    constructor(options) {
        super(options);
        // this.logoUrl = options.icoUrl || "http://127.0.0.1:5505/build/assets/image/logo/smardaten-logo.png";
        this.logoUrl = options.icoUrl || logo;
        this.href = options.url || ""
        this.text = options.text || "";
    }

    destrory() {
        this._map = undefined;
    }
}

export { AttributionViewModel }