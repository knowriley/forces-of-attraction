class View {

    constructor(_config, _data) {
        this.config = {
            parentId: _config.parentElement.substring(1),
            parentElement: _config.parentElement,
            margin: {top: 10, right: 10, bottom: 10, left: 10} // default margin
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg');

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.chart = vis.chartArea.append('g');
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getChart() {
        return this.chart;
    }

    updateSize() {
        // set the usable size as seen by subclass, i.e. the size of chartArea
        let svgHeight = document.getElementById(this.config.parentId).clientHeight;
        let svgWidth = document.getElementById(this.config.parentId).clientWidth;
        this.svg.attr('width', svgWidth).attr('height', svgHeight);
        this.width = svgWidth - this.config.margin.left - this.config.margin.right;
        this.height = svgHeight - this.config.margin.top - this.config.margin.bottom;
    }

    updateVis() {
        this.updateSize();
    }

    renderVis() {
        // placeholder
    }

}