const careerCodeToCareerMapping = [
  '',
  'Lawyer',
  'Academic/ Research',
  'Psychologist',
  'Doctor/Medicine',
  'Engineer',
  'Creative Arts/Entertainment',
  'Banking/Consulting/Finance/Marketing/Business/CEO/Entrepreneur/Admin',
  'Real Estate',
  'International/Humanitarian Affairs',
  'Undecided',
  'Social Work',
  'Speech Pathology',
  'Politics',
  'Pro sports/Athletics',
  'Other',
  'Journalism',
  'Architecture'
]

const fieldCodeToFieldMapping = [
  '',
  'Law',
  'Math',
  'Social Science, Psychologist',
  'Medical Science, Pharmaceuticals, and Bio Tech',
  'Engineering',
  'English/Creative Writing/ Journalism',
  'History/Religion/Philosophy',
  'Business/Econ/Finance',
  'Education, Academia',
  'Biological Sciences/Chemistry/Physics',
  'Social Work',
  'Undergrad/ undecided',
  'Political Science/International Affairs',
  'Film',
  'Fine Arts/Arts Administration',
  'Languages',
  'Architecture',
  'Other'
]

const raceCodeToRaceMapping = [
  '',
  'Black/African American',
  'European/Caucasian-American',
  'Latino/Hispanic American',
  'Asian/Pacific Islander/Asian-American',
  'Native American',
  'Other'
]

class Matrix {

  constructor(_config, _data, _attribute) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 500,
      containerHeight: 500,
      margin: { top: 100, right: 20, bottom: 20, left: 100 }
    }
    this.data = _data;
    this.attribute = _attribute;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

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
    vis.colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateGreens);

    vis.xScale = d3.scaleBand()
      .range([0, vis.config.width])
      .paddingInner(0.2);

    vis.yScale = d3.scaleBand()
      .range([0, vis.config.height])
      .paddingInner(0.2);

    vis.xAxis = d3.axisTop(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    // Append axis groups
    vis.xAxisGroup = vis.chart.append('g')
      .attr('class', 'axis x-axis');

    vis.yAxisGroup = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.cellData = [];

    for (let i = 1; i < vis.data.length; i++) {
      for (let j = 1; j < vis.data[0].length; j++) {
        vis.cellData.push({
          row: i,
          col: j,
          rowLabel: vis.getLabel(i),
          colLabel: vis.getLabel(j),
          value: vis.data[i][j]
        });
      }
    }

    vis.xValue = d => d.colLabel;
    vis.yValue = d => d.rowLabel;
    vis.colorValue = d => d.value;

    vis.colorScale.domain(d3.extent(vis.cellData.map(vis.colorValue)));
    vis.xScale.domain(vis.cellData.map(vis.xValue));
    vis.yScale.domain(vis.cellData.map(vis.yValue));

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const cellWidth = vis.config.width / vis.xScale.domain().length;
    const cellHeight = vis.config.height / vis.yScale.domain().length;

    const cell = vis.chart.selectAll('.cell')
      .data(vis.cellData);

    // Enter
    const cellEnter = cell.enter().append('rect')

    // Enter + update
    cellEnter.merge(cell)
      .transition().duration(1000)
      .attr('class', 'cell')
      .attr('x', d => (d.col - 1) * cellWidth) //-1 because code are 1-indexed
      .attr('y', d => (d.row - 1) * cellHeight)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('stroke', d => {
        if (vis.attribute == 'age') {
          if (d.col < d.row/2+7 || d.row < d.col/2+7 ) {
            return 'grey';
          } // show "Half-your-age-plus-seven" rule
        }

        return 'white';
      })
      .attr('fill', d => d.col == 0 || d.row == 0 ? 'white' : vis.colorScale(vis.colorValue(d)));

    cellEnter.on('mouseover', (e, d) => { //Tooltip: https://github.com/UBC-InfoVis/2021-436V-case-studies/blob/097d13b05d587f4fab3e3fcd23f5e99274397c2c/case-study_measles-and-vaccines/css/style.css
      d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (e.pageX) + 'px')
        .style('top', (e.pageY) + 'px')
        .html(`
          <div>A male ${vis.getLabel(d.row)} and </div>
          <div>a female ${vis.getLabel(d.col)} </div>
          <div>matches ${d3.format('.0%')(d.value)} of the time.</div>
        `);
    })
    .on('mouseout', (e, d) => {
      d3.select('#tooltip').style('display', 'none');
    });

    // Exit
    cell.exit().remove();

    // Update axes
    vis.xAxisGroup.call(vis.xAxis)
      .selectAll('text')
      .attr("y", 0)
      .attr("x", -10)
      .attr('transform', 'rotate(90)')
      .style('text-anchor', 'end'); //https://bl.ocks.org/mbostock/4403522;
    vis.yAxisGroup.call(vis.yAxis);
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
