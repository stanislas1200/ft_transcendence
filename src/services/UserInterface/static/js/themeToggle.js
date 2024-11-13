document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById("themeToggle")
    if (!toggle) return;
    toggle.addEventListener("click", function () {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
    });
});