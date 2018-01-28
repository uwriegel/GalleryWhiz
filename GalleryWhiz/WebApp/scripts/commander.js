// TODO: Weiterentwicklung
//
// Start as Admin im Hintergrund
// drives: Gespeicherte Ansichten
// F10 MENÜ Erklärung der Tastenkürzel oder Hilfe
// RegistryItems anzeigen
// NachRefresh Selektion erhalten
// Conflicts: conflict liste in die Focusable anhängen
// Rename auch von mehreren Dateien
class Commander {
    constructor() {
        this.leftView = new CommanderView("leftView");
        this.rightView = new CommanderView("rightView");
        this.leftView.otherView = this.rightView;
        this.rightView.otherView = this.leftView;
        this.viewer = new Viewer();
        this.leftView.setOnCurrentItemChanged(this.currentItemChanged.bind(this));
        this.rightView.setOnCurrentItemChanged(this.currentItemChanged.bind(this));
        this.focusedView = this.leftView;
        this.leftView.setOnFocus(() => this.focusedView = this.leftView);
        this.rightView.setOnFocus(() => this.focusedView = this.rightView);
        this.footer = document.getElementById("footer");
        this.leftView.initialize();
        this.rightView.initialize();
        this.leftView.focus();
        var gridElement = document.getElementById("grid");
        var viewerElement = document.getElementById("viewer");
        var grid = Grid(gridElement, document.getElementById("leftView"), document.getElementById("rightView"), document.getElementById("grip"), () => this.focusedView.focus());
        this.vgrid = new VerticalGrid(document.getElementById("vgrid"), gridElement, viewerElement, document.getElementById("vgrip"), () => this.focusedView.focus());
        viewerElement.onclick = () => this.focusedView.focus();
        this.initializeOnKeyDownHandler();
        if (localStorage["showHidden"] == "true")
            this.showHidden(true);
        //if (localStorage["darkTheme"] = "true")
        //    this.darkTheme(true)
    }
    getCommanderView(id) {
        switch (id) {
            case "leftView":
                return this.leftView;
            case "rightView":
                return this.rightView;
        }
    }
    getFocused() {
        return this.focusedView;
    }
    dragOver(x, y) {
        if (this.leftView.isMouseInTableView(x, y)) {
            // console.log(`Drag: ${x}, ${y}`);
        }
        if (this.rightView.isMouseInTableView(x, y)) {
            //console.log(`Drag: ${x}, ${y}`);
        }
    }
    dragLeave() {
        this.leftView.dragLeave();
        this.rightView.dragLeave();
    }
    drop(x, y, dragDropKind, directory, items) {
        if (this.leftView.isMouseInTableView(x, y)) {
            this.leftView.dragLeave();
            this.rightView.drop(dragDropKind, directory, items);
        }
        if (this.rightView.isMouseInTableView(x, y)) {
            this.rightView.dragLeave();
            this.leftView.drop(dragDropKind, directory, items);
        }
    }
    initializeOnKeyDownHandler() {
        document.onkeydown = evt => {
            switch (evt.which) {
                case 9:// TAB
                    if (!evt.shiftKey) {
                        if (this.focusedView.isDirectoryInputFocused())
                            this.focusedView.focus();
                        else {
                            var toFocus = this.focusedView == this.leftView ? this.rightView : this.leftView;
                            toFocus.focus();
                        }
                    }
                    else
                        this.focusedView.focusDirectoryInput();
                    break;
                case 72:// h
                    if (evt.ctrlKey) {
                        this.showHidden(localStorage["showHidden"] != "true");
                        break;
                    }
                    else
                        return;
                case 83:// s
                    if (evt.ctrlKey) {
                        SavedViews.save({
                            left: this.leftView.currentDirectory,
                            right: this.rightView.currentDirectory
                        });
                        break;
                    }
                    else
                        return;
                case 112:// F1
                    if (evt.ctrlKey) {
                        this.leftView.changeDirectory("SavedViews");
                        this.rightView.changeDirectory("SavedViews");
                    }
                    break;
                case 114:// F3
                    this.vgrid.switchBottom();
                    break;
                case 116:// F5
                    break;
                case 121:// F10
                    break;
                default:
                    return;
            }
            evt.preventDefault();
        };
    }
    async showHidden(show) {
        await Connection.showHidden(show);
        localStorage["showHidden"] = show;
        this.leftView.refresh();
        this.rightView.refresh();
    }
    async darkTheme(activate) {
        if (activate) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.id = 'darkThemeStylesheet';
            link.type = 'text/css';
            link.href = 'styles/dark.css';
            link.media = 'all';
            head.appendChild(link);
        }
        else {
            var styleSheet = document.getElementById("darkThemeStylesheet");
            styleSheet.remove();
        }
        localStorage["darkTheme"] = activate;
    }
    currentItemChanged(item, directory) {
        if (item) {
            var text = directory + '\\' + item.name;
            this.footer.textContent = text;
            this.viewer.selectionChanged(text);
        }
        else {
            this.footer.textContent = "Nichts selektiert";
            this.viewer.selectionChanged();
        }
    }
}
document.addEventListener("DOMContentLoaded", function ready() {
    document.removeEventListener("DOMContentLoaded", ready, false);
    commanderInstance = new Commander();
}, false);
var commanderInstance;
