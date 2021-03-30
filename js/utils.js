/**
 * Global Constants
 */
const NUM_OF_FIELDS = 19;
const NUM_OF_CAREERS = 18;
const NUM_OF_RACES = 7; //MAX_AGE (6) + 1
const NUM_OF_AGES = 56; //MAX_AGE (55) + 1

var getGenderedData = (data, gender) => {
  return data.filter(d => d.gender == gender);
}

var getMatches = (data) => {
  return data.filter(d => d.match == 1);
}

var getSubjectDemographicdata = (data, countries) => {
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

var getAttributeSize = (attribute) => {
  switch(attribute) {
    case 'career_c': return NUM_OF_CAREERS;
    case 'field_cd': return NUM_OF_FIELDS;
    case 'race': return NUM_OF_RACES;
    case 'age': return NUM_OF_AGES;
    default: return 0;
  }
}

var getLabel = (attribute, code) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping[code];
    case 'field_cd': return fieldCodeToFieldMapping[code];
    case 'race': return raceCodeToRaceMapping[code];
    case 'age': return code;
    default: return '';
  }
}

var getDefaultLabel = (attribute) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping[1];
    case 'field_cd': return fieldCodeToFieldMapping[1];
    case 'race': return raceCodeToRaceMapping[1];
    case 'age': return '18';
    default: return '';
  }
}

var getCode = (attribute, label) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping.indexOf(label);
    case 'field_cd': return fieldCodeToFieldMapping.indexOf(label);
    case 'race': return raceCodeToRaceMapping.indexOf(label);
    case 'age': return label;
    default: return '';
  }
}