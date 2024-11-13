document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("themeToggle").addEventListener("click", function () {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
    });
});