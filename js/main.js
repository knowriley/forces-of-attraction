/**
 *      <3    FORCES OF ATTRACTION   <3
 *
 * Riley Knowles, Thanky To, Rowan Lindsay
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
  const DEFAULT_ATTRIBUTE = 'career_c';

  // filter for probability calculations
  const femaleData = getGenderedData(data, 0);
  const maleData = getGenderedData(data, 1);

  const femaleMatchData = getMatches(femaleData, 0);
  const maleMatchData = getMatches(maleData, 1);

  const demographicData = getSubjectDemographicdata(data);

  // construct view-specific datasets
  let matrixData = getMatrixData(maleData, maleMatchData, demographicData, DEFAULT_ATTRIBUTE);
  let barChartData = getBarChartData(maleData, maleMatchData, demographicData, DEFAULT_ATTRIBUTE);

  // DOCUMENT PHASE

  // Query the container that holds all visualization elements
  const container = document.getElementById('vis-container');

  // Events are triggered and handled using D3-dispatch
  const dispatch = d3.dispatch('matrixLabelClick', 'matrixCellClick');

  // Initialize charts
  lineChart = new LineChart({ parentElement: '#line'}, getGraphData(data));
  barChart = new BarChart({ parentElement: '#bar' }, barChartData, DEFAULT_ATTRIBUTE, getDefaultLabel(DEFAULT_ATTRIBUTE), getDefautGender());
  forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#forceDirected' , dispatch: dispatch}, getGraphData(data), 'career_c');
  matrix = new Matrix({ parentElement: '#matrix', dispatch }, matrixData, DEFAULT_ATTRIBUTE, getDefaultLabel(DEFAULT_ATTRIBUTE), getDefautGender());
  legend = new Legend('#legend', forceDirectedGraph.colorDomain, forceDirectedGraph.colorScale);

  // Set up a routine to call any required functions when document state changes
  this.update = () => {
    barChart.updateVis();
    forceDirectedGraph.updateVis();
    lineChart.updateVis();
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

    matrixData = getMatrixData(maleData, maleMatchData, demographicData, attribute);
    matrix.data = matrixData;
    matrix.attribute = attribute;
    matrix.selectedLabel = getDefaultLabel(attribute);
    matrix.selectedGender = getDefautGender();
    matrix.highlightedMaleLabel = NONE;
    matrix.highlightedFemaleLabel = NONE;

    barChartData = getBarChartData(maleData, maleMatchData, demographicData, attribute);
    barChart.data = barChartData;
    barChart.attribute = attribute;
    barChart.selectedLabel = getDefaultLabel(attribute);
    barChart.selectedGender = getDefautGender();

    forceDirectedGraph.highlightedMaleLabel = NONE;
    forceDirectedGraph.highlightedFemaleLabel = NONE;
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

  // Event handler for matrix label click
  dispatch.on('matrixLabelClick', (selected, gender) => {
    if (gender === NONE) {

    } else if (gender === 'male') {
      barChartData = getBarChartData(maleData,
        maleMatchData, demographicData, matrix.attribute);
    } else {
      barChartData = getBarChartData(femaleData,
        femaleMatchData, demographicData, matrix.attribute);
    }

    matrix.selectedLabel = selected;
    matrix.selectedGender = gender;

    barChart.data = barChartData;
    barChart.selectedLabel = selected;
    barChart.selectedGender = gender;

    update();
  });

  // Event handler for matrix cell click
  dispatch.on('matrixCellClick', (highlightedMaleLabel, highlightedFemaleLabel) => {
    matrix.highlightedMaleLabel = highlightedMaleLabel;
    matrix.highlightedFemaleLabel = highlightedFemaleLabel;

    forceDirectedGraph.highlightedMaleLabel = highlightedMaleLabel;
    forceDirectedGraph.highlightedFemaleLabel = highlightedFemaleLabel;

    update();
  });

  // Set up updates for any change to viewbox dimensions
  d3.select(window).on('resize', update);
});

// helper func to handle slider updates
const waveChangeUpdate = (wave) => {
  forceDirectedGraph.setWave(wave);
  lineChart.setWave(wave);
  this.update();
};

/**
  * Data pre-processing for adjacency matrix
  * The gender used for @param matchData and @param data does not influence the
  * change the result BUT they MUST match,
  * the gender used for will be the row, and the opposite gender on the column.
  */
const getMatrixData = (data, matchData, demographicData, attribute) => {
  const limit = getAttributeSize(attribute);
  const allCount = new Array(limit);
  const matchCount = new Array(limit);
  const matrixData = new Array(limit);

  for (let i = 0; i < limit; i += 1) {
    allCount[i] = new Array(limit);
    allCount[i].fill(0);
    matchCount[i] = new Array(limit);
    matchCount[i].fill(0);
    matrixData[i] = new Array(limit);
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
      matrixData[i][j] = {
        probability: allCount[i][j] === 0 ? 0 : matchCount[i][j] / allCount[i][j],
        match:  matchCount[i][j],
        pair: allCount[i][j]
      }
    }
  }

  return matrixData;
};

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
const getBarChartData = (data, matchData, demographicData, attribute) => {
  const limit = getAttributeSize(attribute);
  const total = new Array(limit); // total no of pairing for each value of an attribute for a gender
  const totalMatches = new Array(limit); // total number of matches for each value of an attribute;
  total.fill(0);
  totalMatches.fill(0);

  const matchCount = new Array(limit);
  const pairCount = new Array(limit);
  const barChartData = new Array(limit);

  for (let i = 0; i < limit; i += 1) {
    matchCount[i] = new Array(limit);
    matchCount[i].fill(0);
    pairCount[i] = new Array(limit);
    pairCount[i].fill(0);
    barChartData[i] = new Array(limit + 1);
  }

  data.forEach((d) => {
    if (d.pid) {
      pairCount[d[attribute]][demographicData.get(d.pid)[attribute]] += 1;
    }
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
      barChartData[i][j] = {
        probability : total[i] === 0 ? 0 : matchCount[i][j] / total[i],
        match: matchCount[i][j],
        pair: pairCount[i][j]
      };
    }

    // last column indicates probability of getting any match
    barChartData[i][limit] = {
      probability: total[i] === 0 ? 0 :  totalMatches[i] / total[i],
      match: totalMatches[i],
      pair: total[i]
    };
  }

  return barChartData;
};

/*
    Fields to map to participant nodes for tooltip/detail views
*/
const detailFields = [
  'gender', 'age', 'field_cd', 'undergrd', 'race', 'from', 'zipcode', 'career_c',
];
// create filtered object
const mapDetails = (d) => {
  const dts = {};
  detailFields.forEach((f) => { dts[f] = d[f]; });
  return dts;
};

/*
    Construct node-link structure from the data, used for network-type
    visualization.
*/
const getGraphData = (data) => {
  const nodes = {};
  // const partnerNodes = {};
  const links = [];

  data.forEach((d) => {
    const iid = `${d.iid}`;
    const pid = `${d.pid}`;
    if (!nodes[iid]) {
      // new node from iid, we use the data from this record
      nodes[iid] = {
        id: iid, ...mapDetails(d), waves: [d.wave], complete: true,
      };
    } else {
      // existing node
      // record wave inclusion
      if (!nodes[iid].waves.includes(d.wave)) {
        nodes[iid].waves.push(d.wave);
      }
      const n = nodes[iid];
      // copy record data if existing node is incomplete
      // these means that node n was first encountered as
      // a partner
      if (!n.complete) {
        nodes[iid] = {
          id: iid,
          ...mapDetails(d),
          waves: n.waves,
          complete: true,
        };
      }
    }
    if (!nodes[pid]) {
      // new node from pid mark data as incomplete
      nodes[pid] = {
        id: pid, waves: [d.wave], complete: false,
      };
    }
    // record wave inclusion of partner
    if (!nodes[pid].waves.includes(d.wave)) {
      nodes[pid].waves.push(d.wave);
    }
    links.push({
      source: iid,
      target: pid,
      like: d.like,
      match: d.match,
      wave: d.wave,
    });
  });
  const graphData = {
    nodes: Object.keys(nodes).map((k) => nodes[k]),
    links,
  };
  return graphData;
};
