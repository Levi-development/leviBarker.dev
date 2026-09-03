const status = document.getElementById("solveStatus");
const solveTables = document.getElementById("solveTables");
const refreshButton = document.getElementById("refreshButton");

const dashboardGraphs = document.getElementById("dashboardGraphs");

function calculateAverage(times) {
    const sorted = [...times].sort((a, b) => a - b);

    sorted.shift(); // Remove best
    sorted.pop();   // Remove worst

    return sorted.reduce((sum, time) => sum + time, 0) / sorted.length;
}

function loadSolves() {
    status.textContent = "Loading solves...";
    refreshButton.disabled = true;


    solveTables.innerHTML = "";
    dashboardGraphs.innerHTML = "";

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
                const dashboardCanvas = document.createElement("canvas");

                const times = categorySolves.map(solve => solve.time);
                const ao5 = [];
                const ao12 = [];

                for (let i = 0; i < times.length; i++) {

                    if (i >= 4) {
                        ao5.push(
                            calculateAverage(times.slice(i - 4, i + 1))
                        );
                    } else {
                        ao5.push(null);
                    }

                    if (i >= 11) {
                        ao12.push(
                            calculateAverage(times.slice(i - 11, i + 1))
                        );
                    } else {
                        ao12.push(null);
                    }
                }

                // Calculate PBs and latest for individual, AO5, and AO12

                const latestIndividual = times.length > 0
                    ? times[times.length - 1]
                    : null;

                const personalBest = times.length > 0
                    ? Math.min(...times)
                    : null;

                const validAo5 = ao5.filter(time => time !== null);

                const latestAo5 = validAo5.length > 0
                    ? validAo5[validAo5.length - 1]
                    : null;

                const bestAo5 = validAo5.length > 0
                    ? Math.min(...validAo5)
                    : null;

                const validAo12 = ao12.filter(time => time !== null);

                const latestAo12 = validAo12.length > 0
                    ? validAo12[validAo12.length - 1]
                    : null;

                const bestAo12 = validAo12.length > 0
                    ? Math.min(...validAo12)
                    : null;


                //This is for the dashboard
                new Chart(dashboardCanvas, {
                    type: "line",
                    data: {
                        labels: categorySolves.map((_, index) => index + 1),
                        datasets: [
                            {
                                label: "Individual",
                                data: times,
                                pointRadius: 0,
                                pointHoverRadius: 4
                            },
                            {
                                label: "Ao5",
                                data: ao5,
                                pointRadius: 0,
                                pointHoverRadius: 4
                            },
                            {
                                label: "Ao12",
                                data: ao12,
                                pointRadius: 0,
                                pointHoverRadius: 4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                display: false
                            },
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                const heading = document.createElement("h2");
                heading.textContent = "▶ " + category;
                heading.classList.add("category-heading");

                const categoryContent = document.createElement("div");
                categoryContent.classList.add("category-content", "collapsed");

                heading.addEventListener("click", () => {
                    categoryContent.classList.toggle("collapsed");

                    if (categoryContent.classList.contains("collapsed")) {
                        heading.textContent = "▶ " + category;
                    } else {
                        heading.textContent = "▼ " + category;
                    }
                });

                const chartCanvas = document.createElement("canvas");

                new Chart(chartCanvas, {
                    type: "line",
                    data: {
                        labels: categorySolves.map((_, index) => index + 1),
                        datasets: [
                            {
                                label: "Individual",
                                data: times
                            },
                            {
                                label: "Ao5",
                                data: ao5
                            },
                            {
                                label: "Ao12",
                                data: ao12
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: "Solve"
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: "Time (seconds)"
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });

                const dashboardCard = document.createElement("div");
                dashboardCard.classList.add("dashboard-card");

                const dashboardHeading = document.createElement("h3");
                dashboardHeading.textContent = category;

                const stats = document.createElement("div");
                stats.classList.add("dashboard-stats");

                stats.innerHTML = `
                    <div class="stats-header">
                        <span></span>
                        <span>Most Recent</span>
                        <span>PB</span>
                    </div>

                    <div class="stats-row">
                        <span>Individual</span>
                        <span>${latestIndividual !== null ? latestIndividual.toFixed(2) : "—"}</span>
                        <span>${personalBest !== null ? personalBest.toFixed(2) : "—"}</span>
                    </div>

                    <div class="stats-row">
                        <span>AO5</span>
                        <span>${latestAo5 !== null ? latestAo5.toFixed(2) : "—"}</span>
                        <span>${bestAo5 !== null ? bestAo5.toFixed(2) : "—"}</span>
                    </div>

                    <div class="stats-row">
                        <span>AO12</span>
                        <span>${latestAo12 !== null ? latestAo12.toFixed(2) : "—"}</span>
                        <span>${bestAo12 !== null ? bestAo12.toFixed(2) : "—"}</span>
                    </div>
                `;

                dashboardCard.appendChild(dashboardHeading);
                dashboardCard.appendChild(stats);
                dashboardCard.appendChild(dashboardCanvas);

                dashboardGraphs.appendChild(dashboardCard);

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

                    const moves = solve.scramble.split(" ");
                    const shortScramble = moves.slice(0, 4).join(" ") + "...";

                    idCell.textContent = solve.id;
                    timeCell.textContent = solve.time;
                    timestampCell.textContent = formattedDate;
                    scrambleCell.textContent = shortScramble;

                    scrambleCell.classList.add("scramble");

                    scrambleCell.addEventListener("click", () => {
                        if (scrambleCell.textContent === shortScramble) {
                            scrambleCell.textContent = solve.scramble;
                        } else {
                            scrambleCell.textContent = shortScramble;
                        }
                    });

                    row.appendChild(idCell);
                    row.appendChild(timeCell);
                    row.appendChild(timestampCell);
                    row.appendChild(scrambleCell);

                    tableBody.appendChild(row);
                });

                table.appendChild(tableBody);

                categoryContent.appendChild(chartCanvas);
                categoryContent.appendChild(table);

                solveTables.appendChild(heading);
                solveTables.appendChild(categoryContent);
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