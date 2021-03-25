/**
 * Attribute group mapping
 * the index of the array correspond to the coded value, which map to a group
 */

const fieldCodeToFieldGroupMapping = [ // 7 unique groups
  null,
  'Law', //Law
  'Science', //Math
  'Arts', //Social Science, Psychologist 
  'Science', //Medical Science, Pharmaceuticals, and Bio Tech
  'Engineering', //Engineering
  'Arts', //English/Creative Writing/ Journalism
  'Arts', //History/Religion/Philosophy
  'Business', //Business/Econ/Finance
  'Education', //Education, Academia
  'Science', //Biological Sciences/Chemistry/Physics
  'Arts', //Social Work
  'Other', //Undergrad/ undecided
  'Arts', //Political Science/International Affairs
  'Arts', //Film
  'Arts', //Fine Arts/Arts Administration
  'Arts', //Languages
  'Engineering', //Architecture
  'Other', //Other
]

const careerCodeToCareerGroupMapping = [ // 8 unique groups
  null,
  'Law', //Lawyer
  'Arts', // Academic/ Research
  'Science', // Psychologist
  'Medicine', // Doctor/Medicine
  'Engineering', // Engineer
  'Arts', // Creative Arts/Entertainment
  'Business', // Banking/Consulting/Finance/Marketing/Business/CEO/Entrepreneur/Admin
  'Business', // Real Estate
  'Law', // International/Humanitarian Affairs
  'Other', // Undecided
  'Arts', // Social Work
  'Science', // Speech Pathology
  'Law', // Politics
  'Sports', // Pro sports/Athletics
  'Other', // Other
  'Arts', // Journalism
  'Engineering', // Architecture
]

// For matrix and barChart TODO: Do we but this in a utils or constants file?
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

/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/speedDating.csv').then(data => {
  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr != 'from') {
        d[attr] = +d[attr];
      }
    });
  });

  let femaleData = getGenderedData(data, 0);
  let maleData = getGenderedData(data, 1);
  
  let femaleMatchData = getMatches(femaleData, 0);
  let maleMatchData = getMatches(maleData, 1);

  let demographicData = getSubjectDemographicdata(data);

  let matrixData = getMatchingProbabilityMatrix(maleData, maleMatchData, demographicData, 'career_c');
  let barChartData = getMatchingProbabilityBars(maleData, maleMatchData, demographicData, 'career_c');
  //getMatchingProbabilityBars(femaleData, femaleMatchData, demographicData, 'career_c');

  const container = document.getElementById('vis-container');

  let updateSize = () => {
      let height = container.clientHeight;
      let width = container.clientWidth;
      d3.select(`#${container.id}`)
          .attr('class', width > height ? 'landscape' : 'portrait');
  }

  // Init charts
  barChart = new BarChart({ parentElement: '#bar'}, barChartData, 'career_c', 'Lawyer');
  forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#forceDirected'}, data);
  matrix = new Matrix({ parentElement: '#matrix'}, matrixData, 'career_c');

  let update = () => {
      updateSize();
      barChart.updateVis();
      forceDirectedGraph.updateVis();
      matrix.updateVis();
  }

  update();

  document.getElementById("colorByAttributeSelector").onchange = d => {
    let attribute = document.getElementById("colorByAttributeSelector").value;

    matrixData = getMatchingProbabilityMatrix(maleData, maleMatchData, demographicData, attribute);
    matrix.data = matrixData;
    matrix.attribute = attribute;

    barChartData = getMatchingProbabilityBars(maleData, maleMatchData, demographicData, attribute);
    console.log(barChartData);
    //getMatchingProbabilityBars(femaleData, femaleMatchData, demographicData, attribute);

    update();
  }

  d3.select(window).on('resize', update);

});

/**
  * Data pre-processing for adjacency matrix
  * The gender used for @param matchData and @param data does not influence the change the result BUT they MUST match,
  * the gender used for will be the row, and the opposite gender on the column.
  */
var getMatchingProbabilityMatrix = (data, matchData, demographicData, attribute) => {
  let limit = getAttributeSize(attribute);
  let allCount = new Array(limit);
  let matchCount = new Array(limit);
  let probability = new Array(limit);

  for (let i = 0; i < limit; i++) {
    allCount[i] = new Array(limit);
    allCount[i].fill(0);
    matchCount[i] = new Array(limit);
    matchCount[i].fill(0);
    probability[i] = new Array(limit);
    probability[i].fill(0);
  }

  data.forEach(d => {
    if (d.pid && d[attribute]) {
      allCount[d[attribute]][demographicData.get(d.pid)[attribute]]++;
    }
  });

  matchData.forEach(d => {
    if (d.pid) {
      matchCount[d[attribute]][demographicData.get(d.pid)[attribute]]++;
    }
  });

  for (let i = 0; i < limit; i++) {
    for (let j = 0; j < limit; j++) {
      probability[i][j] = allCount[i][j] == 0 ? 0 : matchCount[i][j]/allCount[i][j];
    }
  }

  return probability;
}

/**
  * Data pre-processing for bar chart
  * The gender used for @param matchData and @param data will the result AND they MUST match,
  */
var getMatchingProbabilityBars = (data, matchData, demographicData, attribute) => {
  let limit = getAttributeSize(attribute);
  let total = new Array(limit); //total number of pairing for each value of an attribute for a gender;
  let totalMatches = new Array(limit); //total number of matches for each value of an attribute;
  total.fill(0);
  totalMatches.fill(0);

  let matchCount = new Array(limit);
  let probability = new Array(limit);

  for (let i = 0; i < limit; i++) {
    matchCount[i] = new Array(limit);
    matchCount[i].fill(0);
    probability[i] = new Array(limit+1);
    probability[i].fill(0);
  }

  data.forEach(d => {
    total[d[attribute]]++;
  });

  matchData.forEach(d => {
    if (d.pid) {
      matchCount[d[attribute]][demographicData.get(d.pid)[attribute]]++;
      totalMatches[d[attribute]]++;
    }
  });

  for (let i = 0; i < limit; i++) {
    for (let j = 0; j < limit; j++) {
      probability[i][j] = total[i] == 0 ? 0 : matchCount[i][j]/total[i];
    }
    probability[i][limit] = total[i] == 0 ? 0 : (total[i]-totalMatches[i])/total[i]; //last column indicates probability of not getting any match
  }

  return probability;
}

