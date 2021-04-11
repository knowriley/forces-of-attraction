// eslint-disable-next-line no-unused-vars
class LineChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.parentElement.containerWidth,
            containerHeight: 200,
            margin: {
              top: 20, right: 20, bottom: 20, left: 20,
            },
          };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // init wave state
        vis.wave = 1;
        
        // Calculate margins
        vis.config.width = vis.config.containerWidth
            - vis.config.margin.left - vis.config.margin.right;
        vis.config.height = vis.config.containerHeight
            - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart
        // and position it according to the given margin config
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.chart = vis.chartArea.append('g');

        // Initialize scales and axes
         vis.xScale = d3.scaleBand()
            .range([0, vis.config.width])
            .paddingInner(0.2);
        vis.yScale = d3.scaleLinear()
            .range([0, vis.config.height])
            .paddingInner(0.2);

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append axis groups
        vis.xAxisGroup = vis.chart.append('g')
            .attr('transform', `translate(0,${vis.config.height})`)
            .attr('class', 'axis x-axis');
        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis');
        
        vis.updateVis();
    }

    updateVis() {
        const vis = this;
        let data = d3.filter(vis.data.nodes, (n) => n.waves.includes(vis.wave));
        console.log(data);
        vis.renderVis();
    }

    renderVis() {
        const vis = this;
        // TODO
    }

    setWave(w) {
        this.wave = w;
      }
}