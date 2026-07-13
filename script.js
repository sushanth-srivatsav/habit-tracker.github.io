const DARK_PASSWORD = "harmageddon";
const BRIGHT_PASSWORD = "shema";

let currentMode = "";
let currentGoal = "";
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let chart;

// PASSWORD CHECK
function checkPassword() {
    const input = document.getElementById("passwordInput").value;

    if (input === DARK_PASSWORD) {
        currentMode = "dark";
    } else if (input === BRIGHT_PASSWORD) {
        currentMode = "bright";
    } else {
        document.getElementById("errorMsg").innerText = "Wrong Password";
        return;
    }

    initApp();
}

// INIT APP
function initApp() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    document.body.className = currentMode;

    const greeting = document.getElementById("greeting");
    greeting.innerText = currentMode === "dark"
        ? "Welcome Loki"
        : "Welcome Sritej";

    loadGoals();
}

// SWITCH MODE
function toggleMode() {

    if (currentMode === "dark") {
        currentMode = "bright";
    } else {
        currentMode = "dark";
    }

    // Apply theme
    document.body.className = currentMode;

    // Update greeting
    const greeting = document.getElementById("greeting");
    greeting.innerText = currentMode === "dark"
        ? "Welcome Loki"
        : "Welcome Sritej";

    // Reset current goal so systems don't mix
    currentGoal = "";

    // Clear graph
    if (chart) {
        chart.destroy();
    }

    // Reload goals for that mode
    loadGoals();
}

// GOALS
function addGoal() {
    const nameInput = document.getElementById("goalInput");
    const yLabelInput = document.getElementById("yLabelInput");

    if (!nameInput.value) return;

    const key = currentMode + "_goals";
    const goals = JSON.parse(localStorage.getItem(key)) || [];

    goals.push({
        name: nameInput.value,
        yLabel: yLabelInput.value || "Value"
    });

    localStorage.setItem(key, JSON.stringify(goals));

    nameInput.value = "";
    yLabelInput.value = "";

    loadGoals();
}
function loadGoals() {
    const list = document.getElementById("goalList");
    list.innerHTML = "";

    const key = currentMode + "_goals";
    const goals = JSON.parse(localStorage.getItem(key)) || [];

    goals.forEach((goal, index) => {
        const li = document.createElement("li");

        const span = document.createElement("span");
        span.innerText = goal.name;
        span.style.cursor = "pointer";
        span.onclick = () => selectGoal(goal);

        const delBtn = document.createElement("button");
        delBtn.innerText = "Delete";
        delBtn.style.marginLeft = "10px";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteGoal(index);
        };

        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}// SELECT GOAL
function selectGoal(goal) {
    currentGoal = goal;
    loadChart();
}
// DELETE GOAL
function deleteGoal(index) {

    const key = currentMode + "_goals";
    const goals = JSON.parse(localStorage.getItem(key)) || [];

    const goalToDelete = goals[index].name;

    // Remove goal from goal list
    goals.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(goals));

    // Remove all graph data related to this goal
    Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith(currentMode + "_" + goalToDelete + "_")) {
            localStorage.removeItem(storageKey);
        }
    });

    // Reset currentGoal if deleted
    if (currentGoal && currentGoal.name === goalToDelete) {
        currentGoal = "";
        if (chart) chart.destroy();
    }

    loadGoals();
}
// GRAPH
function loadChart() {
    if (!currentGoal) return;

    const ctx = document.getElementById("goalChart").getContext("2d");
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);

    const key = `${currentMode}_${currentGoal.name}_${currentYear}_${currentMonth}`;
    const stored = JSON.parse(localStorage.getItem(key)) || Array(daysInMonth).fill(0);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: currentGoal.name,
                data: stored,
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
    responsive: true,
    interaction: {
        intersect: false,
        mode: "index"
    },
    plugins: {
        tooltip: {
            callbacks: {
                label: function(context) {
                    return context.dataset.label + ": " +
                           Number(context.raw).toFixed(3);
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            suggestedMax: parseFloat(document.getElementById("yMax").value) || 10,
            ticks: {
                callback: function(value) {
                    return Number(value).toFixed(3);
                }
            },
            title: {
                display: true,
                text: currentGoal.yLabel
            }
        }
    }
}
    });
}

// SAVE ENTRY
function saveDayValue() {
    if (!currentGoal) return;

    const day = parseInt(document.getElementById("dayInput").value) - 1;
    const value = parseFloat(document.getElementById("valueInput").value);

if (isNaN(value)) {
    alert("Please enter a valid number.");
    return;
}

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const key = `${currentMode}_${currentGoal.name}_${currentYear}_${currentMonth}`;
    const stored = JSON.parse(localStorage.getItem(key)) || Array(daysInMonth).fill(0);

    stored[day] = value;
    localStorage.setItem(key, JSON.stringify(stored));

    loadChart();
}

// MONTH CHANGE
function changeMonth(direction) {
    currentMonth += direction;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    loadChart();
}
