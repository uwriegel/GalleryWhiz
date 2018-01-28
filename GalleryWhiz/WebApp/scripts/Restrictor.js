/**
 * * Der Restrictor befindet sich zwischen ItemsModel und ItemsViewModel und ist für das Begrenzen der Einträge zuständig,
 * wenn man beispielsweise "s" eingibt, werden nur noch Einträge, die mit "s" anfangen, angezeigt
 */
class Restrictor {
    get ItemsSorter() {
        return this.itemsSorter;
    }
    constructor(itemsSorter) {
        this.itemsSorter = itemsSorter;
    }
    /**
     * Einschränken der Anzeige der Einträge auf die Beschränkten.
     * @param prefix Der eingegebene Prefix zur Beschänkung
     * @param back Im Prefix um einen Buchstaben zurückgehen
     * @returns true: Es wird restriktiert
     */
    restrict(prefix, back) {
        var restrictedItems = [];
        if (back)
            this.itemsToShow = this.itemsSorter.getItems();
        this.itemsToShow.forEach((item) => {
            if (item.name.toLowerCase().indexOf(prefix) == 0)
                restrictedItems.push(item);
        });
        if (restrictedItems.length > 0) {
            this.itemsToShow = restrictedItems;
            //if (this.observator)
            //    this.observator.itemsChanged(0)
            this.itemsSorter.itemsChanged(0);
            return true;
        }
        return false;
    }
    /**
     * Die Beschränkung aufheben
     * @param noRefresh
     */
    closeRestrict(noRefresh) {
        this.itemsToShow = this.itemsSorter.getItems();
        this.itemsSorter.sortItems();
        //if (!noRefresh && this.observator)
        //    this.observator.itemsChanged(0)
        if (!noRefresh)
            this.itemsSorter.itemsChanged(0);
    }
    ItemsCleared() {
        this.ItemsCleared();
    }
    itemsChanged(lastCurrentIndex) {
        this.itemsSorter.itemsChanged(lastCurrentIndex);
        this.itemsToShow = this.itemsSorter.getItems();
    }
    updateItems() {
        this.itemsSorter.updateItems();
    }
    refreshSelection(itemIndex, isSelected) {
        this.itemsSorter.refreshSelection(itemIndex, isSelected);
    }
    getCurrentItemIndex() {
        return this.itemsSorter.getCurrentItemIndex();
    }
    registerObservation(observator) {
        this.itemsSorter.registerObservation(observator);
    }
    getItemsCount() {
        return this.itemsSorter.getItemsCount();
    }
    /**
     * Ermittlung des Eintrags mit dem angegebenen Index
     * @param index Der Index des gewünschten Eintrages
     */
    getItem(index) {
        if (!this.itemsToShow || index > this.itemsToShow.length)
            return null;
        return this.itemsToShow[index];
    }
}
