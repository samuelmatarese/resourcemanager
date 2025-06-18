// @ts-check

// Script run within the webview itself.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();
  const resourceTable = document.getElementById("resource-table");
  const addButton = document.getElementsByClassName("create-button")[0];

  if (addButton == null) {
    throw new Error("addbutton is null");
  }

  addButton.addEventListener("click", () => {
    vscode.postMessage({
      type: "add",
    });
  });

  const errorContainer = document.createElement("div");
  document.body.appendChild(errorContainer);
  errorContainer.className = "error";
  errorContainer.style.display = "none";

  function updateContent(/** @type {string} */ text) {
    const resourceTable = document.getElementById("resource-table");

    resetTable();
    const parser = new DOMParser();
    let xmlDoc = parser.parseFromString(text, "text/xml");
    let rows = xmlDoc.getElementsByTagName("data");

    for (let i = 0; i < rows.length; i++) {
      const name = rows[i].getAttribute("name");
      const value = rows[i].getElementsByTagName("value")[0]?.textContent ?? "";
      const comment =
        rows[i].getElementsByTagName("comment")[0]?.textContent ?? "";
      const rowElement = document.createElement("tr");

      rowElement.appendChild(createEditableCell(name ?? ""));
      rowElement.appendChild(createEditableCell(value ?? ""));
      rowElement.appendChild(createEditableCell(comment ?? ""));
      resourceTable?.appendChild(rowElement);
    }
  }

  function createEditableCell(textContent) {
    const cell = document.createElement("td");
    const input = document.createElement("input");

    input.value = textContent;

    cell.appendChild(input);
    return cell;
  }

  function resetTable() {
    if (resourceTable) {
      resourceTable.innerHTML = "";
    }

    const header = document.createElement("tr");
    header.className = "table-header";
    header.appendChild(createHeaderCell("Name"));
    header.appendChild(createHeaderCell("Value"));
    header.appendChild(createHeaderCell("Comment"));

    resourceTable?.appendChild(header);
  }

  function createHeaderCell(name) {
    const cell = document.createElement("th");
    cell.textContent = name;

    return cell;
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        const text = message.text;

        // Update our webview's content
        updateContent(text);

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ text });

        return;
    }
  });

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
