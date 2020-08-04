// loader for the schema composer internal diagram format
// TODO add enumerations + Refactor loaders to use controller
function loadDiagram() {
    var file = document.getElementById("FileInput").files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = JSON.parse(reader.result);
        schemaVersion = data["version"];
        schemaGeneration = data["schemaGeneration"];
        var dataProperties = data["axioms"]["dataProperties"];
        var objectProperties = data["axioms"]["objectProperties"];
        var inheritance = data["axioms"]["inheritance"];
        var enums = data["axioms"]["enums"];
        if (data["axioms"]["annotations"])
            schemaDefinedAnnotations = data["axioms"]["annotations"];
        // load classes
        for (var x = 0; x < data["axioms"]["classes"].length; x++) {
            var className = data["axioms"]["classes"][x];
            if (addClassInternal(className)) {
                addClassToCanvas(className, [], className);
                setActiveCanvasObject(className);
                var pos = data["positions"][className];
                // data properties
                var releventDataProperties = dataProperties.filter(e => e['domain'] == canvas.getActiveObject().id);
                for (var y = 0; y < releventDataProperties.length; y++) {
                    addAttributeInternal(className, releventDataProperties[y]["range"], releventDataProperties[y]["property"], releventDataProperties[y]["minCardinality"], releventDataProperties[y]["maxCardinality"]);
                    addAttributeToCanvas(releventDataProperties[y]["property"] + " : " + releventDataProperties[y]["range"] + " [" + releventDataProperties[y]["minCardinality"] + ".." + releventDataProperties[y]["maxCardinality"] + "]");
                }
                var obj = canvas.getActiveObject();
                obj.left = pos["left"];
                obj.top = pos["top"];
                obj.setCoords();
            }
        }
        // process associations and inheritance
        for (x = 0; x < objectProperties.length; x++) {
            var prop = objectProperties[x];
            setActiveCanvasObject(prop["domain"]);
            document.getElementById("ClassRelationRange").value = prop["range"];
            document.getElementById("ClassRelation").value = prop["property"];
            document.getElementById("ClassRelationMin").value = prop["minCardinality"];
            document.getElementById("ClassRelationMax").value = prop["maxCardinality"];
            addAssociation();
        }
        for (x = 0; x < inheritance.length; x++) {
            var inherit = inheritance[x];
            setActiveCanvasObject(inherit["subClass"]);
            document.getElementById("SuperClass").value = inherit["superClass"];
            addInheritance();
        }
        // process enums
        for (var key in enums) {
            var enumeration = enums[key];
            addEnumToCanvas(key, [], key);
            setActiveCanvasObject(key);
            for (var index in enumeration) {
                addAttributeToCanvas(enumeration[index]);
            }
            schemaDefinedEnums[key] = enumeration;
            var pos = data["positions"][key];
            var obj = canvas.getActiveObject();
            obj.left = pos["left"];
            obj.top = pos["top"];
            obj.setCoords();
        }
        canvas.renderAll();
    }
    reader.readAsText(file);
}

function openFilePicker() {
    document.getElementById("FileInput").click();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("FileInput").onchange = function(e) { loadDiagram() };
});