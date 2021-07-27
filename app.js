var XLSX = require('xlsx');
var workbook = XLSX.readFile('file.xlsx');
var sheet_name_list = workbook.SheetNames;
var json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

var listaData = Array();
var material_ingresos = Array();
var copia_material_ingresos = Array();
var salidas = Array();
var sobrantes = Array();
var sin_salidas = Array();
var out = Array();

// usar material_id para iterar una sola vez
for (const row in json) {
    let item = json[row];
    if (!listaData.includes(item.material_id)) {

        // dos caminos envolzar o tratar en primera aparicion
        if (typeof item.material_ingreso_id !== "undefined") {
            material_ingresos.push({
                id: item.material_ingreso_id,
                cantidad: item.entrada_cantidad,
                material_id: item.material_id
            });
        }
        if (typeof item.salida_id !== "undefined") {
            salidas.push({
                id: item.salida_id,
                cantidad: item.salida_cantidad,
                material_id: item.material_id
            });
        }
    }
}

// vamos a ir quitandole cantidad a los ingresos realizamos una copia para la comprobacion
// cuando tengas que ejecutar en una sola vez lo mejor sera hacerlo en dos foreach

var iterador = 0;
copia_material_ingresos = material_ingresos;

for(let i = 0; i < material_ingresos.length; i++) {
    let materialIngreso = material_ingresos[i];
    let has_salida = false;

    // salida por cada ingreso
    do {
        
        let salida = salidas[iterador];
        while (salida.material_id == materialIngreso.material_id) {

            var saque = salida.cantidad;

            if (salida.cantidad > materialIngreso.cantidad) {
                saque = materialIngreso.cantidad;
                salida.cantidad = salida.cantidad - materialIngreso.cantidad;
                materialIngreso.cantidad = 0;
            }

            out.push({
                salida: salida.id,
                material_ingreso: materialIngreso.id,
                cantidad: saque,
            });
            has_salida = true;

            materialIngreso.cantidad = materialIngreso.cantidad - salida.cantidad;

            if (materialIngreso.cantidad == 0) {
                i++;
                materialIngreso = material_ingresos[i];
            }

            if (materialIngreso.cantidad < 0) {
                saque = -(materialIngreso.cantidad);

                i++;
                materialIngreso = material_ingresos[i];
                materialIngreso.cantidad = materialIngreso.cantidad - saque;

                out.push({
                    salida: salida.id,
                    material_ingreso: materialIngreso.id,
                    cantidad: saque,
                });
            }

            iterador++;
            salida = salidas[iterador];
        }

        if (!has_salida) {
            has_salida = true;
        }

        //#region for(let j = iterador; j < salidas.length;) {
            /*
            let salida = salidas[j];
            let has_salida = false;

            if (salida.material_id == materialIngreso.material_id) {
                out.push({
                    salida: salida.id,
                    material_ingreso: materialIngreso.id,
                    cantidad: salida.cantidad,
                });

                if (salida.cantidad > materialIngreso.cantidad) {
                    salida.cantidad = salida.cantidad - materialIngreso.cantidad;
                    materialIngreso.cantidad = 0;
                    i++;
                    materialIngreso = material_ingresos[i];
                }
                
                has_salida = true;
                materialIngreso.cantidad = materialIngreso.cantidad - salida.cantidad;
                iterador++;
            }
        }*/
        //#endregion
    } while (!has_salida);

    // Parte de comprobacion
    exportarExcel(out)
}


function exportarExcel(data) {
    var ws = XLSX.utils.json_to_sheet(data);

    /* Create a new empty workbook, then add the worksheet */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");

    /* Generate xlsx files */
    XLSX.writeFile(wb, "sheetjs.xlsx");
}