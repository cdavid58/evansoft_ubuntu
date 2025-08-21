
$(document).ready(function() {

	_document = "shopping"
	
	invoice.details = []
	_date = new Date().toISOString().split('T')[0]
	invoice.date_registration = _date
	invoice.supplier_id = supplier_id
	invoice.type_document = type_document
	invoice.employee_id = employee_id
	invoice.branch_id = branch_id
	invoice.total = 0
	invoice.payment_form = {
        payment_form_id: 1,
        payment_method_id: 10,
        payment_due_date: _date,
        duration_measure: 0
    }
    invoice.status = "Paid"
    invoice.anulled = false
    invoice.notes = false
    invoice.credit_note_applied = false

	$("#fecha").val(_date)

	$("#fecha").change(function(){
		invoice.date_registration = $("#fecha").val()
	})

	$("#paymentmethod").change(function(){
	    let payment_form_id = 1;
	    let payment_method = parseInt($("#paymentmethod").val()); // Convertimos a número

	    if (![10, 47, 49].includes(payment_method)) {
	        payment_form_id = 2;
	    }

	    invoice.payment_form = {
	        payment_form_id: payment_form_id, // Ahora refleja el valor correcto
	        payment_method_id: payment_method,
	        payment_due_date: $("#fecha").val(),
	        duration_measure: 0
	    };
	});


	$(document).on("keydown", function(event) {
	    if (event.altKey && event.key.toLowerCase() === "c") {
	        event.preventDefault();

	        let clientSelect = $("#clientSelect");

	        if (clientSelect.length > 0) {
	            clientSelect.prop("disabled", false).show();
	            if (clientSelect.hasClass("select2-hidden-accessible")) {
	                clientSelect.select2("open");
	            }
	            else if (clientSelect.next(".chosen-container").length > 0) {
	                clientSelect.trigger("chosen:open");
	            }
	            else if (clientSelect.parent().hasClass("bootstrap-select")) {
	                clientSelect.selectpicker("toggle");
	            }
	            else {
	                clientSelect[0].size = 5;
	                setTimeout(() => {
	                    clientSelect[0].size = 1;
	                }, 3000);
	                clientSelect.focus().trigger("mousedown").trigger("mouseup").trigger("click");
	            }
	        } else {
	            console.warn("El elemento #clientSelect no se encuentra en el DOM.");
	        }
	    }
	    if (event.altKey && event.key.toLowerCase() === "p") {
	        event.preventDefault();
	        Open_List_Product()
	    }
	    if (event.key === "F10") {
	    	Save_Shopping()
	    }
	    if (event.altKey && event.key.toLowerCase() === "g") {
	    	Save_Account()
	    }
	    if (event.altKey && event.key.toLowerCase() === "n") {
	    	localStorage.removeItem(_document)
			location.reload(true)
	    }
	});

	let data_invoice = localStorage.getItem(_document);
	if (data_invoice) {
		values = JSON.parse(data_invoice)
		$(".number_shopping").val(values.number)
	    invoice.details = values['details'];
	    let list_product_invoice = invoice.details;
	    for (let i = 0; i < list_product_invoice.length; i++) {
	        let product_only = list_product_invoice[i];
	        $(".cost").val(product_only['cost'])
	        $(".ico").val(product_only['ipo'])
	        $(".discount").val(product_only['discount'])
	        $(".price1").val(product_only['price1'])
	        $(".price2").val(product_only['price2'])
	        $(".price3").val(product_only['price3'])
	        $(".price4").val(product_only['price4'])
	        $(".price5").val(product_only['price5'])
	        $(".price6").val(product_only['price6'])
	        AddProduct(product_only, true);
	    }
	}

	$(".note").keyup(function(){
		message = $(this).val()
		invoice.note = message
		localStorage.setItem(_document, JSON.stringify(invoice))
	})

    $('#supplierSelect').select2({
        placeholder: 'Buscar proveedor...',
        allowClear: true,
        minimumInputLength: 2,
        ajax: {	
            url: url_supplier,
            dataType: 'json',
            type: "POST",
            headers: { "X-CSRFToken": getCookie("csrftoken")},
            delay: 250,
            contentType: "application/json",
            data: function(params) {
                return JSON.stringify({ q: params.term })
            },
            processResults: function(data) {
            	console.log(data)
			    if (Array.isArray(data)) {
			        return {
			            results: data.map(function(client) {
			            	invoice.supplier_id = client.id
			                return { id: client.id, text: client.name };
			            })
			        };
			    } else if (data.customer && Array.isArray(data.customer)) {
			        return {
			            results: data.customer.map(function(client) {
			            	invoice.supplier_id = client.id
			                return { id: client.id, text: client.name };
			            })
			        };
			    } else {
			        console.error("Error: La respuesta no es un array válido", data);
			        return { results: [] };
			    }
			},
            cache: true
        }
    });



	$('#productSelect').change(function() {
	    product_id = $(this).val();
	    console.log(product_id,'ID de productos temporales')
	    console.log(list_product_tmp,'Listado de productos temporales')
	    let product = list_product_tmp.find(product => product.id == product_id);
	    if (product) {
	        list_product_invoice.push(product);

	        $(".cost").val(product['cost'])
	        $(".ico").val(product['ico'])
	        $(".discount").val(product['discount'])
	        $(".price1").val(product['price_1'])
	        $(".price2").val(product['price_2'])
	        $(".price3").val(product['price_3'])
	        $(".price4").val(product['price_4'])
	        $(".price5").val(product['price_5'])
	        $(".price6").val(product['price_6'])
	        
	        $(".cost").prop("disabled", false);
	        $(".discount").prop("disabled", false);
	        $(".quantity").prop("disabled", false);
	        $(".ico").prop("disabled", false);
	        $(".price1").prop("disabled", false);
	        $(".price2").prop("disabled", false);
	        $(".price3").prop("disabled", false);
	        $(".price4").prop("disabled", false);
	        $(".price5").prop("disabled", false);
	        $(".price6").prop("disabled", false);
	        setTimeout(() => {
	            $(".quantity").focus();
	        }, 100); // Retraso de 100ms para asegurar que el DOM está actualizado
	    } else {
	        console.error("Producto no encontrado en list_product_tmp");
	    }
	});

	$(".add_product").click(function(event){
		let product = list_product_tmp.find(product => product.id == product_id);
		quantity_product = parseInt($(".quantity").val())
		AddProduct(product, false)
	})

	$(".quantity").keyup(function(event){
		if(event.key.toLowerCase() === "enter"){
			let product = list_product_tmp.find(product => product.id == product_id);
			quantity_product = parseInt($(".quantity").val())
			AddProduct(product, false)
		}
	})

	function codigoExiste(codigo) {
	    let existe = false;		    
	    $(".row_invoice tr").each(function() {
	        let codigoExistente = $(this).find("th:first").text().trim();
	        if (codigoExistente === codigo) {
	            existe = true;
	            return false;
	        }
	    });
	    return existe;
	}

	function formatNumber(num) {
        return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function Calculate_Total_Invoice() {
	    var subtotal = 0;
	    var totalTax = 0;
	    var totalICO = 0;
	    var totalDiscount = 0;
	    var totalInvoice = 0;
	    $(".row_invoice tr").each(function() {
	        var base = parseFloat($(this).find("th:eq(3)").text().replace(/\./g, "").replace(",", ".")) || 0;
	        var quantity = parseInt($(this).find("th:eq(2)").text()) || 0;
	        var valtax = parseFloat($(this).find("th:eq(4)").text().replace(/\./g, "").replace(",", ".")) || 0;
	        var ico = parseFloat($(this).find("th:eq(5)").text().replace(/\./g, "").replace(",", ".")) || 0;
	        var discount = parseFloat($(this).find("th:eq(6)").text().replace(/\./g, "").replace(",", ".")) || 0;
	        var subtotal_row = parseFloat($(this).find("th:eq(7)").text().replace(/\./g, "").replace(",", ".")) || 0;
	        var neto = parseFloat($(this).find("th:eq(8)").text().replace(/\./g, "").replace(",", ".")) || 0;
	        subtotal += subtotal_row;
	        totalTax += valtax * quantity;
	        totalICO += ico * quantity;
	        totalDiscount += discount * quantity;
	        totalInvoice += Math.round(subtotal + totalTax + totalICO)
	    });

	    $(".row_totales tr:eq(0) th:eq(1)").text(formatNumber(subtotal));
	    $(".row_totales tr:eq(1) th:eq(1)").text(formatNumber(totalTax));
	    $(".row_totales tr:eq(2) th:eq(1)").text(formatNumber(totalICO));
	    $(".row_totales tr:eq(3) th:eq(1)").text(formatNumber(totalDiscount));
	    $(".row_totales tr:eq(4) th:eq(1)").text(formatNumber(totalInvoice));
	    $(".total_invoice").val(formatNumber(totalInvoice))
	    invoice.total += totalInvoice
	    Clear_Tmp()
	    Open_List_Product()

	}

	function AddProduct(product, save) {
		console.log(product,'Product Agregado')
	    var total = (parseFloat($(".cost").val()) * ( 1 + (product['tax'] / 100))) + parseFloat($(".ico").val());
	    var total_save = total
	    var ico = parseFloat($(".ico").val())
	    var quantity = (save) ? product['quantity'] : parseInt($(".quantity").val());
	    total -= ico

	    var tax = 1 + (product['tax'] / 100)
	    var base = total / tax
	    var tax_value = total - base
	    var discount = base * (parseFloat($(".discount").val()) / 100)
	    base -= discount
	    total = base * tax
	    tax_value = total - base
	    total = (base + tax_value + ico) * quantity
	    var subtotal_row = base * quantity;
	    var neto = total

	    var productRow = $(".row_invoice tr").filter(function() {
	        return $(this).find("th:first").text() === product['code'];
	    });

	    if (productRow.length > 0) {
	        var currentQuantity = parseInt(productRow.find("th:eq(2)").text());
	        var newQuantity = currentQuantity + quantity;
	        var newSubtotal = base * newQuantity;
	        var newNeto = total * newQuantity;

	        productRow.find("th:eq(2)").text(newQuantity); // Actualiza cantidad
	        productRow.find("th:eq(3)").text(formatNumber(base)); // Costo
	        productRow.find("th:eq(4)").text(formatNumber(tax_value)); // IVA
	        productRow.find("th:eq(5)").text(formatNumber(ico)); // ICO
	        productRow.find("th:eq(6)").text(formatNumber(discount)); // Dcto
	        productRow.find("th:eq(7)").text(formatNumber(newSubtotal)); // SubTotal
	        productRow.find("th:eq(8)").text(formatNumber(newNeto)); // Neto

	        let rows_details = invoice.details.find(product => product.id == product_id)
	        rows_details.quantity = newQuantity
	    } else {
	        $(".row_invoice").prepend(`
	            <tr>
	                <th style="width: 5%;">${product['code']}</th>
	                <th style="width: 20%;">${product['name']}</th>
	                <th style="width: 7%; text-align: right;">${quantity}</th>
	                <th style="width: 7%; text-align: right;">${formatNumber(base)}</th>
	                <th style="width: 7%; text-align: right;">${formatNumber(tax_value)}</th>
	                <th style="width: 7%; text-align: right;">${formatNumber(ico)}</th>
	                <th style="width: 7%; text-align: right;">${formatNumber(discount)}</th>
	                <th style="width: 10%; text-align: right;">${formatNumber(subtotal_row)}</th>
	                <th style="width: 10%; text-align: right;">${formatNumber(neto)}</th>
	                <th style="width: 10%; text-align: right;"><button class="btn btn-primary" onclick="verDetalle(this)">Detalles</button></th>
	            </tr>
	        `);
	        if(!save){
		        invoice.details.push(
			    	{
			    		"id":product_id,
			            "code": product['code'],
			            "name": product['name'],
			            "quantity": quantity,
			            "cost": $(".cost").val(),
			            "price": $(".cost").val(),
			            "price1": $(".price1").val(),
			            "price2": $(".price2").val(),
			            "price3": $(".price3").val(),
			            "price4": $(".price4").val(),
			            "price5": $(".price5").val(),
			            "price6": $(".price6").val(),
			            "tax": product['tax'],
			            "discount": $(".discount").val(),
			            "ultra_processed": type_price,
			            "ipo": $(".ico").val()
			        }
			    )
		    }
	    }
	    localStorage.setItem(_document, JSON.stringify(invoice))
	    Calculate_Total_Invoice()
	}


	$(".number_shopping").keyup(function(){
		invoice.number = $(".number_shopping").val()
	})

	function Save_Shopping(){
		let list_branch = $("#branchSelect").val()
		console.log(list_branch)
		if (!list_branch?.length) {
			Notification("warning", "ALERTA!!!", "No se seleccionaron sucursales.", "OK")
			return;
		}
		if(!$(".number_shopping").val()){
			$(".number_shopping").focus()
			Notification("warning", "ALERTA!!!", "Debe colocar el numero de factura.", "OK")
			return;
		}
		if (navigator.onLine) {
			list_branch.forEach(branchId => {
				let invoice_copy = { ...invoice }
				invoice_copy['branch_id'] = branchId;
				$.ajax({
					url: save_shopping,
					type: "POST",
					headers: { "X-CSRFToken": getCookie("csrftoken")},
					data: JSON.stringify(invoice_copy),
					success: function(e){
						console.log(e)
						if(e.data && e.result){
							if(e.data.result)
							{
								Notification("success", "Registro exitoso.", e.data.message, "OK")
								localStorage.removeItem(_document)
								location.reload(true)
								Clear_Tmp()
								// 	let screenWidth = window.screen.width;
				                //     let screenHeight = window.screen.height;
				                //     let windowWidth = 800;
				                //     let windowHeight = 600;
				                //     let leftPosition = (screenWidth - windowWidth) / 2;
				                //     let topPosition = (screenHeight - windowHeight) / 2;
				                //     let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${windowWidth},height=${windowHeight},left=${leftPosition},top=${topPosition}`;
				                //     let printWindow = window.open(print_invoice + invoice.number, "invoice", params);
				                //     if (printWindow) {
				                //         printWindow.onload = function() {
				                //             printWindow.document.body.style.zoom = "100%";
				                //             printWindow.print();
				                //             printWindow.onafterprint = function () {
				                //                 printWindow.close();
				                //             };
				                //         };
				                //     }
							}
							else{
								console.log(e.data.message)
								Notification("error", "Oopss.. Algo salió mal.", e.data.message, "OK")
							}
							
						}
						else{
							console.log("ERROR")
						}
					}
				})
			})
		}
	}

	function Save_Account(){
	    guardarFacturaLocal(invoice);
	}

	function verDetalles(detalles) {
        let tablaDetalles = $("#tablaDetalles");
        tablaDetalles.empty();

        if (!detalles || detalles.length === 0) {
            tablaDetalles.append(`<tr><td colspan="6" class="text-center">No hay detalles para esta factura.</td></tr>`);
            return;
        }

        detalles.forEach(item => {
            let fila = `
                <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity}</td>
                    <td>${item.tax}</td>
                    <td>${item.discount}</td>
                </tr>`;
            tablaDetalles.append(fila);
        });
    }

    $(document).on('click','.details_invoice',function(){
    	verDetalles()
    })

    $(".reader_invoice").click(function(){
    	console.log(invoice)
    	let list_branch = $("#branchSelect").val()
    	list_branch.forEach(branchId => {
    		let productData = {branch_id: branchId };
    	})
    })
    

	function Open_List_Product(){
		let productSelect = $("#productSelect");
        if (productSelect.length > 0) {
            productSelect.prop("disabled", false).show();
            if (productSelect.hasClass("select2-hidden-accessible")) {
                productSelect.select2("open");
            }
            else if (productSelect.next(".chosen-container").length > 0) {
                productSelect.trigger("chosen:open");
            }
            else if (productSelect.parent().hasClass("bootstrap-select")) {
                productSelect.selectpicker("toggle");
            }
            else {
                productSelect[0].size = 5;
                setTimeout(() => {
                    productSelect[0].size = 1;
                }, 3000);
                productSelect.focus().trigger("mousedown").trigger("mouseup").trigger("click");
            }
        } else {
            console.warn("El elemento #productSelect no se encuentra en el DOM.");
        }
	}

	// Open_List_Product()

	function Clear_Tmp(){
		$(".price1").val(0)
		$(".price2").val(0)
		$(".price3").val(0)
		$(".price4").val(0)
		$(".price5").val(0)
		$(".price6").val(0)
		$(".ico").val(0)
		$(".discount").val(0)
		$(".cost").val(0)
		$("#productSelect").val(null).trigger("change");
		$(".quantity").val('')
        
        $(".cost").prop("disabled", true);
        $(".discount").prop("disabled", true);
        $(".quantity").prop("disabled", true);
        $(".ico").prop("disabled", true);
        $(".price1").prop("disabled", true);
        $(".price2").prop("disabled", true);
        $(".price3").prop("disabled", true);
        $(".price4").prop("disabled", true);
        $(".price5").prop("disabled", true);
        $(".price6").prop("disabled", true);
		
	}

	

});

// Función para mostrar los detalles del producto en el modal
function verDetalle(btn) {
  let row = $(btn).closest('tr'); // Encuentra la fila más cercana
  let index = row.index(); // Obtiene el índice de la fila dentro de la tabla normal

  // Cargar datos en el modal
  $('#rowIndex').val(index);
  $('#modalProducto').val(row.find("th:eq(0)").text()); // Código
  $('#modalCantidad').val(row.find("th:eq(2)").text()); // Cantidad
  $('#modalCosto').val(row.find("th:eq(3)").text()); // Costo
  $('#modalPrecio1').val(row.find("th:eq(4)").text()); // IVA
  $('#modalPUC').val(row.find("th:eq(5)").text()); // PUC

  // Cargar precios desde los campos de entrada
  $('#modalPrecio2').val($(".price2").val());
  $('#modalPrecio3').val($(".price3").val());
  $('#modalPrecio4').val($(".price4").val());
  $('#modalPrecio5').val($(".price5").val());
  $('#modalPrecio6').val($(".price6").val());

  // Valores fijos
  $('#modalConsumo').val(8);
  $('#modalDescuento').val(5);

  // Mostrar modal
  $('#modalDetalle').show();
}

// Función para guardar los cambios realizados en el modal
function guardarCambios() {
  let index = $('#rowIndex').val();
  let producto = $('#modalProducto').val();
  let cantidad = parseFloat($('#modalCantidad').val());
  let costo = parseFloat($('#modalCosto').val());
  let precio1 = parseFloat($('#modalPrecio1').val());
  let precio2 = parseFloat($('#modalPrecio2').val());
  let precio3 = parseFloat($('#modalPrecio3').val());
  let precio4 = parseFloat($('#modalPrecio4').val());
  let precio5 = parseFloat($('#modalPrecio5').val());
  let precio6 = parseFloat($('#modalPrecio6').val());
  let consumo = parseFloat($('#modalConsumo').val());
  let descuento = parseFloat($('#modalDescuento').val());
  let puc = $('#modalPUC').val();

  // Cálculos
  let subtotal = cantidad * costo;
  let valorDescuento = subtotal * (descuento / 100);
  let subtotalConDescuento = subtotal - valorDescuento;
  let valorConsumo = subtotalConDescuento * (consumo / 100);
  let total = subtotalConDescuento + valorConsumo;

  // Actualizar la tabla con los valores nuevos
  let row = $(".row_invoice tr").eq(index);
  row.find("th:eq(0)").text(producto);
  row.find("th:eq(2)").text(cantidad);
  row.find("th:eq(3)").text(costo.toFixed(2));
  row.find("th:eq(4)").text(precio1.toFixed(2));
  row.find("th:eq(5)").text(puc);
  row.find("th:eq(7)").text(total.toFixed(2));
  cerrarModal();
  recalcularGranTotal();
}

// Función para cerrar el modal
function cerrarModal() {
  $('#modalDetalle').hide();
}

// Función para recalcular el total de la factura
function recalcularGranTotal() {
  let total = 0;
  $(".row_invoice tr").each(function() {
    let valor = parseFloat($(this).find("th:eq(7)").text()) || 0; // Subtotal
    total += valor;
  });

  $('#granTotal').text(total.toFixed(2));
}

// Función para eliminar un producto de la factura
function eliminarProducto(btn) {
  $(btn).closest('tr').remove();
  recalcularGranTotal();
}

// Función para agregar un nuevo producto a la factura
function agregarProducto() {
  let nuevaFila = `
    <tr>
      <th style="width: 5%;">Nuevo Producto</th>
      <th style="width: 20%;">Descripción</th>
      <th style="width: 7%; text-align: right;">1</th>
      <th style="width: 7%; text-align: right;">0.00</th>
      <th style="width: 7%; text-align: right;">0.00</th>
      <th style="width: 7%; text-align: right;">613505</th>
      <th style="width: 10%; text-align: right;">
        <button class="btn btn-primary" onclick="verDetalle(this)">Ver Detalle</button>
        <button class="btn btn-danger" onclick="eliminarProducto(this)">Eliminar</button>
      </th>
    </tr>
  `;

  $(".row_invoice").prepend(nuevaFila);
  recalcularGranTotal();
}
