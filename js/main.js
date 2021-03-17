/**
 * Global Constants
 */
const NUM_OF_FIELDS = 19;
const NUM_OF_CAREERS = 18;
const NUM_OF_RACES = 7;
const NUM_OF_AGES = 56; //MAX_AGE (55) + 1

const fieldCodeToFieldGroupMapping = [ // 7 unique groups
  null,
  'Law', //Law
  'Science', //Math
  'Science', //Social Science, Psychologist 
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

  console.log(data);

  let matchData = getMatches(data);
  console.log(matchData);
  let demographicData = getSubjectDemographicdata(data);
  console.log(demographicData);

  getMatchingProbabilityByCareer(data, matchData, demographicData);
  getMatchingProbabilityByField(data, matchData, demographicData);
  getMatchingProbabilityByRace(data, matchData, demographicData);
  getMatchingProbabilityByAge(data, matchData, demographicData);

  // Init charts
  barChart = new BarChart({ parentElement: '#bar'}, data);
  forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#forceDirected'}, data);
  matrix = new Matrix({ parentElement: '#matric'}, data);

});

var getMatches = (data) => {
  return data.filter(d => d.match == 1 && d.gender == 1);
}

var getSubjectDemographicdata = (data) => {
  let map = new Map();
  data.forEach(d => {
    if (!map.has(d.iid)) {
      map.set(d.iid, {
        age: d.age,
        field_cd: d.field_cd,
        career_c: d.career_c,
        race: d.race,
        from: d.from
      });
    }
  });

  return map;
}

var getMatchingProbabilityByCareer = (data, matchData, demographicData) => {
  let allCount = new Array(NUM_OF_CAREERS);
  let matchCount = new Array(NUM_OF_CAREERS);
  let probability = new Array(NUM_OF_CAREERS);

  for (let i = 0; i < NUM_OF_CAREERS; i++) {
    allCount[i] = new Array(NUM_OF_CAREERS);
    allCount[i].fill(0);
    matchCount[i] = new Array(NUM_OF_CAREERS);
    matchCount[i].fill(0);
    probability[i] = new Array(NUM_OF_CAREERS);
    probability[i].fill(0);
  }

  data.forEach(d => {
    if (d.pid) {
      allCount[d.career_c][demographicData.get(d.pid).career_c]++;
    }
  });

  matchData.forEach(d => {
    if (d.pid) {
      matchCount[d.career_c][demographicData.get(d.pid).career_c]++;
    }
  });

  for (let i = 0; i < NUM_OF_CAREERS; i++) {
    for (let j = 0; j < NUM_OF_CAREERS; j++) {
      probability[i][j] = allCount[i][j] == 0 ? 0 : matchCount[i][j]/allCount[i][j];
    }
  }

  console.log(probability);

  return probability;
}

var getMatchingProbabilityByField = (data, matchData, demographicData) => {
  let allCount = new Array(NUM_OF_FIELDS);
  let matchCount = new Array(NUM_OF_FIELDS);
  let probability = new Array(NUM_OF_FIELDS);

  for (let i = 0; i < NUM_OF_FIELDS; i++) {
    allCount[i] = new Array(NUM_OF_FIELDS);
    allCount[i].fill(0);
    matchCount[i] = new Array(NUM_OF_FIELDS);
    matchCount[i].fill(0);
    probability[i] = new Array(NUM_OF_FIELDS);
    probability[i].fill(0);
  }

  data.forEach(d => {
    if (d.pid) {
      allCount[d.field_cd][demographicData.get(d.pid).field_cd]++;
    }
  });

  matchData.forEach(d => {
    if (d.pid) {
      matchCount[d.field_cd][demographicData.get(d.pid).field_cd]++;
    }
  });

  for (let i = 0; i < NUM_OF_FIELDS; i++) {
    for (let j = 0; j < NUM_OF_FIELDS; j++) {
      probability[i][j] = allCount[i][j] == 0 ? 0 : matchCount[i][j]/allCount[i][j];
    }
  }

  console.log(probability);

  return probability;
}

var getMatchingProbabilityByRace = (data, matchData, demographicData) => {
  let allCount = new Array(NUM_OF_RACES);
  let matchCount = new Array(NUM_OF_RACES);
  let probability = new Array(NUM_OF_RACES);

  for (let i = 0; i < NUM_OF_RACES; i++) {
    allCount[i] = new Array(NUM_OF_RACES);
    allCount[i].fill(0);
    matchCount[i] = new Array(NUM_OF_RACES);
    matchCount[i].fill(0);
    probability[i] = new Array(NUM_OF_RACES);
    probability[i].fill(0);
  }

  data.forEach(d => {
    if (d.pid) {
      allCount[d.race][demographicData.get(d.pid).race]++;
    }
  });

  matchData.forEach(d => {
    if (d.pid) {
      matchCount[d.race][demographicData.get(d.pid).race]++;
    }
  });

  for (let i = 0; i < NUM_OF_RACES; i++) {
    for (let j = 0; j < NUM_OF_RACES; j++) {
      probability[i][j] = allCount[i][j] == 0 ? 0 : matchCount[i][j]/allCount[i][j];
    }
  }

  console.log(probability);

  return probability;
}

var getMatchingProbabilityByAge = (data, matchData, demographicData) => {
  let allCount = new Array(NUM_OF_AGES);
  let matchCount = new Array(NUM_OF_AGES);
  let probability = new Array(NUM_OF_AGES);

  for (let i = 0; i < NUM_OF_AGES; i++) {
    allCount[i] = new Array(NUM_OF_AGES);
    allCount[i].fill(0);
    matchCount[i] = new Array(NUM_OF_AGES);
    matchCount[i].fill(0);
    probability[i] = new Array(NUM_OF_AGES);
    probability[i].fill(0);
  }

  data.forEach(d => {
    if (d.pid) {
      allCount[d.age][demographicData.get(d.pid).age]++;
    }
  });

  matchData.forEach(d => {
    if (d.pid) {
      matchCount[d.age][demographicData.get(d.pid).age]++;
    }
  });

  for (let i = 0; i < NUM_OF_AGES; i++) {
    for (let j = 0; j < NUM_OF_AGES; j++) {
      probability[i][j] = allCount[i][j] == 0 ? 0 : matchCount[i][j]/allCount[i][j];
    }
  }

  console.log(probability);

  return probability;
}