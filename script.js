const image = document.getElementById("image");
const svg = document.getElementById("svg");
const featuresTable = document.getElementById("features-table");
const searchInput = document.getElementById("search");
const confidenceInput = document.getElementById("confidence");
const showFeaturesTableButton = document.getElementById("show-features-table");

const scale = 4416 / 1000;
const scale_coords = (vertices, scale) =>
  vertices.map(([x, y]) => [x / scale, 1 - y / scale]);

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

document.documentElement.style.setProperty(
  "--image-full-width",
  image.getBoundingClientRect().width + "px",
);
document.documentElement.style.setProperty(
  "--image-aspect-ratio",
  image.getBoundingClientRect().height / image.getBoundingClientRect().width,
);
// image.style.width =;
// image.style.height = image.getBoundingClientRect().height + "px";

const createFeaturePath = (feature, i) => {
  const featurePath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  const vertices = scale_coords(feature.geometry.coordinates[0], scale);
  const path = [];
  path.push(`M ${vertices[0][0]} ${vertices[0][1]}`);
  vertices.slice(1).forEach(([x, y]) => path.push(`L ${x} ${y}`));
  path.push("Z");
  featurePath.setAttribute("d", path.join(" "));
  featurePath.setAttribute("data-idx", i);
  featurePath.setAttribute("data-text", feature.properties.text);
  featurePath.setAttribute("data-score", feature.properties.score);
  featurePath.setAttribute(
    "data-tippy-content",
    `text: ${feature.properties.text}<br>score: ${feature.properties.score}`,
  );
  return featurePath;
};

const createFeatureTableRow = (feature, i) => {
  const featureRow = document.createElement("tr");
  const featureText = document.createElement("td");
  const featureScore = document.createElement("td");
  featureText.textContent = feature.properties.text;
  featureScore.textContent = feature.properties.score;
  featureRow.appendChild(featureText);
  featureRow.appendChild(featureScore);
  featureRow.addEventListener("mouseover", () =>
    document.querySelector(`path[data-idx="${i}"]`).classList.add("active"),
  );
  featureRow.addEventListener("mouseout", () =>
    document.querySelector(`path[data-idx="${i}"]`).classList.remove("active"),
  );
  return featureRow;
};

const features = await fetch("./1586 Aberdeen.geojson")
  .then((response) => response.json())
  .then((data) => data.features);

const markFeatures = () => {
  document
    .querySelectorAll("path.marked")
    .forEach((path) => path.classList.remove("marked"));

  const query = searchInput.value
    ? new RegExp(escapeRegExp(searchInput.value), "i")
    : false;

  const confidence = confidenceInput.valueAsNumber;

  if (!query && !confidence) return;

  let markedFeatures = [...document.querySelectorAll("path")];
  if (query) {
    markedFeatures = markedFeatures.filter((el) => query.test(el.dataset.text));
  }

  if (confidence) {
    markedFeatures = markedFeatures.filter(
      (el) => el.dataset.score >= confidence,
    );
  }

  markedFeatures.forEach((el) => el.classList.add("marked"));
};

searchInput.value = "";
searchInput.addEventListener("input", markFeatures);

confidenceInput.value = 0;
confidenceInput.addEventListener("input", markFeatures);
confidenceInput.addEventListener(
  "input",
  () =>
    (document.getElementById("confidence-label").textContent =
      confidenceInput.value),
);

showFeaturesTableButton.addEventListener("click", () =>
  featuresTable.parentElement.parentElement.classList.toggle("show-table"),
);

features.forEach((feature, i) => {
  svg.appendChild(createFeaturePath(feature, i));
  featuresTable
    .querySelector("tbody")
    .appendChild(createFeatureTableRow(feature, i));
});
tippy("path", { allowHTML: true });
