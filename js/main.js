/**
 *      <3    FORCES OF ATTRACTION   <3
 *
 * Rowan Lindsay, Thanky To, Rowan Lindsay
 *
 * Main script
 * Load data from CSV file asynchronously, process, and render charts
 */
d3.csv('data/speedDating.csv').then((data) => {
  // CLEANING PHASE

  // Convert columns to numerical values
  data.forEach((d) => {
    Object.keys(d).forEach((attr) => {
      if (attr !== 'from') {
        d[attr] = +d[attr];
      }
    });
  });

  // PROCESSING PHASE

  // filter for probability calculations
  const femaleData = getGenderedData(data, 0);
  const maleData = getGenderedData(data, 1);

  const femaleMatchData = getMatches(femaleData, 0);
  const maleMatchData = getMatches(maleData, 1);

  const demographicData = getSubjectDemographicdata(data);

  // construct view-specific datasets
  let matrixData = getMatchingProbabilityMatrix(maleData, maleMatchData, demographicData, 'career_c');
  let barChartData = getMatchingProbabilityBars(maleData, maleMatchData, demographicData, 'career_c');

  // DOCUMENT PHASE

  // Query the container that holds all visualization elements
  const container = document.getElementById('vis-container');

  // Set up updates to element class based on dimensions
  const updateSize = () => {
    const height = container.clientHeight;
    const width = container.clientWidth;
    d3.select(`#${container.id}`)
      .attr('class', width > height ? 'landscape' : 'portrait');
  };

  // Events are triggered and handled using D3-dispatch
  const dispatch = d3.dispatch('matrixClick');

  // Initialize charts
  barChart = new BarChart({ parentElement: '#bar' }, barChartData, 'career_c', 'Lawyer');
  forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#forceDirected' }, getGraphData(data, 1), 'career_c');
  matrix = new Matrix({ parentElement: '#matrix', dispatch }, matrixData, 'career_c');
  legend = new Legend('#legend', forceDirectedGraph.colorDomain, forceDirectedGraph.colorScale);

  // Set up a routine to call any required functions when document state changes
  const update = () => {
    updateSize();
    barChart.updateVis();
    forceDirectedGraph.updateVis();
    matrix.updateVis();
    legend.set(forceDirectedGraph.colorDomain, forceDirectedGraph.colorScale);
    legend.updateVis();
  };

  // Do the first update
  update();

  // Behaviour for global color attribute selection. This computes data for all
  // views and updates them where appropriate.
  document.getElementById('colorByAttributeSelector').onchange = (_) => {
    const attribute = document.getElementById('colorByAttributeSelector').value;

    matrixData = getMatchingProbabilityMatrix(maleData, maleMatchData, demographicData, attribute);
    matrix.data = matrixData;
    matrix.attribute = attribute;

    barChartData = getMatchingProbabilityBars(maleData, maleMatchData, demographicData, attribute);

    barChart.data = barChartData;
    barChart.attribute = attribute;
    barChart.selected = getDefaultLabel(attribute);
    barChart.gender = 'male';

    forceDirectedGraph.setAttribute(attribute);

    update();
  };

  // Behaviour for user-selection of attractive force, refers only to the
  // force-simulation.
  document.getElementById('attractByAttributeSelector').onchange = (_) => {
    const dist = document.getElementById('attractByAttributeSelector').value;
    forceDirectedGraph.setNodeDistance(dist);
    update();
  };

  document.getElementById('waveInput').onchange = (_) => {
    const wave = document.getElementById('waveInput').value;
    d3.select('#waveIndicator')
      .text(`Wave: ${wave}`);
    forceDirectedGraph.data = getGraphData(data, wave);
    update();
  };

  // Event handler for matrix
  dispatch.on('matrixClick', (selected, gender) => {
    if (gender === 'male') {
      barChartData = getMatchingProbabilityBars(maleData,
        maleMatchData, demographicData, matrix.attribute);
    } else {
      barChartData = getMatchingProbabilityBars(femaleData,
        femaleMatchData, demographicData, matrix.attribute);
    }

    barChart.data = barChartData;
    barChart.selected = selected;
    barChart.gender = gender;
    barChart.updateVis();
  });

  // Set up updates for any change to viewbox dimensions
  d3.select(window).on('resize', update);
});

/**
  * Data pre-processing for adjacency matrix
  * The gender used for @param matchData and @param data does not influence the
  * change the result BUT they MUST match,
  * the gender used for will be the row, and the opposite gender on the column.
  */
const getMatchingProbabilityMatrix = (data, matchData, demographicData, attribute) => {
  const limit = getAttributeSize(attribute);
  const allCount = new Array(limit);
  const matchCount = new Array(limit);
  const probability = new Array(limit);

  for (let i = 0; i < limit; i += 1) {
    allCount[i] = new Array(limit);
    allCount[i].fill(0);
    matchCount[i] = new Array(limit);
    matchCount[i].fill(0);
    probability[i] = new Array(limit);
    probability[i].fill(0);
  }

  data.forEach((d) => {
    if (d.pid && d[attribute]) {
      allCount[d[attribute]][demographicData.get(d.pid)[attribute]] += 1;
    }
  });

  matchData.forEach((d) => {
    if (d.pid) {
      matchCount[d[attribute]][demographicData.get(d.pid)[attribute]] += 1;
    }
  });

  for (let i = 0; i < limit; i += 1) {
    for (let j = 0; j < limit; j += 1) {
      probability[i][j] = allCount[i][j] === 0 ? 0 : matchCount[i][j] / allCount[i][j];
    }
  }

  return probability;
};

/**
  * Data pre-processing for bar chart
  * The gender used for @param matchData and @param data will the result AND they MUST match,
  */
const getMatchingProbabilityBars = (data, matchData, demographicData, attribute) => {
  const limit = getAttributeSize(attribute);
  const total = new Array(limit); // total no of pairing for each value of an attribute for a gender
  const totalMatches = new Array(limit); // total number of matches for each value of an attribute;
  total.fill(0);
  totalMatches.fill(0);

  const matchCount = new Array(limit);
  const probability = new Array(limit);

  for (let i = 0; i < limit; i += 1) {
    matchCount[i] = new Array(limit);
    matchCount[i].fill(0);
    probability[i] = new Array(limit + 1);
    probability[i].fill(0);
  }

  data.forEach((d) => {
    total[d[attribute]] += 1;
  });

  matchData.forEach((d) => {
    if (d.pid) {
      matchCount[d[attribute]][demographicData.get(d.pid)[attribute]] += 1;
      totalMatches[d[attribute]] += 1;
    }
  });

  for (let i = 0; i < limit; i += 1) {
    for (let j = 0; j < limit; j += 1) {
      probability[i][j] = total[i] === 0 ? 0 : matchCount[i][j] / total[i];
    }
    // last column indicates probability of not getting any match
    probability[i][limit] = total[i] === 0
      ? 0 : (total[i] - totalMatches[i]) / total[i];
  }

  return probability;
};

/*
    Fields to map to participant nodes for tooltip/detail views
*/
const detailFields = [
  'gender', 'age', 'field_cd', 'undergrd', 'race', 'from', 'zipcode', 'career_c', 'wave',
];
// create filtered object
const mapDetails = (d) => {
  const dts = {};
  detailFields.forEach((f) => { dts[f] = d[f]; });
  return dts;
};

const getGraphData = (data, wave) => {
  const nodes = {};
  const links = [];

  data.forEach((d) => {
    const iid = `${d.iid}`;
    const pid = `${d.pid}`;
    if (d.wave === wave) {
      if (!nodes[iid]) {
        nodes[iid] = { id: iid, ...mapDetails(d) };
      }
      if (!nodes[pid]) {
        nodes[pid] = { id: pid, ...mapDetails(d) };
      }
      links.push({
        source: iid,
        target: pid,
        like: d.like,
        match: d.match,
      });
    }
  });
  return {
    nodes: Object.keys(nodes).map((k) => nodes[k]),
    links,
  };
};
