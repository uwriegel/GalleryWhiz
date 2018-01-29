﻿const createCommanderView = (function () {
    /**
    * Ein Commanderview besteht aus einer Tableview mit den Einträgen des aktuellen Verzeichnisses und einem Verzeichnis-Textfeldes
    * @param {string} id Die ID des CommanderViews
    */
    function createCommanderView(id) {
        /**
        * Das andere CommanderView
        * @type {CommanderView}
        */
        let otherView 

        const parent = document.getElementById(id)

        /**
        * Das Eingabefeld zur Eingabe eines Verzeichnisses
        */
        const commanderDirectory = document.createElement("input")
        commanderDirectory.classList.add('directory')
        parent.appendChild(commanderDirectory)

        const commanderTable = document.createElement('div')
        commanderTable.classList.add('commanderTable')
        parent.appendChild(commanderTable)

        const tableView = createTableView(commanderTable, id)

        /**
        * Das input-Element, welches die Beschränkungszeichen darstellt
        */
        const restrictor = document.createElement('input')
        restrictor.classList.add('restrictor')
        restrictor.classList.add('restrictorHide')
        parent.appendChild(restrictor)

        tableView.setOnSelectedCallback((i, o, sp) => processItem(i, o, sp))
        commanderDirectory.onfocus = () => commanderDirectory.select

        commanderDirectory.onkeydown = e => {
            switch (e.which) {
                case 13: // Enter
                    changePath(commanderDirectory.value)
                    tableView.focus()
                    break;
            }
        }

        commanderTable.onkeypress = e => keysRestrict(e)

        commanderTable.onkeydown = e => {
            switch (e.which) {
                case 8: // BACKSPACE
                    restrictBack()
                    e.preventDefault()
                    break
                case 27: // ESC
                    if (restrictor.value)
                        closeRestrict()
                    // else
                    //     this.itemsSorter.selectAll(false)
                    break
                case 32: // _
                    if (restrictor.value == "")
                        tableView.getItems().toggleSelection(tableView.getCurrentItemIndex())
                    break
                case 35: // End
                    if (e.shiftKey) {
                        tableView.getItems().selectAll(true, tableView.getCurrentItemIndex())
                        e.preventDefault()
                    }
                    break
                case 36: // Pos1
                    if (e.shiftKey) {
                        tableView.getItems().selectAll(false, tableView.getCurrentItemIndex() + 1)
                        e.preventDefault();
                    }
                    break;
                case 45: // Einfg
                    tableView.getItems().toggleSelection(tableView.getCurrentItemIndex())
                    tableView.downOne()
                    break
                case 82: // r
                    if (e.ctrlKey) {
                        refresh()
                        e.preventDefault()
                    }
                    break
                case 107: // NUM +
                    tableView.getItems().selectAll(true)
                    break
                case 109: // NUM -
                    tableView.getItems().selectAll(false)
                    break
                case 120: // F9
                    otherView.changePath(tableView.getItems().getPath())
                    break
            }
        }

        commanderDirectory.onfocus = () => commanderDirectory.select()

        // TODO:
        //changePath(localStorage[id] || "root") // TODO: "root"

        function getOtherView() {
            return otherView;
        }

        /**
         * 
         * @param {CommanderView} commanderView
         */
        function setOtherView(commanderView) {
            otherView = commanderView
        }

        function refresh() {
            changePath(tableView.getItems().getPath())
        }

        function focus() {
            tableView.focus()
        }

        function focusDirectoryInput() {
            commanderDirectory.focus()
        }

        function isDirectoryInputFocused() {
            return commanderDirectory.contains(document.activeElement)
        }

        /**
         * 
         * @param {() => void} callback
         */
        function setOnFocus(callback) {
            tableView.setOnFocus(() => callback())
        }

        /**
         * 
         * @param {(item: Item, path: string) => void} callback
         */
        function setOnCurrentItemChanged(callback) {
            tableView.setOnCurrentItemChanged(itemIndex => {
                const items = tableView.getItems()
                if (items.getItemsCount()) {
                    const item = items.getItem(itemIndex)
                    callback(item, items.getPath())
                }
            })
        }

        /**
         * 
         * @param {string} path
         * @param {string} selectPath
         */
        async function changePath(path, selectPath) {
            closeRestrict(true)
            presenter = checkPresenter(path, presenter, tableView)
            tableView.setPresenter(presenter)
            //        items = await createItems(tableView, path, selectPath)
            localStorage[id] = path
            commanderDirectory.value = path
        }

        /**
         * 
         * @param {number} itemIndex
         * @param {boolean} openWith
         * @param {boolean} showProperties
         * @param {boolean} fromOtherView
         */
        function processItem(itemIndex, openWith, showProperties, fromOtherView) {
            const { selectedPath, currentPath } = tableView.getItems().getSelectedPath(itemIndex)
            changePath(selectedPath, currentPath)
            tableView.focus()
        }

        /**
         * 
         * @param {KeyboardEvent} e
         */
        function keysRestrict(e) {
            let restrict = String.fromCharCode(e.charCode).toLowerCase()
            restrict = restrictor.value + restrict

            if (tableView.getItems().restrict(restrict))
                checkRestrict(restrict)
            if (!tableView.focus())
                tableView.pos1()

        }

        /**
         * 
         * @param {string} restrict
         */
        function checkRestrict(restrict) {
            restrictor.classList.remove('restrictorHide')
            restrictor.value = restrict
        }

        /**
         * 
         * @param {boolean} noRefresh
         */
        function closeRestrict(noRefresh) {
            restrictor.classList.add('restrictorHide')
            restrictor.value = ""
            tableView.getItems().closeRestrict(noRefresh)
            tableView.focus()
        }

        function restrictBack() {
            let restrict = restrictor.value
            restrict = restrict.substring(0, restrict.length - 1)
            if (restrict.length == 0)
                closeRestrict()
            else {
                if (tableView.getItems().restrict(restrict, true))
                    checkRestrict(restrict)
                tableView.focus()
            }
        }

        var presenter

        return {
            /**
            * Das andere CommanderView
            */
            getOtherView: getOtherView,
            setOtherView: setOtherView,
            refresh: refresh,
            focus: focus,
            focusDirectoryInput: focusDirectoryInput,
            isDirectoryInputFocused: isDirectoryInputFocused,
            setOnFocus: setOnFocus,// 
            setOnCurrentItemChanged: setOnCurrentItemChanged,
            changePath: changePath
        }
    }
    
    return createCommanderView
})()
