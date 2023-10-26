const image = document.getElementById("image");
const svg = document.getElementById("svg");
const searchInput = document.getElementById("search");

const scale = 4416 / 1000;
const scale_coords = (vertices, scale) =>
  vertices.map(([x, y]) => [x / scale, 1 - y / scale]);

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

searchInput.value = "";
image.style.width = image.getBoundingClientRect().width + "px";
image.style.height = image.getBoundingClientRect().height + "px";

const createFeaturePath = (feature) => {
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
  featurePath.setAttribute("data-text", feature.properties.text);
  featurePath.setAttribute(
    "data-tippy-content",
    `text: ${feature.properties.text}<br>score: ${feature.properties.score}`,
  );
  return featurePath;
};

const features = await fetch("./1586 Aberdeen.geojson")
  .then((response) => response.json())
  .then((data) => data.features);

searchInput.addEventListener("input", () => {
  document
    .querySelectorAll("path.active")
    .forEach((path) => path.classList.remove("active"));
  if (!searchInput.value) return;
  const re = new RegExp(escapeRegExp(searchInput.value), "i");
  [...document.querySelectorAll("path")]
    .filter((el) => re.test(el.dataset.text))
    .forEach((el) => el.classList.add("active"));
});

features.forEach((feature) => svg.appendChild(createFeaturePath(feature)));
tippy("path", { allowHTML: true });
