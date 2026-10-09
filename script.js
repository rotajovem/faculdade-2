const form = document.querySelector("#resume-form");
const formSection = document.querySelector("#form-section");
const resultSection = document.querySelector("#result-section");
const resume = document.querySelector("#resume");

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const getLines = (value) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const formatDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const section = (title, content) =>
  content
    ? `<section class="resume-section"><h3>${title}</h3>${content}</section>`
    : "";

const listItems = (items) =>
  items.length
    ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const value = (name) => String(data.get(name) || "").trim();
  const contacts = [
    value("location"),
    value("email"),
    value("phone"),
    value("birthDate") ? `Nascimento: ${formatDate(value("birthDate"))}` : "",
  ].filter(Boolean);

  const education = [
    value("school"),
    value("study"),
  ].filter(Boolean).map(escapeHtml).join(" — ");

  const objective = value("objective")
    ? `<p>${escapeHtml(value("objective"))}</p>`
    : "";

  const courses = listItems(getLines(value("courses")));
  const experience = listItems(getLines(value("experience")));
  const qualities = getLines(value("qualities").replace(/,/g, "\n"));

  resume.innerHTML = `
    <header class="resume-header">
      <h2 class="resume-name">${escapeHtml(value("name"))}</h2>
      ${contacts.length ? `<p class="resume-contact">${contacts.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</p>` : ""}
    </header>
    ${section("Objetivo profissional", objective)}
    ${section("Formação", `<p>${education}</p>`)}
    ${section("Cursos complementares", courses)}
    ${section("Experiências", experience)}
    ${section("Qualidades e habilidades", listItems(qualities))}
  `;

  formSection.hidden = true;
  resultSection.hidden = false;
  document.querySelector("#page-title").scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#result-title").focus({ preventScroll: true });
});

document.querySelector("#edit-button").addEventListener("click", () => {
  resultSection.hidden = true;
  formSection.hidden = false;
  document.querySelector("#form-title").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#print-button").addEventListener("click", () => {
  window.print();
});
