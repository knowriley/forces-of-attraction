class Matrix {

    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 500,
        containerHeight: 350,
        margin: {top: 15, right: 15, bottom: 20, left: 25}
      }
      this.data = _data;
      this.initVis();
    }

    initVis() {
        let vis = this;
        // TODO
    }

    updateVis() {
        let vis = this;
        // TODO

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        // TODO
    }

}