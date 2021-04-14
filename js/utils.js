/**
 * Global Constants
 */
const NUM_OF_FIELDS = 19;
const NUM_OF_CAREERS = 18;
const NUM_OF_RACES = 6; // MAX_RACES (5) + 1
const NUM_OF_AGES = 56; // MAX_AGE (55) + 1
const NONE = 'none';
const MIN_WAVE = 1;
const MAX_WAVE = 21;

/**
 * Attribute group mapping
 * the index of the array correspond to the coded value, which map to a group
 */

// eslint-disable-next-line no-unused-vars
const fieldCodeToFieldGroupMapping = [ // 7 unique groups
  null,
  'Law', // Law
  'Science', // Math
  'Arts', // Social Science, Psychologist
  'Science', // Medical Science, Pharmaceuticals, and Bio Tech
  'Engineering', // Engineering
  'Arts', // English/Creative Writing/ Journalism
  'Arts', // History/Religion/Philosophy
  'Business', // Business/Econ/Finance
  'Education', // Education, Academia
  'Science', // Biological Sciences/Chemistry/Physics
  'Arts', // Social Work
  'Other', // Undergrad/ undecided
  'Arts', // Political Science/International Affairs
  'Arts', // Film
  'Arts', // Fine Arts/Arts Administration
  'Arts', // Languages
  'Engineering', // Architecture
  'Other', // Other
];

// eslint-disable-next-line no-unused-vars
const careerCodeToCareerGroupMapping = [ // 8 unique groups
  null,
  'Law', // Lawyer
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
];

// eslint-disable-next-line no-unused-vars
const careerCodeToCareerMapping = [
  '',
  'Lawyer',
  'Academic/Researcher',
  'Psychologist',
  'Medical Professional',
  'Engineer',
  'Artist/Entertainer',
  'Business',
  'Real Estate Agent',
  'International/Humanitarian Affairs',
  'TODO (Undecided)',
  'Social Worker',
  'Speech Pathologist',
  'Politician',
  'Athlete',
  'Other',
  'Journalist',
  'Architect',
];

// eslint-disable-next-line no-unused-vars
const fieldCodeToFieldMapping = [
  '',
  'Law',
  'Math',
  'Social Science/Psychology',
  'Medicine/Pharmacy/Bio Tech',
  'Engineering',
  'English/Creative Writing/Journalism',
  'History/Religion/Philosophy',
  'Business/Econ/Finance',
  'Research',
  'Biology/Chemistry/Physics',
  'Social Work',
  'Undecided',
  'Political Science/International Affairs',
  'Film',
  'Fine Arts/Arts Administration',
  'Languages',
  'Architecture',
  'Other',
];

// eslint-disable-next-line no-unused-vars
const raceCodeToRaceMapping = [
  '',
  'Black/African American',
  'European/Caucasian-American',
  'Latino/Hispanic American',
  'Asian/Pacific Islander/Asian-American',
  'Other',
];

// eslint-disable-next-line no-unused-vars
const getGenderedData = (data, gender) => data.filter((d) => d.gender === gender);

// eslint-disable-next-line no-unused-vars
const getMatches = (data) => data.filter((d) => d.match === 1);

// eslint-disable-next-line no-unused-vars
const getSubjectDemographicdata = (data, _) => {
  const map = new Map();
  data.forEach((d) => {
    if (!map.has(d.iid)) {
      map.set(d.iid, {
        age: d.age,
        field_cd: d.field_cd,
        career_c: d.career_c,
        race: d.race,
        from: d.from,
      });
    }
  });

  return map;
};

const defaultNA = 'Not specified';

/*
    Accepts an attribute name and produces a map
    for an arbitrary value in that attribute's domain
    to a more meaningful representative. For example,
    maps gender codes from their numerical value to
    the human-readable name.
*/
// eslint-disable-next-line no-unused-vars
const decode = (attr) => (d) => {
  const v = d[attr];
  switch (attr) {
    case 'gender':
      return v ? 'Male' : 'Female';
    case 'field_cd':
      return v ? fieldCodeToFieldGroupMapping[v] : defaultNA;
    case 'career_c':
      return v ? careerCodeToCareerGroupMapping[v] : defaultNA;
    case 'race':
      return v ? raceCodeToRaceMapping[v] : defaultNA;
    case 'age' :
      return v ? getAgeGroupLabel(v) : defaultNA;
    default:
      return v;
  }
};

/*
    Determine the cardinality of the given attribute
*/
// eslint-disable-next-line no-unused-vars
const getAttributeSize = (attribute) => {
  switch (attribute) {
    case 'career_c': return NUM_OF_CAREERS;
    case 'field_cd': return NUM_OF_FIELDS;
    case 'race': return NUM_OF_RACES;
    case 'age': return NUM_OF_AGES;
    default: return 0;
  }
};

/*
    Produce all unique values of an attribute
*/
// eslint-disable-next-line no-unused-vars
const unique = (data, acc) => new Set(d3.map(data, acc));

// eslint-disable-next-line no-unused-vars
const getLabel = (attribute, code) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping[code];
    case 'field_cd': return fieldCodeToFieldMapping[code];
    case 'race': return raceCodeToRaceMapping[code];
    case 'age': return code;
    default: return '';
  }
};

// eslint-disable-next-line no-unused-vars
const getDefaultLabel = (attribute) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping[1];
    case 'field_cd': return fieldCodeToFieldMapping[1];
    case 'race': return raceCodeToRaceMapping[1];
    case 'age': return '20';
    default: return '';
  }
};

const getDefautGender = () => {
  return 'male';
}

// eslint-disable-next-line no-unused-vars
const getCode = (attribute, label) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping.indexOf(label);
    case 'field_cd': return fieldCodeToFieldMapping.indexOf(label);
    case 'race': return raceCodeToRaceMapping.indexOf(label);
    case 'age': return label;
    default: return '';
  }
};

const getOtherGender = (gender) => {
  switch (gender) {
    case 'male': return 'female';
    case 'female': return 'male';
    default: return '';
  }
}

const getAgeGroupLabel = (age) => {
  if (age <= 24) {
    return '20-24';
  } else if (age <= 29) {
    return '25-29';
  } else if (age <= 34) {
    return '30-34';
  } else if (age <= 39) {
    return '35-39';
  } else {
    return '40-45';
  }
}