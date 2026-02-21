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
    const input = document.getElementById("goalInput");
    if (!input.value) return;

    const key = currentMode + "_goals";
    const goals = JSON.parse(localStorage.getItem(key)) || [];
    goals.push(input.value);
    localStorage.setItem(key, JSON.stringify(goals));
    input.value = "";
    loadGoals();
}

function loadGoals() {
    const list = document.getElementById("goalList");
    list.innerHTML = "";

    const key = currentMode + "_goals";
    const goals = JSON.parse(localStorage.getItem(key)) || [];

    goals.forEach(goal => {
        const li = document.createElement("li");
        li.innerText = goal;
        li.onclick = () => selectGoal(goal);
        list.appendChild(li);
    });
}

// SELECT GOAL
function selectGoal(goal) {
    currentGoal = goal;
    loadChart();
}

// GRAPH
function loadChart() {
    if (!currentGoal) return;

    const ctx = document.getElementById("goalChart").getContext("2d");
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);

    const key = `${currentMode}_${currentGoal}_${currentYear}_${currentMonth}`;
    const stored = JSON.parse(localStorage.getItem(key)) || Array(daysInMonth).fill(0);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: currentGoal,
                data: stored,
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: parseInt(document.getElementById("yMax").value) || 10
                }
            }
        }
    });
}

// SAVE ENTRY
function saveDayValue() {
    if (!currentGoal) return;

    const day = parseInt(document.getElementById("dayInput").value) - 1;
    const value = parseInt(document.getElementById("valueInput").value);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const key = `${currentMode}_${currentGoal}_${currentYear}_${currentMonth}`;
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
