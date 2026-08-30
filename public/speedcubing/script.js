const status = document.getElementById("solveStatus");
const tableBody = document.getElementById("solveTableBody");

status.textContent = "Loading solves...";

fetch("https://api.levibarker.dev/solves")
    .then(response => response.json())
    .then(solves => {
        const tableBody = document.getElementById("solveTableBody");

        solves.forEach(solve => {
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

            idCell.textContent = solve.id;
            timeCell.textContent = solve.time;
            timestampCell.textContent = formattedDate;



            row.appendChild(idCell);
            row.appendChild(timeCell);
            row.appendChild(timestampCell);

            tableBody.appendChild(row);
        });

        status.textContent = `Last updated: ${new Date().toLocaleTimeString("en-GB")}. Refresh to update again`;
    });
