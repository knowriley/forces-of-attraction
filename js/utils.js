/**
 * Global Constants
 */
const NUM_OF_FIELDS = 19;
const NUM_OF_CAREERS = 18;
const NUM_OF_RACES = 7; // MAX_AGE (6) + 1
const NUM_OF_AGES = 56; // MAX_AGE (55) + 1

const getGenderedData = (data, gender) => data.filter((d) => d.gender === gender);

const getMatches = (data) => data.filter((d) => d.match === 1);

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

const decode = (attr) => (d) => {
  const v = d[attr];
  switch (attr) {
    case 'gender':
      return v ? 'Male' : 'Female';
    case 'field_cd':
      return v ? fieldCodeToFieldGroupMapping[v] : defaultNA;
    case 'career_c':
      return v ? careerCodeToCareerGroupMapping[v] : defaultNA;
    default:
      return v;
  }
};

const getAttributeSize = (attribute) => {
  switch (attribute) {
    case 'career_c': return NUM_OF_CAREERS;
    case 'field_cd': return NUM_OF_FIELDS;
    case 'race': return NUM_OF_RACES;
    case 'age': return NUM_OF_AGES;
    default: return 0;
  }
};

const unique = (data, acc) => new Set(d3.map(data, acc));
const getLabel = (attribute, code) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping[code];
    case 'field_cd': return fieldCodeToFieldMapping[code];
    case 'race': return raceCodeToRaceMapping[code];
    case 'age': return code;
    default: return '';
  }
};

const getDefaultLabel = (attribute) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping[1];
    case 'field_cd': return fieldCodeToFieldMapping[1];
    case 'race': return raceCodeToRaceMapping[1];
    case 'age': return '20';
    default: return '';
  }
};

const getCode = (attribute, label) => {
  switch (attribute) {
    case 'career_c': return careerCodeToCareerMapping.indexOf(label);
    case 'field_cd': return fieldCodeToFieldMapping.indexOf(label);
    case 'race': return raceCodeToRaceMapping.indexOf(label);
    case 'age': return label;
    default: return '';
  }
};

// Drag simulation code curtesy of
// https://observablehq.com/@d3/force-directed-graph
const drag = (simulation) => {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};
