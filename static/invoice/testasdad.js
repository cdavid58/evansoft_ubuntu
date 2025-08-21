
$(document).ready(function() {
	
	invoice.details = []
	let modal = true
	_date = new Date().toISOString().split('T')[0]
	invoice.date = _date
	invoice.customer_id = customer_id
	invoice.name_customer = "CONSUMIDOR FINAL"
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
    invoice.credit_note_applied = false
    $(".stock").val(0)

	$("#fecha").val(_date)

	function getDaysBetweenDates(fecha1, fecha2) {
	    const start = new Date(fecha1);
	    const end = new Date(fecha2);
	    const diff = end - start;
	    return Math.ceil(diff / (1000 * 60 * 60 * 24));
	}

	function updatePaymentForm() {
	    const value = parseInt($("#paymentmethod").val(), 10);
	    const fechaSeleccionada = $("#fecha").val();

	    if ([30, 45, 48].includes(value)) {
	        const dias = getDaysBetweenDates(_date, fechaSeleccionada);

	        if (dias <= 0) {
	            // alert("Cuando se refiere a crédito debe elegir una fecha superior a la actual");
	            return;
	        }

	        invoice.payment_form = {
	            payment_form_id: 2,
	            payment_method_id: value,
	            payment_due_date: fechaSeleccionada,
	            duration_measure: dias
	        };
	    } else {
	        invoice.payment_form = {
	            payment_form_id: 1,
	            payment_method_id: 10,
	            payment_due_date: _date,
	            duration_measure: 0
	        };

	        $("#fecha").val(_date);  // restaurar la fecha actual si no es crédito
	    }
	}

	// Disparar validación cuando cambia el método de pago o la fecha
	$("#paymentmethod").change(updatePaymentForm);
	$("#fecha").change(updatePaymentForm);


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
	    	Save_Invoice()
	    }
	    if (event.altKey && event.key.toLowerCase() === "g") {
	    	Save_Account()
	    }
	    if (event.altKey && event.key.toLowerCase() === "n") {
	    	localStorage.removeItem('invoice')
			location.reload(true)
	    }
	    if (event.altKey && event.key.toLowerCase() === "v") {
	    	$(".reader_invoice").click() //PERMITE RECUPERAR FACTURAS GUARDADAS
	    }

	    if (event.ctrlKey && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
	        event.preventDefault(); // Evita el scroll de la página
	        const select = $("#paymentmethod")[0];
	        let index = select.selectedIndex;

	        if (event.key === "ArrowDown" && index < select.options.length - 1) {
	            select.selectedIndex = index + 1;
	        } else if (event.key === "ArrowUp" && index > 0) {
	            select.selectedIndex = index - 1;
	        }

	        // Disparar evento change manualmente
	        $(select).trigger("change");
	    }

	    if (event.altKey && event.key.toLowerCase() === "t") {
	    	invoice.type_document = 99
	    	modal = false
	    	Save_Invoice()
	    }
	});

	let data_invoice = localStorage.getItem("invoice");
	if (data_invoice) {
		values = JSON.parse(data_invoice)
		let newOption = new Option(values.name_customer, values.customer_id, true, true);
		$('#clientSelect').append(newOption).trigger('change');
	    invoice.details = values['details'];
	    let list_product_invoice = invoice.details;
	    for (let i = 0; i < list_product_invoice.length; i++) {
	        let product_only = list_product_invoice[i];
	        AddProduct(product_only, true);
	    }
	}

	$(".note").keyup(function(){
		message = $(this).val()
		invoice.note = message
		localStorage.setItem("invoice", JSON.stringify(invoice))
	})
	
    $('#clientSelect').select2({
        placeholder: 'Buscar cliente...',
        allowClear: true,
        minimumInputLength: 2,
        ajax: {	
            url: url_customer,
            dataType: 'json',
            type: "POST",
            headers: { "X-CSRFToken": getCookie("csrftoken")},
            delay: 250,
            contentType: "application/json",
            data: function(params) {
                return JSON.stringify({ q: params.term })
            },
            processResults: function(data) {
			    if (Array.isArray(data)) {
			        return {
			            results: data.map(function(client) {
			            	invoice.customer_id = client.id
			            	invoice.name_customer = client.name
			            	localStorage.setItem("invoice", JSON.stringify(invoice))
			                return { id: client.id, text: client.name };
			            })
			        };
			    } else if (data.customer && Array.isArray(data.customer)) {
			        return {
			            results: data.customer.map(function(client) {
			            	invoice.customer_id = client.id
			            	invoice.name_customer = client.name
			            	localStorage.setItem("invoice", JSON.stringify(invoice))
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
	        $(".price1").val(product['price_1'])
	        $(".price2").val(product['price_2'])
	        $(".price3").val(product['price_3'])
	        $(".price4").val(product['price_4'])
	        $(".price5").val(product['price_5'])
	        $(".price6").val(product['price_6'])
	        setTimeout(() => {
	            $(".quantity").focus();
	        }, 100);
	    } else {
	        console.error("Producto no encontrado en list_product_tmp");
	    }
	});

	$(".quantity").keyup(function(event){
		if(event.key.toLowerCase() === "enter"){
			$(".type_price").focus()
		}
	})

	function Stock(product, type_price){
		var stock = null
		if(type_price == 1 || type_price == 4){
			stock = product['unit']
		}
		else if(type_price == 2 || type_price == 5){
			stock = product['display']
		}
		else if(type_price == 3 || type_price == 6){
			stock = product['bale']
		}
		return stock
	}

	function Query_Stock(product, type_price){
		var query_stock = null
		let stock_static= null

		if(type_price == 1 || type_price == 4){
			if(product['display'] > 0 ){
				query_stock = "Se recargo la Unidad"
				stock_static = product['unit_static']
			}
		}
		else if(type_price == 2 || type_price == 5){
			if(product['bale'] > 0 ){
				query_stock = "Se recargo la Unidad"
				stock_static = product['display']
			}
		}
		return [query_stock, stock_static]
	}

	let _type_price = 0
	let _quan = 0
	let _code = 0

	$(".type_price").keyup(function(event){
		type_price = $(this).val()
		_type_price = type_price
		let product = list_product_tmp.find(product => product.id == product_id);
		let stock = Stock(product, type_price)	
		$(".stock").val(stock)
		if(event.key === 'Enter'){
			quantity_product = parseInt($(".quantity").val())
			_quan = quantity_product
			_code = product['code']
			data_product = {
			    code: product['code'],
			    branch_id: branch_id,
			    employee_id: employee_id,
			    type_price: type_price,
			    quantity: quantity_product,
			}
			$.ajax({
				url:reserved,
				data: data_product,
				success: function(e){
					if(e.result){
						AddProduct(product, false)
						$(".stock").val(0)
					}
					else{
						console.log(e.message,'No hay')
						// Notification("error", "Oopss.. Algo salió mal.", e.message, "OK")
						if(type_price == 1 || type_price == 4){
							_type_price = 1
						}
						if(type_price == 2 || type_price == 5){
							_type_price = 2
						}
						if(type_price == 3 || type_price == 6){
							_type_price = 3
						}
						$.ajax({
							url: scan_inventory,
							type: "POST",
							headers: { "X-CSRFToken": getCookie("csrftoken")},
							data: {'code':product['code'], 'quantity':quantity_product,'type_unit':type_price},
							success: function(response){
								console.log(response)
								if(response.result){
									values = response.values
									for(i = 0; i < values.length; i++){
										$("#tableLoan").append(`
											<tr>
												<td>${values[i].branch}</td>
												<td>${values[i].quantity}</td>
												<td>
													<button class='btn btn-primary loan_button' id="${values[i].branch_id}">Prestar</button>
												</td>
											</tr>
										`)
									}
									$("#loan_products").modal('show')
								}
								else{
									Notification("error", "Oopss.. Algo salió mal.", "Lo sentimo pero no tiene más productos disponibles y tampoco tenemos donde pedir prestado", "OK")
								}
							}
						})
					}
				}
			})			
		}
		else{
			if (stock <= limited_inventory && $(".type_price").val() !== "") {
		        $(".stock").css({
		            "background-color": "red",
		            "color": "white"
		        });
		        if(stock <= 0){
		        	result = Query_Stock(product, type_price)
		        	$(".stock").val(result[1])
		        	// Swal.fire({
					//   position: "top-end",
					//   icon: "success",
					//   title: `${result[0]}`,
					//   showConfirmButton: false,
					//   timer: 1500
					// });
		        }
		        else{
		        	// Swal.fire({
					//   position: "top-end",
					//   icon: "success",
					//   title: `Quedan ${stock} ${(stock > 1) ? "cantidades": "cantidad"} de este producto!!!... `,
					//   showConfirmButton: false,
					//   timer: 1500
					// });
		        }
		    } else {
		        $(".stock").css({
		            "background-color": "",
		            "color": ""
		        });
		    }
		}
	})

	$(document).on('click','.loan_button',function(){
		let id = this.id
		console.log(id)
		data = {
		  receiving_branch: branch_id,
		  code: _code,
		  branch_that_lends: id,
		  type_unit: _type_price,
		  quantity: _quan
		}
		$.ajax({
			url: loan,
			type: "POST",
			headers: { "X-CSRFToken": getCookie("csrftoken")},
			data: data,
			success: function(response){
				console.log(response)
				console.log(type_price,'type_price')
				let _e = response
				if(_e.result){
					let _cant = _e.values.quantity_loaned
					$(".stock").val(_cant)
					let product = list_product_tmp.find(product => product.id == product_id);
					if(type_price == 1 || type_price == 4){
						product['unit'] = parseFloat(product['unit']) + _cant
					}
					if(type_price == 2 || type_price == 5){
						product['display'] = parseFloat(product['display']) + _cant
					}
					if(type_price == 3 || type_price == 6){
						product['bale'] = parseFloat(product['bale']) + _cant
					}
					console.log(product)

				}
				else{
					Notification("error", "Oopss.. Algo salió mal.", _e.message, "OK")
				}

			}
		})
		$("#loan_products").modal('hide')
		$(".type_price").focus()
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
	    invoice.total = totalInvoice
	    Clear_Tmp()
	    Open_List_Product()

	}

	function AddProduct(product, save) {
	    var total = (save) ? product['price'] : product['price_'+type_price];
	    var total_save = total
	    var ico = product['ico']
	    var quantity = (save) ? product['quantity'] : parseInt($(".quantity").val());
	    total -= ico

	    var tax = 1 + (product['tax'] / 100)
	    var base = total / tax
	    var tax_value = total - base
	    var discount = base * (product['discount'] / 100)
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
	            </tr>
	        `);
	        if(!save){
		        invoice.details.push(
			    	{
			    		"id":product_id,
			            "code": product['code'],
			            "name": product['name'],
			            "quantity": quantity,
			            "price": total_save,
			            "tax": product['tax'],
			            "discount": product['discount'],
			            "type_price": type_price,
			            "ico": product['ico']
			        }
			    )
		    }
	    }
	    console.log(invoice,'invoice')
	    localStorage.setItem("invoice", JSON.stringify(invoice))
	    Calculate_Total_Invoice()
	}

	function Save_Invoice(){
		number = invoice.number
		let type_document = invoice.type_document
		console.log(invoice)
		if (navigator.onLine) {
			$(".text_send_email").text('Espere mientras enviamos la factura a la DIAN.');
			var modalLoader = new bootstrap.Modal(document.getElementById('loader1'), {
			  keyboard: false,
			  backdrop: 'static'
			});
			if(modal){
				modalLoader.show();
			}
			$.ajax({
				url: send_dian,
				type: "POST",
				headers: { "X-CSRFToken": getCookie("csrftoken")},
				data: JSON.stringify(invoice),
				success: function(response){
					console.log(response)
					if(modal){
						modalLoader.hide()
					}
					if(response.data && response.result){
						console.log(response)
						if(response.data.result)
						{
							number = response.data.number
							console.log('NUMBER ',number)
							let screenWidth = window.screen.width;
		                    let screenHeight = window.screen.height;
		                    let windowWidth = 800;
		                    let windowHeight = 600;
		                    let leftPosition = (screenWidth - windowWidth) / 2;
		                    let topPosition = (screenHeight - windowHeight) / 2;
		                    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${windowWidth},height=${windowHeight},left=${leftPosition},top=${topPosition}`;
		                    let printWindow = window.open(print_invoice + number + '/' + type_document, "invoice", params);
		                    if (printWindow) {
							    printWindow.onload = function() {
							        printWindow.document.body.style.zoom = "100%";
							        printWindow.print();

							        printWindow.onafterprint = function() {
							            printWindow.close();
							        };
							    };
							    let checkClose = setInterval(function() {
							        if (printWindow.closed) {
							            clearInterval(checkClose);
							            console.log("La ventana de impresión se ha cerrado");
							            localStorage.removeItem('invoice')
										location.reload(true)
							        }
							    }, 500);
							}
							$.ajax({
								url: return_product,
								success: function(response){
									console.log(response)
								}
							})
						}
						else{
							console.log(response.data.message)
							Swal.fire({
						      icon: 'error',
						      title: "Oopss.. Algo salió mal.",
						      text: response.data.message,
						      confirmButtonText: 'OK',
						      confirmButtonColor: '#3085d6'
						    }).then((result) => {
						      if (result.isConfirmed) {
						        location.reload(true)
						      }
						    })
						}
					}
					else{
						console.log("ERROR")
					}
				}
			})
		}else{
			guardarFacturaLocal(invoice);
			console.log("Lo sentimos no tiene internet, la factura sera guardada y se enviara automaticamente")
			Swal.fire({
		      icon: 'error',
		      title: "Lo sentimos no tiene internet, la factura sera guardada y se enviara automaticamente",
		      text: response.data.message,
		      confirmButtonText: 'OK',
		      confirmButtonColor: '#3085d6'
		    }).then((result) => {
		      if (result.isConfirmed) {
		        location.reload(true)
		      }
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
    	leerFacturas()
    })

    // let socket = new WebSocket("ws://54.81.46.48:9091/ws/resolution/");
    let socket = new WebSocket("wss://api.evansoft.co/ws/resolution/");

	socket.onopen = function() {
	    console.log("Conexión WebSocket establecida");
	    socket.send(JSON.stringify({ 
	    	action: "get_resolution", 
	    	branch_id : branch_id,
	    	type_document : type_document
	    }));
	};

	socket.onmessage = function(event) {
	    try {
	    	console.log(event.data)
	        let data = JSON.parse(event.data);
	        if (data.result && data.resolution) {
	        	invoice.prefix = data.resolution.prefix
	            $(".days_resolution").text("La resolución vence en " + data.resolution.days_remaining + " días");
	            $(".number_invoice").text(data.resolution._from);
	            invoice.number = data.resolution._from
	        }
	    } catch (error) {
	        console.error("Error al procesar mensaje WebSocket:", error);
	    }
	};

	socket.onerror = function(error) {
	    console.log("Error en WebSocket: ", error);
	};

	socket.onclose = function() {
	    console.log("Conexión WebSocket cerrada. Intentando reconectar...");
	    setTimeout(() => {
	        location.reload();
	    }, 3000);
	};

	setInterval(() => {
	    if (socket.readyState === WebSocket.OPEN) {
	        socket.send(JSON.stringify({ action: "get_resolution",branch_id : branch_id,
	    	type_document : type_document }));
	    }
	}, 1000);

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

	Open_List_Product()

	function Clear_Tmp(){
		$(".price1").val(0)
		$(".price2").val(0)
		$(".price3").val(0)
		$(".price4").val(0)
		$(".price5").val(0)
		$(".price6").val(0)
		$("#productSelect").val(null).trigger("change");
		$(".quantity").val('')
		$(".type_price").val('')
		
	}

	

});
