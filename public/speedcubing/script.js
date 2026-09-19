    const status = document.getElementById("solveStatus");
    const solveTables = document.getElementById("solveTables");
    const sessionTables = document.getElementById("sessionTables");
    const refreshButton = document.getElementById("refreshButton");

    const dashboardGraphs = document.getElementById("dashboardGraphs");

    function calculateAverage(times) {
        const sorted = [...times].sort((a, b) => a - b);

        sorted.shift(); // Remove best
        sorted.pop();   // Remove worst

        return sorted.reduce((sum, time) => sum + time, 0) / sorted.length;
    }

    function createPBVideo(categorySolves, sessions) {
        const pbSolve = categorySolves.reduce((best, solve) => {
            return solve.time < best.time ? solve : best;
        });

        const session = sessions.find(session =>
            session.solves.some(solve => solve.id === pbSolve.id)
        );

        if (!session || !session.youtubeVideoID) {
            return null;
        }

        const container = document.createElement("div");
        container.classList.add("pb-video");

        const heading = document.createElement("h4");
        heading.textContent = `PB — ${pbSolve.time.toFixed(2)}s`;

        const iframe = document.createElement("iframe");

        iframe.src =
            `https://www.youtube.com/embed/${session.youtubeVideoID}` +
            `?start=${Math.floor(pbSolve.videoTimestamp)}` +
            `&controls=1&rel=0`;

        iframe.title = "Personal best solve";
        iframe.allow = "encrypted-media";
        iframe.allowFullscreen = true;

        container.appendChild(heading);
        container.appendChild(iframe);

        return container;
    }

    function createSolveHeatmap(solves) {

        const heatmapContainer = document.createElement("div");
        heatmapContainer.classList.add("solve-heatmap");

        const title = document.createElement("h4");
        title.textContent = "Solves per day";

        heatmapContainer.appendChild(title);


        const solveCounts = {};

        solves.forEach(solve => {

            const date = new Date(solve.timestamp);

            const dateKey =
                date.getFullYear() +
                "-" +
                String(date.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(date.getDate()).padStart(2, "0");

            if (!solveCounts[dateKey]) {
                solveCounts[dateKey] = 0;
            }

            solveCounts[dateKey]++;
        });

        const maxSolves = Math.max(
            1,
            ...Object.values(solveCounts)
        );



        const calendar = document.createElement("div");
        calendar.classList.add("heatmap-calendar");

        const today = new Date();

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);

        // Start on Sunday
        startDate.setDate(
            startDate.getDate() - startDate.getDay()
        );

        const endDate = new Date(today);
        endDate.setDate(
            endDate.getDate() + (6 - endDate.getDay())
        );

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {

            const week = document.createElement("div");
            week.classList.add("heatmap-week");

            for (let day = 0; day < 7; day++) {

                const cell = document.createElement("div");
                cell.classList.add("heatmap-cell");

                const dateKey =
                    currentDate.getFullYear() +
                    "-" +
                    String(currentDate.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(currentDate.getDate()).padStart(2, "0");

                const count = solveCounts[dateKey] || 0;

                // Determine colour intensity
                if (count === 0) {
                    cell.classList.add("level-0");
                }
                else if (count <= maxSolves * 0.25) {
                    cell.classList.add("level-1");
                }
                else if (count <= maxSolves * 0.5) {
                    cell.classList.add("level-2");
                }
                else if (count <= maxSolves * 0.75) {
                    cell.classList.add("level-3");
                }
                else {
                    cell.classList.add("level-4");
                }

                const formattedDate = currentDate.toLocaleDateString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

                cell.title =
                    `${formattedDate}: ${count} ` +
                    (count === 1 ? "solve" : "solves");

                week.appendChild(cell);

                currentDate.setDate(
                    currentDate.getDate() + 1
                );
            }

            calendar.appendChild(week);
        }

        heatmapContainer.appendChild(calendar);

        return heatmapContainer;
    }

    function loadSolves() {
        let sessions = [];
        status.textContent = "Loading solves...";
        refreshButton.disabled = true;


        solveTables.innerHTML = "";
        dashboardGraphs.innerHTML = "";

        Promise.all([
            fetch("https://api.levibarker.dev/sessions").then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load sessions");
                }

                return response.json();
            }),

            fetch("https://api.levibarker.dev/solves").then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load solves");
                }

                return response.json();
            })
        ])
        .then(([sessionData, solves]) => {

            sessions = sessionData;

            // Everything currently inside your
            // .then(solves => {
            // goes here.

        })
        .catch(error => {
            console.error(error);
            status.textContent = "Failed to load solves.";
            refreshButton.disabled = false;
        });
            .then(sessionData => {
                sessions = sessionData;

                sessionTables.innerHTML = "";


                sessions.forEach(session => {

                    const formattedDate = new Date(session.startTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    });

                    const solveCount = session.solves.length;

                    const heading = document.createElement("h2");



                    heading.textContent =
                        "▶ " + session.category +
                        " — " + formattedDate +
                        " — " + solveCount +
                        (solveCount === 1 ? " solve" : " solves");

                    heading.classList.add("session-heading");

                    const sessionContent = document.createElement("div");
                    sessionContent.classList.add("session-content", "collapsed");

                    heading.addEventListener("click", () => {

                        sessionContent.classList.toggle("collapsed");

                        if (sessionContent.classList.contains("collapsed")) {
                            heading.textContent =
                                "▶ " + session.category +
                                " — " + formattedDate +
                                " — " + solveCount +
                                (solveCount === 1 ? " solve" : " solves");
                        } else {
                            heading.textContent =
                                "▼ " + session.category +
                                " — " + formattedDate +
                                " — " + solveCount +
                                (solveCount === 1 ? " solve" : " solves");
                        }
                    });

                    const table = document.createElement("table");

                    const tableHead = document.createElement("thead");
                    const headerRow = document.createElement("tr");

                    const headers = ["Solve", "Time", "Timestamp", "Scramble", "Video"];;

                    headers.forEach(header => {
                        const cell = document.createElement("th");
                        cell.textContent = header;
                        headerRow.appendChild(cell);
                    });

                    tableHead.appendChild(headerRow);
                    table.appendChild(tableHead);

                    const tableBody = document.createElement("tbody");

                    const videoObserver = new IntersectionObserver(
                        (entries) => {
                            entries.forEach((entry) => {
                                if (!entry.isIntersecting) {
                                    return;
                                }

                                const preview = entry.target;

                                if (preview.dataset.loaded === "true") {
                                    return;
                                }

                                preview.dataset.loaded = "true";
                                preview.click();
                            });
                        },
                        {
                            threshold: 0.5
                        }
                    );


                    session.solves.forEach(solve => {

                        const row = document.createElement("tr");

                        const formattedSolveDate = new Date(
                            solve.timestamp
                        ).toLocaleString("en-GB", {
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
                        const videoCell = document.createElement("td");

                        idCell.textContent = solve.id;
                        timeCell.textContent = solve.time;
                        timestampCell.textContent = formattedSolveDate;
                        scrambleCell.textContent = solve.scramble;


                        // Video preview

                        const preview = document.createElement("div");
                        preview.classList.add("solve-video-preview");

                        const thumbnail = document.createElement("img");

                        thumbnail.classList.add("solve-video-thumbnail");
                        thumbnail.src =
                            `https://img.youtube.com/vi/${session.youtubeVideoID}/mqdefault.jpg`;

                        thumbnail.alt = "Play solve video";

                        preview.appendChild(thumbnail);

                        videoCell.appendChild(preview);
                        videoObserver.observe(preview);


                        // Create player when preview is clicked
                        preview.addEventListener("click", () => {

                            if (typeof YT === "undefined") {
                                console.log("YouTube API has not loaded yet");
                                return;
                            }

                            const playerContainer = document.createElement("div");
                            playerContainer.classList.add("youtube-player-hidden");

                            const playerID = "youtube-player-" + solve.id;
                            playerContainer.id = playerID;

                            preview.replaceWith(playerContainer);

                            const startTime = Math.floor(solve.videoTimestamp);
                            const endTime = Math.ceil(
                                solve.videoTimestamp + solve.time + 1
                            );

                            const player = new YT.Player(playerID, {
                                width: "320",
                                height: "180",
                                videoId: session.youtubeVideoID,

                                playerVars: {
                                    autoplay: 1,
                                    start: startTime,
                                    controls: 0,
                                    modestbranding: 1,
                                    rel: 0,
                                    iv_load_policy: 3,
                                    disablekb: 1,
                                    playsinline: 1
                                },

                                events: {
                                    onReady: (event) => {
                                        event.target.mute();
                                        event.target.seekTo(startTime, true);
                                        event.target.playVideo();
                                    },
                                    onStateChange: (event) => {

                                        if (event.data === YT.PlayerState.PLAYING) {

                                            if (playerContainer.checkTime) {
                                                clearInterval(playerContainer.checkTime);
                                            }

                                            playerContainer.checkTime = setInterval(() => {

                                                if (event.target.getCurrentTime() >= endTime) {
                                                    event.target.pauseVideo();
                                                    event.target.seekTo(startTime, true);

                                                    clearInterval(playerContainer.checkTime);
                                                    playerContainer.checkTime = null;
                                                }

                                            }, 100);
                                        }

                                        if (
                                            event.data === YT.PlayerState.PAUSED ||
                                            event.data === YT.PlayerState.ENDED
                                        ) {
                                            if (playerContainer.checkTime) {
                                                clearInterval(playerContainer.checkTime);
                                                playerContainer.checkTime = null;
                                            }
                                        }
                                    }
                                }
                            });

                            playerContainer.classList.add("solve-video");
                        });

                        row.appendChild(idCell);
                        row.appendChild(timeCell);
                        row.appendChild(timestampCell);
                        row.appendChild(scrambleCell);
                        row.appendChild(videoCell);

                        tableBody.appendChild(row);
                    });

                    table.appendChild(tableBody);

                    sessionContent.appendChild(table);

                    sessionTables.appendChild(heading);
                    sessionTables.appendChild(sessionContent);
                });
            })
            .catch(error => {
                console.error("Error loading sessions:", error);
            });
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

                    const heatmap = createSolveHeatmap(categorySolves);
                    dashboardCard.appendChild(heatmap);

                    const pbVideo = createPBVideo(categorySolves, sessions);

                    if (pbVideo) {
                        dashboardCard.appendChild(pbVideo);
                    }

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