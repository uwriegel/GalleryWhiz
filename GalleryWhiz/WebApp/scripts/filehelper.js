/**
 * Funktionssammlung für die Darstellung von Item-Properties
 */
var FileHelper = (function getFileHelper() {
    /**
     * Aus einem Dateinamen nur den Namesteil ohne Endung ermitteln
     * @param name
     */
    function getNameOnly(name) {
        var pos = name.lastIndexOf('.');
        if (pos == -1)
            return name;
        return name.substring(0, pos);
    }
    /**
     * Aus einem Dateinamen nur Die Endung ohne Namen ermitteln
     * @param name
     */
    function getExtension(name) {
        var pos = name.lastIndexOf('.');
        if (pos == -1)
            return "";
        return name.substring(pos);
    }
    /**
     * Kombinieren von Pfaden
     * @param path1
     * @param path2
     */
    function pathCombine(path1, path2) {
        if (path1.charAt(path1.length - 1) == '\\')
            return path1 + path2;
        return path1 + '\\' + path2;
    }
    function getNameFromPath(path) {
        var pos = path.lastIndexOf('\\');
        return path.substring(pos + 1);
    }
    function splitDirectory(directory) {
        var pos = directory.lastIndexOf('\\');
        var name;
        var path;
        if (pos != -1) {
            name = directory.substring(pos + 1);
            path = directory.substring(0, pos);
        }
        else {
            name = directory;
        }
        return {
            name: name,
            path: path
        };
    }
    function formatFileSize(fileSize) {
        var strNumber = `${fileSize}`;
        var thSep = '.';
        if (strNumber.length > 3) {
            var begriff = strNumber;
            strNumber = "";
            for (var j = 3; j < begriff.length; j += 3) {
                var extract = begriff.slice(begriff.length - j, begriff.length - j + 3);
                strNumber = thSep + extract + strNumber;
            }
            var strfirst = begriff.substr(0, (begriff.length % 3 == 0) ? 3 : (begriff.length % 3));
            strNumber = strfirst + strNumber;
        }
        return strNumber;
    }
    function formatDate(dateString) {
        var date = new Date(dateString);
        return dateFormat.format(date) + " " + timeFormat.format(date);
    }
    function compareVersion(versionLeft, versionRight) {
        if (!versionLeft)
            return -1;
        else if (!versionRight)
            return 1;
        else {
            var leftParts = versionLeft.split('.');
            var rightParts = versionRight.split('.');
            if (leftParts[0] != rightParts[0])
                return leftParts[0] - rightParts[0];
            else if (leftParts[1] != rightParts[1])
                return leftParts[1] - rightParts[1];
            else if (leftParts[2] != rightParts[2])
                return leftParts[2] - rightParts[2];
            else if (leftParts[3] != rightParts[3])
                return leftParts[3] - rightParts[3];
        }
    }
    var dateFormat = Intl.DateTimeFormat("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    var timeFormat = Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });
    return {
        getNameOnly: getNameOnly,
        getExtension: getExtension,
        pathCombine: pathCombine,
        getNameFromPath: getNameFromPath,
        formatFileSize: formatFileSize,
        formatDate: formatDate,
        compareVersion: compareVersion
    };
})();
