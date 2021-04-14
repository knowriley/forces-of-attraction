// eslint-disable-next-line no-unused-vars
class LineChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 600,
            containerHeight: 40,
            margin: {
              top: 5, right: 0, bottom: 7, left: 20,
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
            .range([0, vis.config.width-30]);
        vis.yScale = d3.scaleLinear()
            .range([vis.config.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append axis groups
        vis.xAxisGroup = vis.chart.append('g')
            .attr('transform', `translate(0, ${vis.config.height})`)
            .attr('class', 'axis x-axis')
            .attr('display', 'none');
        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('display', 'none');

        // prepare data
        vis.processedData = [];
        for (let i = MIN_WAVE; i <= MAX_WAVE; i += 1) {
            let data = d3.filter(vis.data.nodes, (n) => n.waves.includes(i));
            vis.processedData.push({
                wave: i,
                count: data.length
            });
        }

        // make slider
        vis.slider = d3.sliderBottom()
            .min(MIN_WAVE)
            .max(MAX_WAVE)
            .width(vis.config.width-60)
            .ticks(MAX_WAVE)
            .step(1)
            .default(1)
            .on('onchange', val => {
              waveChangeUpdate(val);
            });

        vis.sliderGroup = d3.select('#waveSlider')
            .append('svg')
            .attr('width', vis.config.width)
            .attr('height', 50)
            .append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.bottom})`);

        d3.select('#waveValue').text((vis.slider.value()));

        vis.updateVis();
    }

    updateVis() {
        const vis = this;

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
        
        // define area func
        vis.areaFunc = d3.area()
            .x((d) => vis.xScale(vis.xValue(d)))
            .y0(vis.config.height)
            .y1((d) => vis.yScale(vis.yValue(d)));

        vis.renderVis();
    }

    renderVis() {
        const vis = this;

        // line
        vis.line = vis.chart.selectAll('.chart-line')
                .data([vis.processedData])
            .join('path')
                .attr('class', 'chart-line')
                .attr('d', vis.lineFunc);
        
        // area
        vis.area = vis.chart.selectAll(".area-path")
                .data([vis.processedData])
            .join('path')
                .attr("class", "area-path")
                .attr("d", vis.areaFunc);
        
        // add slider
        vis.sliderGroup.call(vis.slider);

        // Update the axes
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }

    setWave(w) {
        let vis = this;
        w = Math.round(w);
        d3.select('#waveValue').text(w);
        d3.select('#participantValue').text(vis.processedData.filter(d => d.wave == w)[0].count);
        vis.slider.value(w);
        this.wave = w;
    }
}