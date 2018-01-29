function createEmptyItems() {
    return {
        getPath: () => "",
        getItem: index => { throw "no items" },
        getItemsCount: () => 0,
        getSelectedPath: index => { return { selectedPath: "", currentPath: "" } },
        restrict: (prefix, back) => false,
        closeRestrict: (noRefresh) => { },
        selectAll: (select, startIndex) => { },
        toggleSelection: itemIndex => { }
    }
}
