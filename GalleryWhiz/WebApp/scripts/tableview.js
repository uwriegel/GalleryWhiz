
const createTableView = (function () {

    /**
     * Listview mit mehreren Spalten
     * @param {HTMLElement} parent Das Elternelement, das die Tableview beinhaltet
     * @param {string} id
     */
    function createTableView(parent, id) {
        const tableView = document.createElement("div")

        let presenter
        let items = createEmptyItems()
        /**
         * @type { ColumnsControl }
         */
        let columnsControl 
        /**
        * Index des aktuellen Eintrags in der Liste der Einträge (items)
        */
        let currentItemIndex = 0
        let startPosition = 0
        /**
        * Die Anzahl der Einträge, die dieses TableView in der momentanen Größe tatsächlich auf dem Bildschirm anzeigen kann
        */
        let tableCapacity = -1
        /**
         * @type {number}
         */
        let rowHeight 
        /**
         * @type {(itemIndex: number) => void}
         */
        let onCurrentItemChanged 
        /**
         * @type {(itemIndex: number) => void}
         */
        let onToggleSelection 
        /**
         * @type {(itemIndex: number, openWith: boolean, showProperties: boolean) => void}
         */
        let onSelectedCallback
        /**
         * @type {() => void}
         */
        let onFocus

        tableView.classList.add('tableView')
        tableView.tabIndex = 1
        parent.appendChild(tableView)

        const scrollbar = createScrollbar(parent, scroll)

        const table = document.createElement("table")
        table.classList.add('tableViewTable')
        tableView.appendChild(table)

        tableView.addEventListener("focusin", () => {
            if (onFocus)
                onFocus()
            focus()
        })

        tableView.onkeydown = e => {
            switch (e.which) {
                case 13: // Return
                    if (onSelectedCallback)
                        onSelectedCallback(currentItemIndex, e.ctrlKey, e.altKey)
                    break;
                case 33:
                    pageUp()
                    break
                case 34:
                    pageDown()
                    break
                case 35: // End
                    if (!e.shiftKey)
                        end()
                    break
                case 36: //Pos1
                    if (!e.shiftKey)
                        pos1()
                    break
                case 38:
                    upOne()
                    break
                case 40:
                    downOne()
                    break
                default:
                    return // exit this handler for other keys
            }
            e.preventDefault() // prevent the default action (scroll / move caret)
        }

        let recentHeight = tableView.clientHeight
        const thead = document.createElement("thead")
        table.appendChild(thead)

        const tbody = document.createElement("tbody")
        table.appendChild(tbody)

        tbody.addEventListener('mousewheel', evt => {
            var wheelEvent = evt
            var delta = wheelEvent.wheelDelta / Math.abs(wheelEvent.wheelDelta) * 3
            scroll(startPosition - delta)
        })

        tbody.ondblclick = () => {
            if (onSelectedCallback)
                onSelectedCallback(currentItemIndex, false, false)
        }

        {
            let tr = document.createElement("tr")
            thead.appendChild(tr)
        }

        scrollbar.initialize(focus)

        tbody.onmousedown = evt => {
            const tr = evt.target.closest("tr")
            currentItemIndex = Array.from(tbody.querySelectorAll("tr")).findIndex(n => n == tr) + startPosition

            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)

            if (!hasFocus())
                tr.focus()
            else if (onToggleSelection)
                onToggleSelection(currentItemIndex)
        }

        window.addEventListener('resize', () => resizeChecking())

        const getId = () => id

        function setItems(itemsToSet) {
            items = itemsToSet
            // TODO:
            //items.registerView(view)
        }

        function getItems() { return items}

        function setPresenter(presenterToSet) {
            presenter = presenterToSet
        }

        function getCurrentItemIndex() {
            return currentItemIndex
        }

        function ItemsCleared() {
            currentItemIndex = 0
            clearItems()
        }

        /**
         * 
         * @param {number} lastCurrentIndex
         */
        function itemsChanged(lastCurrentIndex) {
            ItemsCleared()
            currentItemIndex = lastCurrentIndex
            displayItems(0)

            if (tableView == document.activeElement)
                focus()
            scrollIntoView()
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)
        }

        function updateItems() {
            const trs = tbody.querySelectorAll('tr')
            for (let i = 0; i < trs.length; i++)
                presenter.updateItem(trs[i], items.getItem(i + startPosition))
        }

        function updateSelections() {
            const trs = tbody.querySelectorAll('tr')
            for (let i = 0; i < trs.length; i++)
                presenter.updateSelection(trs[i], items.getItem(i + startPosition))
        }

        /**
         * 
         * @param {number} itemIndex
         */
        function updateSelection(itemIndex) {
            const item = tbody.querySelectorAll('tr')[itemIndex - startPosition]
            presenter.updateSelection(item, items.getItem(itemIndex))
        }

        /**
         * 
         * @param {(itemIndex: number, openWith: boolean, showProperties: boolean) => void} callback
         */
        function setOnSelectedCallback(callback) {
            onSelectedCallback = callback
        }

        /**
         * 
         * @param {(itemIndex: number) => void)} callback
         */
        function setOnCurrentItemChanged(callback) {
            onCurrentItemChanged = callback
        }

        /**
         * 
         * @param {()=>void} callback
         */
        function setOnFocus(callback) {
            onFocus = callback
        }

        /**
         * 
         * @param {(itemIndex: number) => void} callback
         */
        function setOnToggleSelection(callback) {
            onToggleSelection = callback
        }

        /**
        * Setzen des Focuses
        * @returns true, wenn der Fokus gesetzt werden konnte
        */
        function focus() {
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)

            const index = currentItemIndex - startPosition
            if (index >= 0 && index < tableCapacity) {
                const trs = tbody.querySelectorAll('tr')
                if (index < trs.length) {
                    trs[index].focus()
                    return true
                }
            }
            tableView.focus()
            return false
        }

        function pos1() {
            clearItems()
            displayItems(0)
            currentItemIndex = 0
            tbody.querySelectorAll('tr')[0].focus()
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)
        }

        function downOne() {
            if (currentItemIndex == items.getItemsCount() - 1)
                return false

            scrollIntoView()

            currentItemIndex++
            if (currentItemIndex - startPosition >= tableCapacity) {
                tbody.querySelector('tr').remove()
                startPosition += 1
                scrollbar.setPosition(startPosition)
                if (currentItemIndex < items.getItemsCount() - 1) {
                    const node = insertItem(currentItemIndex + 1)
                    tbody.appendChild(node)
                }
            }

            tbody.querySelectorAll('tr')[currentItemIndex - startPosition].focus()
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)
            return true
        }

        /**
         * 
         * @param {number} x
         * @param {number} y
         * @returns { boolean}
         */
        function isMouseWithin(x, y) {
            const rect = tableView.getBoundingClientRect()
            rect.left, rect.top, rect.width, rect.bottom

            //console.log(`${x} ${y} ${rectObject.left} ${rectObject.top} ${rectObject.width} ${rectObject.bottom}`)

            const result = (x > rect.left && x < (rect.left + rect.width)
                && y > rect.top && y < (rect.top + rect.bottom))
            if (result)
                tableView.classList.add("highlight")
            else
                tableView.classList.remove("highlight")
            return result
        }

        function dragLeave() {
            tableView.classList.remove("highlight")
        }

        /**
         * 
         * @param {ColumnsControl} value
         */
        function setColumns(value) {
            columnsControl = value

            const theadrow = thead.querySelector('tr')
            theadrow.innerHTML = ""
            columnsControl.initializeEachColumn(item => {
                const th = document.createElement("th")
                th.innerHTML = item
                theadrow.appendChild(th)
            })

            columnsControl.initialize(tableView, view)
        }

        function initializeRowHeight() {
            const node = presenter.insertMeasureItem()
            tbody.appendChild(node)
            const td = tbody.querySelector('td')
            rowHeight = td.clientHeight
            clearItems()
        }

        function calculateTableHeight() {
            if (rowHeight) {
                tableCapacity = Math.floor((tableView.offsetHeight - thead.offsetHeight) / rowHeight)
                if (tableCapacity < 0)
                    tableCapacity = 0
            }
            else
                tableCapacity = -1
            scrollbar.itemsChanged(0, tableCapacity)
        }

        /**
         * 
         * @param {number} index
         * @returns {HTMLTableRowElement}
         */
        function insertItem(index) {
            return presenter.insertItem(items.getItem(index))
        }

        function hasFocus() {
            return tableView.contains(document.activeElement)
        }

        function clearItems() {
            const focus = hasFocus()
            tbody.innerHTML = ''
            if (focus)
                tableView.focus()
        }

        /**
         * 
         * @param {number} start
         */
        function displayItems(start) {
            startPosition = start

            if (tableCapacity == -1) {
                initializeRowHeight()
                calculateTableHeight()
            }

            const end = Math.min(tableCapacity + 1 + startPosition, items.getItemsCount())
            for (let i = startPosition; i < end; i++) {
                var node = insertItem(i)
                tbody.appendChild(node)
            }

            scrollbar.itemsChanged(items.getItemsCount(), tableCapacity, startPosition)
        }

        function upOne() {
            if (currentItemIndex == 0)
                return
            scrollIntoView()

            currentItemIndex--
            if (currentItemIndex - startPosition < 0) {
                if (currentItemIndex + tableCapacity < items.getItemsCount() - 1) {
                    const trs = tbody.querySelectorAll('tr')
                    trs[trs.length - 1].remove()
                }
                if (currentItemIndex >= 0) {
                            startPosition -= 1
                    scrollbar.setPosition(startPosition)
                    const node = insertItem(currentItemIndex)
                    tbody.insertBefore(node, tbody.firstChild)
                }
            }

            tbody.querySelectorAll('tr')[currentItemIndex - startPosition].focus()
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)
        }

        function pageUp() {
            if (currentItemIndex == 0)
                return

            scrollIntoView()

            if (currentItemIndex - startPosition > 0)
                currentItemIndex = startPosition
            else {
                currentItemIndex -= tableCapacity
                if (currentItemIndex < 0)
                    currentItemIndex = 0
                clearItems()
                displayItems(currentItemIndex)
            }

            tbody.querySelectorAll('tr')[currentItemIndex - startPosition].focus()
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)
        }

        function pageDown() {
            if (currentItemIndex == items.getItemsCount() - 1)
                return

            scrollIntoView()

            if (currentItemIndex - startPosition < tableCapacity - 1) {
                currentItemIndex = Math.min(tableCapacity, items.getItemsCount()) - 1 + startPosition
                if (currentItemIndex >= items.getItemsCount())
                    currentItemIndex = items.getItemsCount() - 1
            }
            else {
                currentItemIndex += tableCapacity
                if (currentItemIndex >= items.getItemsCount())
                    currentItemIndex = items.getItemsCount() - 1
                clearItems()
                displayItems(currentItemIndex - tableCapacity + 1)
            }

            tbody.querySelectorAll('tr')[currentItemIndex - startPosition].focus()
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)
        }

        function end() {
            clearItems()
            currentItemIndex = items.getItemsCount() - 1
            let startPos = currentItemIndex - tableCapacity + 1
            if (startPos < 0)
                startPos = 0
            displayItems(startPos)
            tbody.querySelectorAll('tr')[currentItemIndex - startPosition].focus()
            if (onCurrentItemChanged)
                onCurrentItemChanged(currentItemIndex)
        }

        function scrollIntoView() {
            const selector = currentItemIndex - startPosition;
            if (selector < 0)
                scroll(currentItemIndex)
            else if (selector >= tableCapacity) {
                scroll(currentItemIndex)
                scroll(currentItemIndex - tableCapacity + 1)
            }
        }

        /**
         * 
         * @param {number} position
         */
        function scroll(position) {
            if (items.getItemsCount() < tableCapacity)
                return
            if (position < 0)
                position = 0
            else if (position > items.getItemsCount() - tableCapacity)
                position = items.getItemsCount() - tableCapacity
            startPosition = position
            clearItems()
            displayItems(startPosition)

            const selector = currentItemIndex - startPosition
            if (selector >= 0 && selector < tableCapacity)
                tbody.querySelectorAll('tr')[currentItemIndex - startPosition].focus()
            else
                tableView.focus()
        }

        function resizeChecking() {
            if (tableView.clientHeight != recentHeight) {
                const isFocused = tableView.contains(document.activeElement)
                recentHeight = tableView.clientHeight
                const tableCapacityOld = tableCapacity
                calculateTableHeight()
                const itemsCountOld = Math.min(tableCapacityOld + 1, items.getItemsCount() - startPosition)
                const itemsCountNew = Math.min(tableCapacity + 1, items.getItemsCount() - startPosition)
                if (itemsCountNew < itemsCountOld) {
                    for (i = itemsCountOld - 1; i >= itemsCountNew; i--)
                        tbody.children[i].remove()
                }
                else {
                    for (var i = itemsCountOld; i < itemsCountNew; i++) {
                        const node = insertItem(i + startPosition)
                        tbody.appendChild(node)
                    }
                }
                if (isFocused)
                    focus()
            }
        }

        const view = {
            getId: getId,
            setPresenter: setPresenter,
            setItems: setItems,
            getItems: getItems,
            getCurrentItemIndex: getCurrentItemIndex,
            ItemsCleared: ItemsCleared,
            itemsChanged: itemsChanged,
            updateItems: updateItems,
            updateSelections: updateSelections,
            updateSelection: updateSelection,
            setOnSelectedCallback: setOnSelectedCallback,
            setOnCurrentItemChanged: setOnCurrentItemChanged,
            setOnFocus: setOnFocus,
            setOnToggleSelection: setOnToggleSelection,
            focus: focus,
            pos1: pos1,
            downOne: downOne,
            isMouseWithin: isMouseWithin,
            dragLeave: dragLeave,
            setColumns: setColumns
        }

        return view
    }

    return createTableView
})()