const form = document.querySelector("#resume-form");
const formSection = document.querySelector("#form-section");
const resultSection = document.querySelector("#result-section");
const resume = document.querySelector("#resume");

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const getValue = (data, name) => String(data.get(name) || "").trim();

const section = (title, content) =>
  content
    ? `<section class="resume-section"><h3>${escapeHtml(title)}</h3>${content}</section>`
    : "";

const paragraph = (value) => (value ? `<p>${escapeHtml(value)}</p>` : "");

const listItems = (items) =>
  items.length
    ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";

const listContent = (items) => (items.length ? `<ul>${items.join("")}</ul>` : "");

const readRepeatedValue = (entry, name) =>
  escapeHtml(entry.querySelector(`[name="${name}"]`).value.trim());

form.querySelectorAll('[name="hasExperience"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const isExperienced = form.querySelector('[name="hasExperience"]:checked')?.value === "yes";
    document.querySelector("#experience-panel").hidden = !isExperienced;
  });
});

form.querySelectorAll(".skill-option input[type='checkbox']").forEach((checkbox) => {
  const level = checkbox.closest(".skill-option").querySelector("select");
  const syncLevel = () => {
    level.hidden = !checkbox.checked;
    level.required = checkbox.checked;
    if (!checkbox.checked) level.value = "";
  };
  checkbox.addEventListener("change", syncLevel);
  syncLevel();
});

form.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const list = document.getElementById(addButton.dataset.add);
    const entry = list.querySelector("[data-entry]");
    const clone = entry.cloneNode(true);
    clone.querySelectorAll("input, textarea, select").forEach((control) => {
      if (control.type === "checkbox" || control.type === "radio") {
        control.checked = false;
      } else {
        control.value = "";
      }
      control.required = false;
    });
    clone.querySelectorAll(".skill-option select").forEach((select) => {
      select.hidden = true;
    });
    clone.querySelector(".remove-entry").hidden = false;
    list.append(clone);
    clone.querySelector("input, textarea, select")?.focus();
    return;
  }

  const removeButton = event.target.closest(".remove-entry");
  if (removeButton) {
    const entry = removeButton.closest("[data-entry]");
    const list = entry.parentElement;
    const firstEntry = list.querySelector("[data-entry]");
    if (entry === firstEntry) {
      entry.querySelectorAll("input, textarea, select").forEach((control) => {
        if (control.type === "checkbox" || control.type === "radio") {
          control.checked = false;
        } else {
          control.value = "";
        }
      });
      entry.querySelectorAll(".skill-option select").forEach((select) => {
        select.hidden = true;
        select.required = false;
      });
      removeButton.hidden = true;
    } else {
      const focusTarget = entry.previousElementSibling?.querySelector("input, textarea, select")
        || entry.nextElementSibling?.querySelector("input, textarea, select")
        || list.parentElement.querySelector(".add-entry");
      entry.remove();
      focusTarget?.focus();
    }
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = getValue(data, "name");
  const contact = [
    getValue(data, "location"),
    getValue(data, "phone"),
    getValue(data, "email"),
    getValue(data, "linkedin"),
    getValue(data, "portfolio"),
  ].filter(Boolean);

  const objective = [
    getValue(data, "opportunity"),
    getValue(data, "role") ? `Cargo desejado: ${getValue(data, "role")}` : "",
    getValue(data, "area") ? `Área: ${getValue(data, "area")}` : "",
    getValue(data, "modality") ? `Modalidade: ${getValue(data, "modality")}` : "",
  ].filter(Boolean);

  const educationDetails = [
    getValue(data, "educationLevel"),
    getValue(data, "study"),
    getValue(data, "term"),
  ].filter(Boolean);
  const educationDates = [
    getValue(data, "startYear"),
    getValue(data, "endYear") ? `Conclusão prevista: ${getValue(data, "endYear")}` : "",
  ].filter(Boolean);
  const education = [
    [...educationDetails, getValue(data, "school")].filter(Boolean).length
      ? `<p>${[...educationDetails, getValue(data, "school")].filter(Boolean).map(escapeHtml).join(" — ")}</p>`
      : "",
    paragraph(educationDates.join(" · ")),
    getValue(data, "shift") ? paragraph(`Turno: ${getValue(data, "shift")}`) : "",
    getValue(data, "complementaryEducation")
      ? paragraph(`Formação complementar: ${getValue(data, "complementaryEducation")}`)
      : "",
    paragraph(getValue(data, "academicActivities")),
  ].filter(Boolean).join("");

  const hasExperience = form.querySelector('[name="hasExperience"]:checked')?.value === "yes";
  const professionalExperience = (hasExperience ? [...document.querySelectorAll("#experience-list [data-entry]")] : [])
    .map((entry) => {
      const role = readRepeatedValue(entry, "experienceRole[]");
      const company = readRepeatedValue(entry, "experienceCompany[]");
      const period = readRepeatedValue(entry, "experiencePeriod[]");
      const details = readRepeatedValue(entry, "experienceDetails[]");
      if (![role, company, period, details].some(Boolean)) return "";
      const heading = [role, company].filter(Boolean).join(" — ");
      return `<li>${heading ? `<strong>${heading}</strong>` : ""}${period ? `<span class="resume-meta"> · ${period}</span>` : ""}${details ? `<p>${details}</p>` : ""}</li>`;
    })
    .filter(Boolean);

  const activities = [...document.querySelectorAll("#activity-list [data-entry]")]
    .map((entry) => {
      const title = readRepeatedValue(entry, "activityName[]");
      const type = readRepeatedValue(entry, "activityType[]");
      const details = readRepeatedValue(entry, "activityDetails[]");
      if (![title, type, details].some(Boolean)) return "";
      return `<li>${[title, type].filter(Boolean).join(" — ")}${details ? `<p>${details}</p>` : ""}</li>`;
    })
    .filter(Boolean);

  const courses = [...document.querySelectorAll("#course-list [data-entry]")]
    .map((entry) => {
      const title = readRepeatedValue(entry, "courseName[]");
      const institution = readRepeatedValue(entry, "courseInstitution[]");
      const hours = readRepeatedValue(entry, "courseHours[]");
      const year = readRepeatedValue(entry, "courseYear[]");
      const status = readRepeatedValue(entry, "courseStatus[]");
      const certificate = readRepeatedValue(entry, "courseCertificate[]");
      if (![title, institution, hours, year, status, certificate].some(Boolean)) return "";
      const details = [
        institution,
        hours ? `${hours}` : "",
        year,
        status,
        certificate ? `Certificado: ${certificate.toLowerCase()}` : "",
      ].filter(Boolean);
      return `<li>${title ? `<strong>${title}</strong>` : ""}${details.length ? `<span class="resume-meta"> — ${details.join(" · ")}</span>` : ""}</li>`;
    })
    .filter(Boolean);

  const skills = [...form.querySelectorAll(".skill-option input:checked")].map((checkbox) => {
    const level = checkbox.closest(".skill-option").querySelector("select").value;
    return `${escapeHtml(checkbox.value)}${level ? ` (${escapeHtml(level.toLowerCase())})` : ""}`;
  });
  const otherSkills = getValue(data, "otherSkills");
  const otherSkillLevel = getValue(data, "otherSkillLevel");
  if (otherSkills) {
    skills.push(`${escapeHtml(otherSkills)}${otherSkillLevel ? ` (${escapeHtml(otherSkillLevel.toLowerCase())})` : ""}`);
  }

  const languages = [...document.querySelectorAll("#language-list [data-entry]")]
    .map((entry) => {
      const language = readRepeatedValue(entry, "languageName[]");
      const comprehension = readRepeatedValue(entry, "languageComprehension[]");
      const speaking = readRepeatedValue(entry, "languageSpeaking[]");
      const literacy = readRepeatedValue(entry, "languageLiteracy[]");
      const certificate = readRepeatedValue(entry, "languageCertificate[]");
      if (![language, comprehension, speaking, literacy, certificate].some(Boolean)) return "";
      const levels = [
        comprehension ? `Compreensão: ${comprehension.toLowerCase()}` : "",
        speaking ? `Conversação: ${speaking.toLowerCase()}` : "",
        literacy ? `Leitura e escrita: ${literacy.toLowerCase()}` : "",
        certificate === "Sim" ? "certificado" : "",
      ].filter(Boolean);
      return `<li>${language ? `<strong>${language}</strong>` : ""}${levels.length ? `<span class="resume-meta"> — ${levels.join(" · ")}</span>` : ""}</li>`;
    })
    .filter(Boolean);

  const competency = getValue(data, "competency");
  const competencyExample = getValue(data, "competencyExample");
  const behavior = [
    competency ? `<p><strong>${escapeHtml(competency)}</strong></p>` : "",
    paragraph(competencyExample),
  ].filter(Boolean).join("");

  const availability = [
    getValue(data, "availability") ? `Horários: ${getValue(data, "availability")}` : "",
    getValue(data, "onsite") ? `Presencial: ${getValue(data, "onsite")}` : "",
    getValue(data, "travel") ? `Viagens: ${getValue(data, "travel")}` : "",
    getValue(data, "startAvailability") ? `Início: ${getValue(data, "startAvailability")}` : "",
    getValue(data, "license") ? `CNH: ${getValue(data, "license")}` : "",
    getValue(data, "additional"),
  ].filter(Boolean);

  resume.innerHTML = `
    <header class="resume-header">
      <h2 class="resume-name">${escapeHtml(name)}</h2>
      ${contact.length ? `<p class="resume-contact">${contact.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</p>` : ""}
    </header>
    ${section("Objetivo profissional", paragraph(objective.join(" · ")))}
    ${section("Formação acadêmica", education)}
    ${section("Experiência profissional", listContent(professionalExperience))}
    ${section("Projetos, voluntariado e atividades", listContent(activities))}
    ${section("Cursos e certificações", listContent(courses))}
    ${section("Conhecimentos técnicos", listItems(skills))}
    ${section("Idiomas", listContent(languages))}
    ${section("Competências comportamentais", behavior)}
    ${section("Disponibilidade e informações adicionais", listItems(availability.map(escapeHtml)))}
  `;

  formSection.hidden = true;
  resultSection.hidden = false;
  document.querySelector("#result-title").scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#result-title").focus({ preventScroll: true });
});

document.querySelector("#edit-button").addEventListener("click", () => {
  resultSection.hidden = true;
  formSection.hidden = false;
  document.querySelector("#form-title").scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#form-title").focus({ preventScroll: true });
});

document.querySelector("#print-button").addEventListener("click", () => {
  window.print();
});
