// Global Theme Manager
// Run immediately to prevent flash of unstyled content
(function () {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
        document.documentElement.classList.add("dark");
    }

    document.addEventListener("DOMContentLoaded", () => {
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                document.documentElement.classList.toggle("dark");
                const currentDark = document.documentElement.classList.contains("dark");
                localStorage.setItem("theme", currentDark ? "dark" : "light");
            });
        }
    });
})();
