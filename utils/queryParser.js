function parseNaturalQuery(q) {
  q = q.toLowerCase();

  let filters = {};

  if (q.includes("male")) {
    filters.gender = "male";
  }
  if (q.includes("female")) {
    filters.gender = "female";
  }

  if (q.includes("nigeria")) filters.country_id = "NG";
  if (q.includes("ghana")) filters.country_id = "GH";
  if (q.includes("kenya")) filters.country_id = "KE";
  if (q.includes("uganda")) filters.country_id = "UG";
  if (q.includes("tanzania")) filters.country_id = "TZ";
  if (q.includes("south africa")) filters.country_id = "ZA";

  if (q.includes("young")) {
    filters.age = { $gte: 16, $lte: 24 };
  }

  if (q.includes("teenager")) {
    filters.age_group = "teenager";
  }

  if (q.includes("adult")) {
    filters.age_group = "adult";
  }

  if (q.includes("senior")) {
    filters.age_group = "senior";
  }

  if (Object.keys(filters).length === 0) {
    return null;
  }

  return filters;
}

module.exports = parseNaturalQuery;
