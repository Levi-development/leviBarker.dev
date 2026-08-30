
fetch("https://api.levibarker.dev/solves")
    .then(response => response.json())
    .then(solves => {
        const tableBody = document.getElementById("solveTableBody");

        solves.forEach(solve => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            const timeCell = document.createElement("td");

            idCell.textContent = solve.id;
            timeCell.textContent = solve.time;

            row.appendChild(idCell);
            row.appendChild(timeCell);

            tableBody.appendChild(row);
        });
    });
