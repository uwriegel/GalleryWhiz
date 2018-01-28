var SavedHistory = (function () {
    function saveHistory(historyItem) {
        var history;
        var json = localStorage["History"];
        if (json) {
            history = JSON.parse(json);
            if (history.some(n => {
                return n == historyItem;
            }))
                return;
        }
        else
            history = [];
        history.push(historyItem);
        if (history.length >= 20)
            history.shift();
        localStorage["History"] = JSON.stringify(history);
    }
    /**
     * Abfrage der Historie
     * @param lastCurrentDir Das Verzeichnis, welches durch dieses ersetzt werden soll
     */
    function getItems(lastCurrentDir) {
        return {
            currentDirectory: "History",
            items: [{
                    imageUrl: "images/parentfolder.png",
                    kind: ItemsKind.Parent,
                    name: "..",
                    fileSize: 0,
                    parent: lastCurrentDir || "drives"
                }].concat(get().reverse().map(n => {
                return {
                    imageUrl: "images/folder.png",
                    kind: ItemsKind.History,
                    name: FileHelper.getNameFromPath(n),
                    favoriteTarget: n,
                    fileSize: 0,
                    parent: "drives"
                };
            }))
        };
    }
    function get() {
        var historyString = localStorage["History"];
        if (!historyString)
            return [];
        return JSON.parse(historyString);
    }
    return {
        saveHistory: saveHistory,
        getItems: getItems
    };
})();
