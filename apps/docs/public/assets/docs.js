const docs = [
  {
    id: "overview",
    title: "Overview",
    eyebrow: "tổng quan",
    file: "./content/overview.md",
  },
  {
    id: "f0",
    title: "F0 Foundation",
    eyebrow: "core",
    file: "./content/f0.md",
  },
  {
    id: "auth",
    title: "Auth API",
    eyebrow: "api module",
    file: "./content/auth.md",
  },
  {
    id: "permission",
    title: "Permission API",
    eyebrow: "api module",
    file: "./content/permission.md",
  },
  {
    id: "business",
    title: "Business API",
    eyebrow: "api module",
    file: "./content/business.md",
  },
  {
    id: "users",
    title: "Users API",
    eyebrow: "api module",
    file: "./content/users.md",
  },
  {
    id: "notifications",
    title: "Notifications API",
    eyebrow: "api module",
    file: "./content/notifications.md",
  },
  {
    id: "assets",
    title: "Assets API",
    eyebrow: "api module",
    file: "./content/assets.md",
  },
  {
    id: "health",
    title: "Health API",
    eyebrow: "api module",
    file: "./content/health.md",
  },
];

const nav = document.querySelector("#doc-nav");
const title = document.querySelector("#doc-title");
const eyebrow = document.querySelector("#doc-eyebrow");
const content = document.querySelector("#doc-content");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderTable(lines) {
  const rows = lines
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => renderInline(cell.trim())),
    );

  const [head, , ...body] = rows;
  const headers = head.map((cell) => `<th>${cell}</th>`).join("");
  const bodyRows = body
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");

  return `<div class="table-wrap"><table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let table = [];
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    html.push(
      `<ul>${list.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`,
    );
    list = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    html.push(renderTable(table));
    table = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        flushTable();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    if (line.trim().startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }

    flushTable();

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^-\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushTable();

  return html.join("");
}

function getCurrentDoc() {
  const id = window.location.hash.replace("#", "") || "overview";
  return docs.find((doc) => doc.id === id) ?? docs[0];
}

function renderNav(activeId) {
  nav.innerHTML = docs
    .map((doc) => {
      const active = doc.id === activeId;
      return `<a class="nav-link ${active ? "nav-link-active" : ""}" href="#${doc.id}" aria-current="${active ? "page" : "false"}">
        <span>${doc.title}</span>
        <small>${doc.eyebrow}</small>
      </a>`;
    })
    .join("");
}

async function loadDoc() {
  const doc = getCurrentDoc();
  renderNav(doc.id);
  title.textContent = doc.title;
  eyebrow.textContent = doc.eyebrow;
  content.innerHTML = '<p class="text-muted">Đang tải tài liệu...</p>';

  try {
    const response = await fetch(doc.file, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Không thể tải ${doc.file}`);
    }
    const markdown = await response.text();
    content.innerHTML = renderMarkdown(markdown);
    content.focus({ preventScroll: true });
  } catch (error) {
    content.innerHTML = `<h1>Không tải được tài liệu</h1><p>${renderInline(error.message)}</p>`;
  }
}

window.addEventListener("hashchange", loadDoc);
renderNav(getCurrentDoc().id);
loadDoc();
