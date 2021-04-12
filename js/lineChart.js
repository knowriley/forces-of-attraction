// eslint-disable-next-line no-unused-vars
class LineChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 1000,
            containerHeight: 100,
            margin: {
              top: 5, right: 10, bottom: 5, left: 10,
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

        vis.chartArea = vis.svg.append('g');

        // Actual line
        vis.chart = vis.chartArea.append('g')          
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);


        // Initialize scales and axes
        vis.xScale = d3.scaleBand()
            .range([0, vis.config.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.config.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append axis groups
        vis.xAxisGroup = vis.chart.append('g')
            .attr('transform', `translate(0,${vis.config.height - 20})`)
            .attr('class', 'axis x-axis')
            .attr('display', 'none');
        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('display', 'none');
        
        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // prepare data
        vis.processedData = [];
        for (let i = 1; i <= 21; i += 1) {
            let data = d3.filter(vis.data.nodes, (n) => n.waves.includes(i));
            vis.processedData.push({
                wave: i,
                count: data.length
            });
        }

        // accessor funcs
        vis.xValue = (d) => d.wave;
        vis.yValue = (d) => d.count;

        // update y-axis
        vis.xScale.domain(vis.processedData.map(vis.xValue));
        vis.yScale.domain([0, d3.max(vis.processedData, vis.yValue)]);

        // define line func
        vis.lineFunc = d3.line()
            .x(d => vis.xScale(vis.xValue(d)))
            .y(d => vis.yScale(vis.yValue(d)));

        vis.renderVis();
    }

    renderVis() {
        const vis = this;

        vis.points = vis.chart.selectAll('.point')
                .data(vis.processedData)
            .join('circle')
            .attr('r', 2)
            .attr('fill', 'red')
            .attr('cx', (d) => vis.xScale(vis.xValue(d)))
            .attr('cy', (d) => vis.yScale(vis.yValue(d)));
        
        vis.line = vis.chart.selectAll('.chart-line')
                .data([vis.processedData])
            .join('path')
                .attr('class', 'chart-line')
                .attr('d', vis.lineFunc);
        
        // Update the axes
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }

    setWave(w) {
        this.wave = w;
      }
}