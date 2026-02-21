const DARK_PASSWORD = "shadow123";
const BRIGHT_PASSWORD = "light123";

let currentMode = "";

function checkPassword() {
    const input = document.getElementById("passwordInput").value;

    if (input === DARK_PASSWORD) {
        currentMode = "dark";
        initApp();
    } 
    else if (input === BRIGHT_PASSWORD) {
        currentMode = "bright";
        initApp();
    } 
    else {
        document.getElementById("errorMsg").innerText = "Wrong Password";
    }
}

function initApp() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    document.body.classList.add(currentMode);
    document.getElementById("modeTitle").innerText =
        currentMode === "dark" ? "Dark Mode Goals" : "Bright Mode Goals";

    loadGoals();
}

function addGoal() {
    const input = document.getElementById("goalInput");
    const goals = JSON.parse(localStorage.getItem(currentMode)) || [];
    goals.push(input.value);
    localStorage.setItem(currentMode, JSON.stringify(goals));
    input.value = "";
    loadGoals();
}

function loadGoals() {
    const list = document.getElementById("goalList");
    list.innerHTML = "";
    const goals = JSON.parse(localStorage.getItem(currentMode)) || [];
    goals.forEach(goal => {
        const li = document.createElement("li");
        li.innerText = goal;
        list.appendChild(li);
    });
}
