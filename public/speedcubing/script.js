const status = document.getElementById("solveStatus");
const solveTables = document.getElementById("solveTables");
const refreshButton = document.getElementById("refreshButton");

function loadSolves() {
    status.textContent = "Loading solves...";
    refreshButton.disabled = true;


    solveTables.innerHTML = "";

    fetch("https://api.levibarker.dev/solves")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load solves");
            }

            return response.json();
        })
        .then(solves => {

            const categories = [...new Set(solves.map(solve => solve.category))];

            categories.forEach(category => {

                const categorySolves = solves.filter(solve => solve.category === category);

                const heading = document.createElement("h2");
                heading.textContent = category;

                const table = document.createElement("table");

                const tableHead = document.createElement("thead");
                const headerRow = document.createElement("tr");

                const headers = ["Solve", "Time", "Timestamp", "Scramble"];

                headers.forEach(header => {
                    const cell = document.createElement("th");
                    cell.textContent = header;
                    headerRow.appendChild(cell);
                });

                tableHead.appendChild(headerRow);
                table.appendChild(tableHead);

                const tableBody = document.createElement("tbody");

                categorySolves.forEach(solve => {

                    const row = document.createElement("tr");

                    const date = new Date(solve.timestamp);

                    const formattedDate = date.toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    });

                    const idCell = document.createElement("td");
                    const timeCell = document.createElement("td");
                    const timestampCell = document.createElement("td");
                    const scrambleCell = document.createElement("td");

                    idCell.textContent = solve.id;
                    timeCell.textContent = solve.time;
                    timestampCell.textContent = formattedDate;
                    scrambleCell.textContent = solve.scramble;

                    row.appendChild(idCell);
                    row.appendChild(timeCell);
                    row.appendChild(timestampCell);
                    row.appendChild(scrambleCell);

                    tableBody.appendChild(row);
                });

                table.appendChild(tableBody);

                solveTables.appendChild(heading);
                solveTables.appendChild(table);
            });



            status.textContent =
                `Last updated: ${new Date().toLocaleTimeString("en-GB")}`;

            refreshButton.disabled = false;
        })
        .catch(error => {
            console.error(error);
            status.textContent = "Failed to load solves.";
            refreshButton.disabled = false;
        });
}

refreshButton.addEventListener("click", loadSolves);

loadSolves();