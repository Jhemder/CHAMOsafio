const grid = document.getElementById("modGrid");
const search = document.getElementById("searchMods");
const category = document.getElementById("categoryFilter");
const count = document.getElementById("catalogCount");
const heroCount = document.getElementById("heroModCount");
let mods = [];

function renderMods() {
  const query = search.value.trim().toLocaleLowerCase("es");
  const selectedCategory = category.value;
  const shown = mods.filter(mod => {
    const matchesQuery = `${mod.name} ${mod.file} ${mod.description} ${mod.category} ${mod.audience || ""} ${mod.status || ""}`.toLocaleLowerCase("es").includes(query);
    return matchesQuery && (selectedCategory === "all" || mod.category === selectedCategory);
  });
  count.textContent = shown.length;
  grid.replaceChildren();
  if (!shown.length) {
    const empty = document.createElement("div");
    empty.className = "catalog-empty";
    empty.textContent = "No encontramos mods con esa búsqueda. Prueba otro nombre o categoría.";
    grid.append(empty);
    return;
  }
  for (const mod of shown) {
    const card = document.createElement("article");
    card.className = "mod-card";
    const top = document.createElement("div");
    top.className = "mod-card-top";
    const title = document.createElement("h3");
    title.textContent = mod.name;
    const badge = document.createElement("span");
    badge.className = "mod-category";
    badge.textContent = mod.category;
    const description = document.createElement("p");
    description.textContent = mod.description;
    const file = document.createElement("small");
    file.className = "mod-file";
    file.textContent = mod.file;
    const actions = document.createElement("div");
    actions.className = "mod-actions";
    if (mod.status) {
      const status = document.createElement("span");
      status.className = `mod-status ${mod.status === "Disponible en launcher" ? "available" : "pending"}`;
      status.textContent = mod.status;
      actions.append(status);
    }
    if (mod.downloadUrl) {
      const link = document.createElement("a");
      link.className = "mod-source";
      link.href = mod.downloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = mod.status !== "Disponible en launcher"
        ? "Buscar descarga oficial ↗"
        : mod.file.toLowerCase().endsWith(".zip") ? "Descargar recurso ↗" : "Descargar JAR ↗";
      actions.append(link);
    }
    top.append(title, badge);
    card.append(top, description, file);
    if (mod.audience) {
      const audience = document.createElement("small");
      audience.className = "mod-audience";
      audience.textContent = mod.audience;
      card.append(audience);
    }
    if (actions.childElementCount) card.append(actions);
    grid.append(card);
  }
}

search.addEventListener("input", renderMods);
category.addEventListener("change", renderMods);

fetch("mods.json")
  .then(response => {
    if (!response.ok) throw new Error(`No se pudo leer el catálogo (${response.status}).`);
    return response.json();
  })
  .then(entries => {
    mods = entries;
    heroCount.textContent = mods.filter(mod => mod.status === "Disponible en launcher").length;
    for (const value of [...new Set(mods.map(mod => mod.category))].sort((a, b) => a.localeCompare(b, "es"))) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      category.append(option);
    }
    renderMods();
  })
  .catch(error => {
    grid.innerHTML = "";
    const problem = document.createElement("div");
    problem.className = "catalog-error";
    problem.textContent = `${error.message} Abre la web desde un servidor HTTP, no como archivo local.`;
    grid.append(problem);
  });
