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