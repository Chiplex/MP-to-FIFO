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
var penultimoPush = Object();
var ultimoPush = Object();
var falta_s = 0;
var pide_s = 0;
var sale_s = Infinity;

var entra_i = 0;
var queda_i = 0;
var tiene_i = 0;

copia_material_ingresos = material_ingresos;

for(let i = 0; i < material_ingresos.length; i++) {
    let materialIngreso = material_ingresos[i];
    let has_salida = false;

    // salida por cada ingreso
    do {
        let salida = salidas[iterador];
        while (salida.material_id == materialIngreso.material_id) {
            has_salida = true;

            if (materialIngreso.material_id == "023179cef9814fe88e8f7c0ec8ee4a32") {
                debugger;
            }

            pide_s = salida.cantidad;
            if (sale_s >= pide_s) {
                sale_s = salida.cantidad;
            }
            
            entra_i = materialIngreso.cantidad;
            tiene_i = materialIngreso.cantidad;
            
            var saque = sale_s;
            if (sale_s > entra_i) {
                var saque = entra_i;
            }

            encolar({
                salida: salida.id,
                material_ingreso: materialIngreso.id,
                cantidad: saque,
            })

            queda_i = entra_i - saque;
            if (queda_i == 0) {
                i++;
                materialIngreso = material_ingresos[i];
            }
            else{
                materialIngreso.cantidad = queda_i;
            }

            falta_s = sale_s - saque;
            if (falta_s == 0) {
                iterador++;
                salida = salidas[iterador];
                sale_s = salida.cantidad;
            }
            else{
                sale_s = falta_s;
            }
        }

        if (!has_salida) {
            has_salida = true;
        }

        sale_s = Infinity;
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

function name(params) {
    
}

function encolar(entrada_salida) {
    out.push(entrada_salida);
    penultimoPush = out[out.length - 2];
    ultimoPush = out[out.length - 1];
}

function exportarExcel(data) {
    var ws = XLSX.utils.json_to_sheet(data);

    /* Create a new empty workbook, then add the worksheet */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");

    /* Generate xlsx files */
    XLSX.writeFile(wb, "sheetjs.xlsx");
}