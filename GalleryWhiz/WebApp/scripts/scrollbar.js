﻿
const createScrollbar = (function () {
    /**
     * Scrollbar der TableView
     * @param {HTMLElement} parent Das Element, welches mit einer Scrollbar versehen werden soll
     * @param {(position: number) => void} positionChanged Callback zum Scrollen
     */
    function createScrollbar(parent, positionChanged) {
        /**
        * Das Div der Scrollbar
        */
        const scrollbar = document.createElement("div")
        scrollbar.classList.add("scrollbar")
        scrollbar.classList.add("scrollbarHidden")

        const up = document.createElement("div")
        up.classList.add("scrollbarUp")
        scrollbar.appendChild(up)

        const upImg = document.createElement("div")
        upImg.classList.add("scrollbarUpImg")
        up.appendChild(upImg)

        const down = document.createElement("div")
        down.classList.add("scrollbarDown")
        scrollbar.appendChild(down)

        const downImg = document.createElement("div")
        downImg.classList.add("scrollbarDownImg")
        down.appendChild(downImg)

        const grip = document.createElement("div")
        grip.classList.add("scrollbarGrip")
        scrollbar.appendChild(grip)

        /**
         * {() => void}
         */
        let setFocus

        parent.appendChild(scrollbar)

        up.onmousedown = () => {
            clearTimeout(timer)
            clearInterval(interval)
            mouseUp()

            timer = setTimeout(() => interval = setInterval(mouseUp, 20), 600)
        }

        down.onmousedown = () => {
            clearTimeout(timer)
            clearInterval(interval)
            mouseDown()

            timer = setTimeout(() => interval = setInterval(mouseDown, 20), 600)
        }

        scrollbar.onmousedown = evt => {
            if (!(evt.target).classList.contains("scrollbar"))
                return

            pageMousePosition = evt.pageY
            const isPageUp = evt.pageY < grip.offsetTop
            clearTimeout(timer)
            clearInterval(interval)
            if (isPageUp)
                pageUp()
            else
                pageDown()

            timer = setTimeout(() => interval = setInterval((isPageUp ? pageUp : pageDown), 20), 600)
        }

        grip.onmousedown = evt => {
            if (evt.which != 1)
                return
            gripping = true
            evt.preventDefault()

            gripTopDelta = grip.offsetTop + scrollbar.offsetTop - evt.pageY

            var gripperMove = evt => {
                if (!gripping || evt.which != 1) {
                    window.removeEventListener('mousemove', gripperMove)
                    return
                }

                var top = evt.pageY + gripTopDelta - scrollbar.offsetTop
                if (top < 15)
                    top = 15
                else if (top + grip.offsetHeight - 15 > (parentHeight - 32))
                    top = parentHeight - 32 - grip.offsetHeight + 15
                grip.style.top = top + 'px'

                var currentPosition = Math.floor((top - 15) / step + 0.5)
                if (currentPosition != position) {
                    position = currentPosition
                    positionChanged(position)
                }
            }

            window.addEventListener('mousemove', gripperMove)
        }

        up.onmouseup = mouseup
        down.onmouseup = mouseup
        grip.onmouseup = mouseup
        scrollbar.onmouseup = mouseup

        scrollbar.onclick = evt => evt.stopPropagation()

        scrollbar.onmouseleave = () => {
                    clearTimeout(timer)
            clearInterval(interval)
        }

        /**
         * 
         * @param {()=>void} setFocusToSet
         */
        function initialize(setFocusToSet) {
            setFocus = setFocusToSet
        }

        /**
         * 
         * @param {number} itemsCount
         * @param {number} tableCapacity
         * @param {number} newPosition
         */
        function itemsChanged(itemsCount, tableCapacity, newPosition) {
            parentHeight = parent.offsetHeight - offsetTop
            if (itemsCount)
                itemsCountAbsolute = itemsCount
            if (tableCapacity)
                itemsCountVisible = tableCapacity

            if (!itemsCountAbsolute)
                return

            if (itemsCountAbsolute <= itemsCountVisible)
                scrollbar.classList.add("scrollbarHidden")
            else {
                    scrollbar.classList.remove("scrollbarHidden")
                var gripHeight = (parentHeight - 32) * (itemsCountVisible / itemsCountAbsolute)
                if (gripHeight < 5)
                    gripHeight = 5
                steps = itemsCountAbsolute - itemsCountVisible
                step = (parentHeight - 32 - gripHeight) / steps
                grip.style.height = gripHeight + 'px'
                if (position > steps)
                    position = steps
            }
            if (newPosition != undefined)
                position = newPosition
            positionGrip()
        }

        /**
         * 
         * @param {number} position
         */
        function setPosition(position) {
            position = position
            if (position > steps)
                position = steps
            if (position < 0)
                position = 0
            positionGrip()
        }

        function mouseup() {
            clearTimeout(timer)
            clearInterval(interval)
            gripping = false
            setFocus()
        }

        function mouseUp() {
            position -= 1
            if (position < 0) {
                    position = 0
                clearTimeout(timer)
                clearInterval(interval)
                return
            }

            positionGrip()
            positionChanged(position)
        }

        function mouseDown() {
            position += 1
            if (position > steps) {
                    position = steps
                clearTimeout(timer)
                clearInterval(interval)
                return
            }
            positionGrip()
            positionChanged(position)
        }

        function pageUp() {
            if (grip.offsetTop < pageMousePosition) {
                clearTimeout(timer)
                clearInterval(interval)
                return
            }

            position -= itemsCountVisible - 1
            if (position < 0) {
                const lastTime = position != 0
                position = 0
                clearTimeout(timer)
                clearInterval(interval)
                if (lastTime) {
                    positionGrip()
                    positionChanged(position)
                }
                return
            }
            positionGrip()
            positionChanged(position)
        }

        function pageDown() {
            if (grip.offsetTop + grip.offsetHeight > pageMousePosition) {
                    clearTimeout(timer)
                clearInterval(interval)
                return
            }

            position += itemsCountVisible - 1
            if (position > steps) {
                const lastTime = position != 0
                position = steps
                clearTimeout(timer)
                clearInterval(interval)
                if (lastTime) {
                    positionGrip()
                    positionChanged(position)
                }
                return
            }

            positionGrip()
            positionChanged(position)
        }

        function positionGrip() {
            const top = 15 + position * step
            grip.style.top = top + 'px'
        }

        var position = 0
        /**
         * {(position: number)=>void}
         */
        var positionChanged 
        var gripTopDelta = -1
        var gripping = false
        /**
         * {number}
         */
        var parentHeight
        var offsetTop = 0
        /**
        * Ein zyklischer Timer
        */
        var timer
        /**
         * @type {number}
         * Ein einmalige Timeout-Intervall
         */
        var interval
        var pageMousePosition
        /**
         * @type {number}
         */
        var step
        /**
         * @type {number}
         */
        var steps
        /**
         * @type {number}
         */
        var itemsCountAbsolute
        /**
         * @type {number}
         */
        var itemsCountVisible
    //    var tableView: TableView

        return {
            initialize: initialize,
            itemsChanged: itemsChanged,
            setPosition: setPosition
        }    
    }
    return createScrollbar
})()


