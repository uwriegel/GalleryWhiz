
const createVerticalGrid = (function () {
    /**
     * Oben beide CommanderViews, unten, wenn eingeschaltet, der Viewer
     * @param {HTMLDivElement} gridContainer der beinhaltende Container
     * @param {HTMLElement} topView die obere Ansicht
     * @param {HTMLElement} bottomView die untere Ansicht
     * @param {HTMLDivElement} gridSplitter der Teiler
     * @param {() => void} onChanged Callback, wird aufgerufen wenn die Aufteilung geändert wurde
     */
    function createVerticalGrid(
        gridContainer,
        topView,
        bottomView,
        gridSplitter,
        onChanged) {

        let topPercent = localStorage["vgrid"]
        if (!topPercent)
            topPercent = 70

        const grid = createGrid(gridContainer, topView, bottomView, gridSplitter,
            (firstPercent) => {
                topPercent = firstPercent
                localStorage["vgrid"] = firstPercent
                onChanged()
            },
            true)

        grid.setSize(topPercent)
        switchBottom(false)

        /**
         * Ein/Ausblenden der unteren Ansicht
         * @param {boolean} preview
         */
        function switchBottom(preview) {
            if (preview) {
                bottomView.classList.remove("hidden")
                gridSplitter.classList.remove("hidden")
                topView.style.height = `calc(${topPercent}% - 3px)`
            } else {
                bottomView.classList.add("hidden")
                gridSplitter.classList.add("hidden")
                topView.style.height = "100%"
            }
        }
    }
    return createVerticalGrid
})()