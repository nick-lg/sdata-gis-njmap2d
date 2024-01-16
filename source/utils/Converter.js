const convertGeoJSON = function (geometry) {
    let strip;
    const type = geometry.type;
    let result = type;

    if (type == "Point") {
        result += `(${geometry.coordinates[0]} ${geometry.coordinates[1]})`;
    }
    else if (type == "LineString") {
        result += "(";
        geometry.coordinates.forEach(element => {
            result += `${element[0]} ${element[1]},`
        });
        result = result.slice(0, result.length - 1);
        result += ")";
    }
    else if (type == "Polygon") {
        strip = geometry.coordinates[0][0].length - 1;
        result += "(";
        for (let i = 0; i < geometry.coordinates.length; i++) {
            result += "(";
            for (let j = 0; j < geometry.coordinates[i].length; j++) {
                for (let k = 0; k < geometry.coordinates[i][j].length; k++) {
                    result += `${geometry.coordinates[i][j][k]}${k < strip ? " " : (j < geometry.coordinates[i].length - 1 ? "," : "")}`;
                }
            }
            result += `${i < geometry.coordinates.length - 1 ? ")," : ")"}`
        }
        result += ")";
    }
    else if (type == "MultiPolygon") {
        strip = geometry.coordinates[0][0][0].length - 1;
        result += "(";
        for (let i = 0; i < geometry.coordinates.length; i++) {
            result += "(("
            for (let j = 0; j < geometry.coordinates[i].length; j++) {
                for (let k = 0; k < geometry.coordinates[i][j].length; k++) {
                    for (let q = 0; q < geometry.coordinates[i][j][k].length; q++) {
                        result += `${geometry.coordinates[i][j][k][q]}${q < strip ? " " : (k < geometry.coordinates[i][j].length - 1 ? "," : "")}`;
                    }
                }
            }
            result += `${i < geometry.coordinates.length - 1 ? "))," : "))"}`
        }
        result += ")";
    }
    else
        throw new Error(`unsupported type:${type}`)

    return result;
}
export { convertGeoJSON }