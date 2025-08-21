from from_number_to_letters import Thousands_Separator,numero_a_letras
from acttions import Customer, Inventory, Branch, Invoice, Wallet
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from inventory.decorators import session_required
from django.http import HttpResponse,JsonResponse
from django.template import TemplateSyntaxError
from datetime import datetime
import traceback, json


@session_required
def Create_Invoice(request, type_document):
	request.session["type_document"] = type_document
	return render(request,'invoice/create_invoice.html')

@session_required
@csrf_exempt
def Get_Customer_By_Name(request):
	if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
		data = Customer(request).Get_Customer_By_Name()
		print(data)
		return JsonResponse(data, safe=False)

@session_required
@csrf_exempt
def Get_Product_By_Name(request):
	if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
		data = Inventory(request).Get_Product_By_Name()
		print(data)
		return JsonResponse(data, safe=False)

@session_required
def Get_Resolution(request):
	if request.headers.get('x-requested-with') == 'XMLHttpRequest':
		return JsonResponse(Branch(request).Get_Resolution())

@session_required
def List_Invoice(request, type_document):
    print(request.session['branch_id'])
    request.session['type_document'] = type_document
    return render(request,'invoice/list.html',{"list_branch":Branch(request).List_Branch()})

@session_required
@csrf_exempt
def Get_All_Inventory(request):
    try:
        if request.method in ["POST"]:
            data = Inventory(request).Get_All_Inventory()
            return JsonResponse({"status": "success", "data": data}, safe=False)
        return JsonResponse({"error": "Método no permitido"}, status=405)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@session_required
def Get_List_Invoice(request):
    try:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            draw = int(request.GET.get('draw', 1))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
            search_value = request.GET.get('search[value]', '').strip()
            pk_branch = int(request.GET.get('branch_id', 1))
            if not pk_branch:
                return JsonResponse({"error": "Sucursal no especificada"}, status=400)
            page = start // length + 1
            per_page = length
            request.session['tmp_branch_id'] = pk_branch
            value = {
                "page": page,
                "per_page": per_page,
                "branch_id": int(pk_branch),
                "search": search_value,
                "type_document": request.session['type_document']
            }
            invoice_data = Invoice(request).Get_List_Invoice(value)  # Recibe el diccionario completo

            invoice_list = invoice_data.get('invoice', [])  # Extrae la lista de facturas
            total_products = invoice_data.get('total_products', 0)  # Extrae el total de productos correctamente

            data = [
                {
                    "pk": p.get('id', ''),
                    "prefix": p.get('prefix', ''),
                    "invoice": f"{p.get('prefix', '')} - {p.get('number', '')}",
                    "number": f"{p.get('number', '')}",
                    "number": p.get('number', ''),
                    "customer": p.get('customer__name', ''),
                    "phone": p.get('customer__phone', ''),
                    "status": p.get('status', ''),
                    "total": p.get('total', ''),
                    "date_only": p.get('date_only', '')
                } for p in invoice_list
            ]

            return JsonResponse({
                "draw": draw,
                "recordsTotal": total_products,
                "recordsFiltered": total_products,
                "data": data
            }, safe=False)

        return JsonResponse({"error": "Invalid request"}, status=400)
    except Exception as e:
        print("🚨 ERROR en Get_List_Invoice:", traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def Send_Dian(request):
    result = False
    message = None
    _data = None
    try:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest' and request.method == "POST":
            data = json.loads(request.body)
            _result = Invoice(request).Create_Invoice(data)
            with open("ResultadoDIAN.txt",'w') as file:
                file.write(str(_result))
    except Exception as e:
        message = str(e)
    return JsonResponse({'result':_result['result'], 'message':_result['message'],'data': _result})


@session_required
def Return_Product(request):
    result = None
    message = None
    try:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            result = Inventory(request).Return_Product()
            message = "Successfully"
    except Exception as e:
        message = str(e)
    return JsonResponse({'result':result,'message':message})
    
@session_required
def Finalizado(request):
    result = None
    message = None
    try:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            result = Inventory(request).Finalizado()
            message = "Successfully"
    except Exception as e:
        message = str(e)
    return JsonResponse({'result':result,'message':message})

def Close_Box_Days(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        message = None
        result = False
        print_close_box = False
        try:
            print_close_box = request.session.get('print_close_box', False)
            if not print_close_box:
                result = Invoice(request).Generate_Closure_Report()
                for key in list(request.session.keys()):
                    del request.session[key]
            result = True
            message = "Successfully"
        except Exception as e:
            message = str(e)
        return JsonResponse({
            'print_close_box': print_close_box,
            'message': message,
            'result': result
        })
    else:
        # Aquí puedes manejar el caso de petición normal si quieres
        return JsonResponse({'result': False, 'message': 'Petición no válida'}, status=400)

@session_required
def Generate_Closure_Report(request):
    result = None
    message = None
    try:
        result = Invoice(request).Generate_Closure_Report()
        for key in list(request.session.keys()):
            del request.session[key]
        print(result)
    except Exception as e:
        message = str(e)
    return render(request, 'invoice/close_box.html', {
        'result': result,
        'message': message,
    })
          
def Print_Invoice(request, number, type_document):
    result = None
    message = None
    branch_id = request.session['tmp_branch_id'] if 'tmp_branch_id' in request.session else request.session['branch_id']
    result = Invoice(request).Get_Full_Invoice(branch_id, number, type_document)
    print(result,'Factura')
    data = result
    subtotals = 0
    valtax = 0
    ico = 0
    discount = 0
    total = 0
    neto = 0
    for i in data['details']:
        quantity = i['quantity']
        price = i['price']
        tax = i['tax']
        total = round(float((price - i['ico'])), 2)
        cost = total / (1 + (tax / 100))
        _valtax = total - cost
        _discount = i['discount'] if i['discount'] > 100 else cost * (i['discount'] /100)
        cost -= _discount
        total = cost * (1 + (tax / 100))
        _valtax = total - cost
        neto += price
        i['cost'] = round(float(cost), 2)
        i['valtax'] = _valtax
        i['subtotal'] = cost * quantity
        i['discount'] = _discount
        
        valtax += _valtax * quantity
        subtotals += round(float(cost  * quantity),2)
        discount += round(float(_discount  * quantity), 2)
        ico += round(float(i['ico']  * quantity ), 2)

    total_other_charges = 0
    for i in data['other_charges']:
        print(type(i['charge_indicator']))
        if i['charge_indicator']:
            total_other_charges += round(float(i['amount']),2)
    discount_global = round(float(data['invoice']['discount_global']),2)

    totals = {
        "subtotals": subtotals,
        "tax": valtax,
        "ico": ico,
        "discount": discount,
        'totals': round(float(subtotals + valtax + ico + total_other_charges),2),
        'totals_with_discount': round(float((subtotals + valtax + ico + total_other_charges) - discount_global), 2),
        'discount_global': discount_global,
        'neto': round(float(neto), 2),
    }
    return render(request,f'invoice/ticket.html',{
        'invoice':data['invoice'],
        'details':data['details'],
        'payment_form':data['payment_form'],
        'customer':data['customer'],
        'list_taxes':data['list_taxes'],
        'totals':totals,
        'company':data['company'],
        'qr':data['qr'],
        'resolution':data['resolution'],
        'branch':data['branch'],
        'number':data['resolution']['_from'],
        'type_document':data['invoice']['type_document'],
        "other_charges": data['other_charges'],
        "total_other_charges": total_other_charges,
    })



@session_required
def Export_Sales_Report(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse(Invoice(request).Export_Sales_Report())

@session_required
def Generate_Journal_Report(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse(Invoice(request).Generate_Journal_Report())

@session_required
@require_POST
def Generate_Closure_Report_By_Date(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        data = json.loads(request.body)
        request.session['date_from'] = data['start_date']
        request.session['date_to'] = data['end_date']
        result = Invoice(request).Generate_Closure_Report_By_Date(data)
        request.session['closed_box'] = result
        print(result)
        return JsonResponse(result)

@session_required
def Generate_Closure_Report_By_Dates(request):
    result = None
    message = None
    print(request.session['closed_box'])
    try:
        result = request.session['closed_box']
        start_date = request.session['date_from']
        end_date = request.session['date_to']
    except Exception as e:
        message = str(e)
    return render(request,f'invoice/close_box_by_date.html',{
        'result': result,
        'message': message,
        'date_to':end_date,
        'date_from':start_date,
    })

@session_required
def View_Invoice(request, number):
    try:
        result = Invoice(request).Get_Full_Invoice(request.session['tmp_branch_id'], number, request.session['type_document'])
        data = result
        data['invoice']['date'] = datetime.strptime(data['invoice']['date'], "%Y-%m-%d").strftime("%d/%m/%Y")
        if data is None:
            return render(request, 'error.html', {'message': 'Factura no encontrada','code_error':404,'message_support': "",'home': False})
        subtotals = 0
        valtax = 0
        ico = 0
        discount = 0
        total = 0
        global_discount = 0
        neto = 0

        for i in data['details']:
            quantity = i['quantity']
            price = i['price']
            tax = i['tax']
            neto += price

            total = round(float((price - i['ico'])), 2)
            cost = total / (1 + (tax / 100))
            _valtax = total - cost
            _discount = round(float(cost * (i['discount'] / 100)), 2) if int(i['discount']) <= 100 else i['discount']
            global_discount += 0

            cost -= _discount
            total = cost * (1 + (tax / 100))
            _valtax = total - cost
            i['cost'] = round(float(cost), 2)
            i['valtax'] = _valtax
            i['subtotal'] = cost * quantity
            i['discount'] = _discount
            
            valtax += _valtax * quantity
            subtotals += round(float(cost  * quantity),2)
            discount += round(float(_discount  * quantity), 2)
            ico += round(float(i['ico']  * quantity ), 2)


        val_letters = numero_a_letras((subtotals  - discount) + valtax + ico)
        totals = {
            "subtotals": subtotals,
            "tax": valtax,
            "ico": ico,
            "discount": discount,
            'totals': round(float(subtotals + valtax + ico),2),
            'totals_with_discount': round(float((subtotals  - global_discount) + valtax + ico), 2),
            'neto': neto,
        }
        
        return render(request, 'invoice/invoice.html', {
            'invoice': data['invoice'],
            'details':data['details'],
            'payment_form':data['payment_form'],
            'customer':data['customer'],
            'list_taxes':data['list_taxes'],
            'totals':totals,
            'company':data['company'],
            'qr':data['qr'],
            'resolution':data['resolution'],
            'branch':data['branch'],
            'number':data['resolution']['_from'],
            'type_document':data['invoice']['type_document'],
            'val_letters':val_letters
        })
    except TemplateSyntaxError as e:
        print(f"Error de plantilla: {str(e)}")
        return render(request, 'error.html', {
            'message': 'Ocurrio un error en la plantilla de la factura',
            'code_error': 500,
            'message_support': "Por favor comunicarse con soporte técnico",
            'home': False
        })
    except Exception as e:
        print(f"Error al obtener la factura: {str(e)}")
        return render(request, 'error.html', {
            'message': 'Hubo un error al procesar la solicitud: ' + str(e),
            'code_error': 500,
            'message_support': "",
            'home': False
        })


@session_required
def Get_All_accounts_Receivable_View(request):
    return render(request,'wallet/list.html', {"list_branch":Branch(request).List_Branch(),"total": 0,
                "outstanding_amount": 0,
                "amount": 0})

@session_required
def Get_All_accounts_Receivable(request):
    try:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            draw = int(request.GET.get('draw', 1))
            start = int(request.GET.get('start', 0))
            length = int(request.GET.get('length', 10))
            search_value = request.GET.get('search[value]', '').strip()
            pk_branch = request.GET.get('pk_branch', None)
            if not pk_branch:
                return JsonResponse({"error": "Sucursal no especificada"}, status=400)

            page = start // length + 1
            per_page = length
            value = {
                "page": page,
                "per_page": per_page,
                "branch_id": int(pk_branch),
                "search": search_value
            }

            accounts_Receivable = Wallet(request).Get_All_accounts_Receivable(value)
            invoice = accounts_Receivable.get('invoice', [])
            total_products = accounts_Receivable.get('total_products', 0)

            valor_total = 0
            outstanding_amount = 0
            amount = 0
            data = []

            for p in invoice:
                try:
                    total = float(p.get('invoice__total', 0) or 0)
                    pendiente = float(p.get('outstanding_amount', 0) or 0)
                    abonado = float(p.get('amount', 0) or 0)
                except (ValueError, TypeError):
                    total = pendiente = abonado = 0

                valor_total += total
                outstanding_amount += pendiente
                amount += abonado

                data.append({
                    "pk": p.get('id', ''),
                    "paid": "Pendiente" if str(p.get('paid')).lower() in ['false', '0', '', 'none', 'null'] else "Cancelado",
                    "outstanding_amount": f"${pendiente:,.2f}",
                    "customer": p.get('customer__name', ''),
                    "total": f"${total:,.2f}",
                    "amount": f"${abonado:,.2f}",
                    "number": f"{p.get('invoice__prefix', '')}-{p.get('invoice__number', '')}",
                    "due_date": p.get('due_date', '')
                })

            return JsonResponse({
                "draw": draw,
                "recordsTotal": total_products,
                "recordsFiltered": total_products,
                "data": data,
                "total": valor_total,
                "outstanding_amount": outstanding_amount,
                "amount": amount,
            })
        return JsonResponse({"error": "Invalid request"}, status=400)
    except Exception as e:
        import traceback
        print("🚨 ERROR en Get_List_Product:", traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)

@require_POST
def Send_Dian_(request):
    try:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            data = request.POST
            data = Invoice(request).Send_Dian(data)
            return JsonResponse({"status": "success", "data": data})
        return JsonResponse({"error": "Método no permitido"}, status=405)
    except Exception as e:
        print(e,'ERROR SEND DIAN')
        return JsonResponse({"error": str(e)}, status=500)

@require_POST
def Send_Email_Invoice(request):
    try:
        if request.headers.get('x-requested-with') != 'XMLHttpRequest':
            return JsonResponse({"error": "Solicitud no válida"}, status=400)

        number = request.POST.get('number')
        branch_id = request.session['tmp_branch_id']
        type_document = request.POST.get('type_document')

        if not all([number, branch_id, type_document]):
            return JsonResponse({"error": "Faltan parámetros requeridos"}, status=400)

        # Lógica del envío
        response_data = Invoice(request).Send_Email_Invoice({
            'number': number,
            'branch_id': branch_id,
            'type_document': type_document,
        })

        return JsonResponse({"status": "success", "data": response_data})

    except Exception as e:
        print("ERROR SEND EMAIL INVOICE:", e)
        return JsonResponse({"error": str(e)}, status=500)

@require_POST
def Anulled_Invoice(request):
    try:
        if request.headers.get('x-requested-with') != 'XMLHttpRequest':
            return JsonResponse({"error": "Solicitud no válida"}, status=400)

        number = request.POST.get('number')
        branch_id = request.POST.get('branch_id')
        type_document = request.POST.get('type_document')

        if not all([number, branch_id, type_document]):
            return JsonResponse({"error": "Faltan parámetros requeridos"}, status=400)

        # Lógica del envío
        response_data = Invoice(request).Anulled_Invoice({
            'number': number,
            'branch_id': branch_id,
            'type_document': type_document,
        })

        return JsonResponse({"status": "success", "data": response_data})

    except Exception as e:
        print("ERROR SEND EMAIL INVOICE:", e)
        return JsonResponse({"error": str(e)}, status=500)

@require_POST
def Create_PDF(request):
    try:
        if request.headers.get('x-requested-with') != 'XMLHttpRequest':
            return JsonResponse({"error": "Solicitud no válida"}, status=400)

        with open("llegamos.txt",'w') as file:
            file.write(str(request.POST))

        number = request.POST.get('number')
        branch_id = request.session['tmp_branch_id']
        type_document = request.POST.get('type_document')

        if not all([number, branch_id, type_document]):
            return JsonResponse({"error": "Faltan parámetros requeridos"}, status=400)

        # Lógica del envío
        response_data = Invoice(request).Create_PDF({
            'number': number,
            'branch_id': branch_id,
            'type_document': type_document,
        })

        return JsonResponse({"status": "success", "data": response_data})

    except Exception as e:
        print("ERROR SEND EMAIL INVOICE:", e)
        with open("llegamos_error.txt",'w') as file:
            file.write(str(e))
        return JsonResponse({"error": str(e)}, status=500)















