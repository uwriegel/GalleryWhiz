
const createGrid = (function () {
    /**
     * Mechanismus zur variablen Aufteilung zweier Ansichten mit Hilfe eines Teilers
     * @param {HTMLDivElement} gridContainer
     * @param {HTMLElement} firstView die erste Ansicht
     * @param {HTMLElement} secondView die zweite Ansicht
     * @param {HTMLDivElement} gridSplitter der Teiler
     * @param {any} onChanged Callback, wird aufgerufen wenn die Aufteilung geändert wurde
     * @param {boolean} isVertical Die Aufteilung erfolgt vertikal
     */
    function createGrid(gridContainer,
        firstView,
        secondView,
        gridSplitter,
        onChanged,
        isVertical) {
        gridSplitter.addEventListener('mousedown', evt => {
            if (evt.which != 1)
                return
            let firstPercent
            const initialPosition = isVertical ? evt.pageY : evt.pageX
            const start = isVertical ? firstView.offsetHeight : firstView.offsetWidth

            const onmousemove = (evt) => {
                const delta = (isVertical ? evt.pageY : evt.pageX) - initialPosition

                const position = start + delta
                firstPercent = position / ((isVertical ? gridContainer.offsetHeight : gridContainer.offsetWidth) - 6) * 100
                if (firstPercent < 4)
                    firstPercent = 4
                else if (firstPercent > 96)
                    firstPercent = 96
                setSize(firstPercent)

                evt.stopPropagation()
                evt.preventDefault()
            }

            const onmouseup = (evt) => {
                window.removeEventListener('mousemove', onmousemove, true)
                window.removeEventListener('mouseup', onmouseup, true)
                evt.stopPropagation();
                evt.preventDefault();
                if (onChanged)
                    onChanged(firstPercent)
            }

            window.addEventListener('mousemove', onmousemove, true)
            window.addEventListener('mouseup', onmouseup, true)

            evt.stopPropagation()
            evt.preventDefault()
        }, true)

        function setSize(firstPercent) {
            const secondPercent = 100 - firstPercent;
            gridSplitter.style[isVertical ? 'top' : 'left'] = `calc(${firstPercent}% - 3px)`
            firstView.style[isVertical ? 'height' : 'width'] = `calc(${firstPercent}% - 3px)`
            secondView.style[isVertical ? 'top' : 'left'] = `calc(${firstPercent}% + 3px)`
            secondView.style[isVertical ? 'height' : 'width'] = `calc(${secondPercent}% - 3px)`
        }

        return {
            /**
             * Setzen der Größen der Elemente
             * @param firstPercent Prozentzahl der Größe des ersten Elements
             */
            setSize: setSize
        }
    }
    return createGrid
})()
