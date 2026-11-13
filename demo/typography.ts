const roles = ["display", "headline", "title", "body", "label"];
const sizes = ["large", "medium", "small"];
const section = document.getElementById("typography")!;
for (const role of roles) {
  const group = document.createElement("article");
  const title = document.createElement("h3");
  title.textContent = role;
  group.append(title);
  for (const size of sizes) {
    for (const emphasized of [false, true]) {
      const name = `${emphasized ? "emphasized-" : ""}${role}-${size}`;
      const label = document.createElement("p");
      label.className = "type-caption";
      label.textContent = name;
      const sample = document.createElement("p");
      sample.className = `type-specimen md-type-${name}`;
      sample.textContent = "Forma, ritmo e leggibilità";
      group.append(label, sample);
    }
  }
  section.append(group);
}
const examples = document.createElement("article");
examples.innerHTML = `
  <h3>Esempi di applicazione</h3>
  <article aria-labelledby="document-title">
    <h4 id="document-title" class="md-type-title-medium">Rapporto attività</h4>
    <p class="md-type-body-medium">Il titolo identifica il documento. Il testo usa il ruolo body medium, senza dimensioni locali.</p>
    <p class="md-type-label-medium">Aggiornato alle <time class="md-numerals-tabular" datetime="14:08">14:08</time></p>
    <p class="md-type-headline-small md-numerals-tabular" aria-label="Documenti elaborati">1.024</p>
    <a class="md-text-link md-type-body-medium" href="https://m3.material.io/styles/typography/overview">Specifiche tipografiche Material</a>
    <p><a class="md-text-link md-text-link--tertiary" href="#azioni">Vai alle varianti dei pulsanti</a></p>
  </article>
  <table class="md-type-body-medium">
    <caption>Durata delle operazioni, con cifre tabulari</caption>
    <thead><tr><th scope="col">Operazione</th><th scope="col">Durata</th></tr></thead>
    <tbody><tr><th scope="row">Esportazione</th><td class="md-numerals-tabular">00:18</td></tr>
    <tr><th scope="row">Importazione</th><td class="md-numerals-tabular">11:04</td></tr></tbody>
  </table>
  <h4 class="md-type-title-medium">Lingue e interlinea</h4>
  <p lang="el" class="md-type-body-large">Ελληνικά: ευανάγνωστο κείμενο.</p>
  <p lang="uk" class="md-type-body-large">Українська: читабельний текст.</p>
  <p lang="vi" class="md-type-body-large">Tiếng Việt: văn bản dễ đọc.</p>
  <p lang="my" class="md-type-body-large">မြန်မာစာ</p>
  <p lang="ur" dir="rtl" data-language-height="extra-large" class="md-type-body-large">اردو متن</p>
  <p class="md-type-body-small">Le lingue non incluse in Roboto usano i font disponibili nel sistema. I fattori di interlinea sono adattamenti di progetto, non token Material verificati.</p>
`;
section.append(examples);
