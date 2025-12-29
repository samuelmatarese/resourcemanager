export function FilterEntries(ids: string[]) {
  let entries = Array.from(document.getElementsByClassName("table-row"));

  entries.forEach((entry) => {
    if (!(entry instanceof HTMLElement)) {
      return;
    }

    if (!ids.includes(entry.id)) {
      entry.classList.add("hidden");
    } else {
      entry.classList.remove("hidden");
    }
  });
}
