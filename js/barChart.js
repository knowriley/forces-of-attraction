// const careerCodeToCareerMapping = [
//   '',
//   'Lawyer',
//   'Academic/ Research',
//   'Psychologist',
//   'Doctor/Medicine',
//   'Engineer',
//   'Creative Arts/Entertainment',
//   'Banking/Consulting/Finance/Marketing/Business/CEO/Entrepreneur/Admin',
//   'Real Estate',
//   'International/Humanitarian Affairs',
//   'Undecided',
//   'Social Work',
//   'Speech Pathology',
//   'Politics',
//   'Pro sports/Athletics',
//   'Other',
//   'Journalism',
//   'Architecture'
// ]

// const fieldCodeToFieldMapping = [
//   '',
//   'Law',
//   'Math',
//   'Social Science, Psychologist',
//   'Medical Science, Pharmaceuticals, and Bio Tech',
//   'Engineering',
//   'English/Creative Writing/ Journalism',
//   'History/Religion/Philosophy',
//   'Business/Econ/Finance',
//   'Education, Academia',
//   'Biological Sciences/Chemistry/Physics',
//   'Social Work',
//   'Undergrad/ undecided',
//   'Political Science/International Affairs',
//   'Film',
//   'Fine Arts/Arts Administration',
//   'Languages',
//   'Architecture',
//   'Other'
// ]

// const raceCodeToRaceMapping = [
//   '',
//   'Black/African American',
//   'European/Caucasian-American',
//   'Latino/Hispanic American',
//   'Asian/Pacific Islander/Asian-American',
//   'Native American',
//   'Other'
// ]

class BarChart {

    constructor(_config, _data, _attribute) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 500,
        containerHeight: 350,
        margin: {top: 15, right: 15, bottom: 20, left: 25}
      }
      this.data = _data;
      this.attribute = _attribute;
      this.initVis();
    }

    initVis() {
      let vis = this;
        
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement).append('svg')
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);

      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chartArea = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
      vis.chart = vis.chartArea.append('g');

      // init scales
      vis.xScale = d3.scaleLinear()
          .domain([0, 100])
          .range([0, vis.width]);
      vis.yScale = d3.scaleBand()
          .range([0, vis.height])
          .paddingInner(0.2);

      // init axes
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(10)
          .tickSize(-vis.height)
          .tickSizeOuter(0);
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(['Law',
              'Arts',
              'Science', 
              'Medicine', 
              'Engineering',
              'Business',
              'Other',
              'Sports']);

      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);

      // Append y-axis group 
      vis.yAxisG = vis.chartArea.append('g')
          .attr('class', 'axis y-axis');

      // Append axis title
      vis.svg.append('text')
          .attr('class', 'chart-title')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', '.80em')
          .text('Probability of TODO');

    }

    updateVis() {
      let vis = this;
      console.log(vis.data);

      vis.renderVis();
    }

    renderVis() {
      let vis = this;
        
      vis.xAxisG.call(vis.xAxis)
        .selectAll('text')
        .attr('y', 0)
        .attr('x', -10)
        .style('text-anchor', 'end'); //https://bl.ocks.org/mbostock/4403522;
      vis.yAxisG.call(vis.yAxis);
    }

    getLabel = (code) => {
      let vis = this;
      switch (vis.attribute) {
        case 'career_c': return careerCodeToCareerMapping[code];
        case 'field_cd': return fieldCodeToFieldMapping[code];
        case 'race': return raceCodeToRaceMapping[code];
        case 'age': return code;
        default: return '';
      }
    }

}