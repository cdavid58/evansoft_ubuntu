import json, requests, operations as op

class Home:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Login(self):
		payload = json.dumps({
		  "documentI": self.request.GET['documentI'],
		  "user":  self.request.GET['user'],
		  "psswd":  self.request.GET['psswd']
		})
		response = requests.request("GET", op.LOGIN, headers = self.headers, data=payload)
		result = json.loads(response.text)
		self.request.session['pk_employee'] = result['pk_employee']
		self.request.session['name_employee'] = result['name']
		self.request.session['company_id'] = result['company_id']
		self.request.session['branch_id'] = result['branch_id']
		self.request.session['customer_id'] = result['customer_id']
		self.request.session['supplier_id'] = result['supplier_id']
		self.request.session['limited_inventory'] = result['limited_inventory']
		self.request.session['logo'] = result['logo']
		self.request.session['rols'] = result['rols']
		self.request.session['discount'] = result['discount']
		self.request.session['print_close_box'] = result['print_close_box']
		self.request.session['create_box'] = result['create_box']
		return json.dumps(result)

class Branch:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def List_Branch(self):
		payload = json.dumps({
		  "company_id": self.request.session['company_id']
		})
		response = requests.request("POST", op.LIST_BRANCH, headers = self.headers, data=payload)
		result = json.loads(response.text)
		return result['list_branch']

	def Create_Or_Update_License(self):
		raw_data = json.loads(self.request.body)
		payload = json.dumps(raw_data)
		response = requests.request("POST", op.CREATE_OR_UPDATE_LICENSE, headers = self.headers, data=payload)
		return json.loads(response.text)

	def Create_Or_Update_Branch(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_OR_UPDATE_BRANCH, headers = self.headers, data=payload)
		return json.loads(response.text)

	def Update_Resolution_PDF_Dian(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.UPDATE_RESOLUTION_PDF_DIAN, headers = self.headers, data=payload)
		return json.loads(response.text)

	def Get_Resolution(self):
		payload = json.dumps({
		  "branch_id": self.request.session['branch_id'],
		  "type_document": self.request.session["type_document"]
		})
		response = requests.request("GET", op.GET_RESOLUTION, headers = self.headers, data=payload)
		result = json.loads(response.text)
		return result

	def Get_Branch(self):
		payload = json.dumps({
		  "branch_id": self.request.session['branch_select']
		})
		response = requests.request("GET", op.GET_BRANCH, headers = self.headers, data=payload)
		return json.loads(response.text)
		
	def Activate_Discount(self):
		payload = json.dumps({"branch_id": self.request.session['branch_id']})
		response = requests.request("POST", op.ACTIVATE_DISCOUNT, headers = self.headers, data=payload)
		result = json.loads(response.text)
		self.request.session['discount'] = result['state']
		return result


class Inventory:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Get_Products_By_Branch(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.GET_PRODUCTS_BY_BRANCH, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Return_One_Product(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.RETURN_ONE_PRODUCT, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Generate_Movement_History_Report(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.GENERATE_MOVEMENT_HISTORY_REPORT, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Export_Inventory_To_Excel(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.EXPORT_INVENTORY_TO_EXCEL, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Get_Profit_Report(self):
		payload = json.dumps({"branch_id": self.request.session['branch_id']})
		response = requests.request("POST", op.GET_PROFIT_REPORT, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Get_Product(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.GET_PRODUCT, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Get_All_Category(self):
		response = requests.request("POST", op.GET_ALL_CATEGORY, headers=self.headers, data=json.dumps({'branch_id':self.request.session['branch_id']}))
		return json.loads(response.text)

	def Create_Inventory(self,data):
		response = requests.request("POST", op.CREATE_INVENTORY, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_All_Inventory(self):
		response = requests.request("POST", op.GET_ALL_INVENTORY, headers=self.headers, data=json.dumps({'branch_id':self.request.session['branch_id']}))
		return json.loads(response.text)

	def Delete_Inventory(self,data):
		response = requests.request("DELETE", op.DELETE_INVENTORY, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Reserved(self):
		response = requests.request("POST", op.RESERVED, headers=self.headers, data=json.dumps(self.request.GET))
		return json.loads(response.text)

	def Return_Product(self):
		response = requests.request("POST", op.RETURN_PRODUCT, headers=self.headers, data=json.dumps({"employee_id" : self.request.session['pk_employee']}))
		return json.loads(response.text)

	def Finalizado(self):
		response = requests.request("POST", op.FINALIZADO, headers=self.headers, data=json.dumps({"employee_id" : self.request.session['pk_employee']}))
		return json.loads(response.text)

	def Get_Sales_Predictions(self, data):
		response = requests.request("POST", op.GET_SALES_PREDICTIONS, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Scan_Inventory(self, data):
		response = requests.request("POST", op.SCAN_INVENTORY, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Loan(self, data):
		response = requests.request("POST", op.LOAN, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_Product_By_Name(self):
		data = json.loads(self.request.body)
		payload = json.dumps({
            "branch_id": self.request.session.get('branch_id'),
            "name": data.get("q", "")
        })
		response = requests.request("POST", op.GET_PRODUCT_BY_NAME, headers = self.headers, data=payload)
		return json.loads(response.text)['product']

class Customer:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Get_All_Customer(self, data):
		response = requests.request("POST", op.GET_ALL_CUSTOMER, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_All_Evangeli(self):
		response = requests.request("POST", op.GET_ALL_EVANGELI, headers=self.headers, data=json.dumps({'company_id': self.request.session['company_id']}))
		return json.loads(response.text)

	def Create_Customer(self,data):
		response = requests.request("POST", op.CREATE_CUSTOMER, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_Customer(self,data):
		response = requests.request("GET", op.GET_CUSTOMER, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Delete_Customer(self,data):
		response = requests.request("DELETE", op.DELETE_CUSTOMER, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Create_Customer_By_RUT(self,data):
		payload = json.dumps({
		  "employee_id": self.request.session.get('pk_employee'),
		  "company_id": self.request.session.get('company_id'),
		  "rut": data
		})
		response = requests.request("POST", op.CREATE_CUSTOMER_BY_RUT, headers=self.headers, data=payload)
		result = json.loads(response.text)
		return result

	def Get_Customer_By_Name(self):
		data = json.loads(self.request.body)
		payload = json.dumps({
            "company_id": self.request.session.get('company_id'),
            "name": data.get("q", "")
        })
		response = requests.request("POST", op.GET_CUSTOMER_BY_NAME, headers = self.headers, data=payload)
		return json.loads(response.text)

class Setting:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Get_Data_General(self, data):
		response = requests.request("POST", f"{op.GET_ALL_DATA}{data}/", headers={}, data=json.dumps({'branch_id':self.request.session['branch_id']}))
		return json.loads(response.text)

class Supplier:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Create_Or_Update_Supplier(self, data):
		response = requests.request("POST", op.CREATE_OR_UPDATE_SUPPLIER, headers = self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_List_Supplier(self, data):
		response = requests.request("POST", op.GET_LIST_SUPPLIER, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_Supplier(self,data):
		response = requests.request("GET", op.GET_SUPPLIER, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Delete_Supplier(self,data):
		response = requests.request("DELETE", op.DELETE_SUPPLIER, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_Supplier_By_Name(self):
		data = json.loads(self.request.body)
		payload = json.dumps({
            "company_id": self.request.session.get('company_id'),
            "name": data.get("q", "")
        })
		response = requests.request("POST", op.GET_SUPPLIER_BY_NAME, headers = self.headers, data=payload)
		return json.loads(response.text)

class Invoice:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Anulled_Invoice(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.ANULLED_INVOICE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Create_PDF(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_PDF, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Send_Email_Invoice(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.SEND_EMAIL_INVOICE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Send_Dian(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.SEND_DIAN, headers=self.headers, data=payload)
		print(json.loads(response.text))
		return json.loads(response.text)

	def Get_List_Invoice(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.GET_LIST_INVOICE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Create_Invoice(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_INVOICE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Export_Sales_Report(self):
		payload = json.dumps(self.request.GET)
		response = requests.request("POST", op.EXPORT_SALES_REPORT, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Generate_Journal_Report(self):
		payload = json.dumps(self.request.GET)
		response = requests.request("POST", op.GENERATE_JOURNAL_REPORT, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Generate_Closure_Report_By_Date(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.GENERATE_CLOSURE_REPORT_BY_DATE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Generate_Closure_Report(self):
		payload = json.dumps({
		    "branch_id": self.request.session['branch_id'],
		    "employee_id": self.request.session['pk_employee']
		})
		response = requests.request("POST", op.GENERATE_CLOSURE_REPORT, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Get_Full_Invoice(self, branch_id, number, type_document):
		payload = json.dumps({
			"branch_id": branch_id,
			"type_document": type_document,
			"number": number
		})
		response = requests.request("POST", op.GET_FULL_INVOICE, headers=self.headers, data=payload)
		return json.loads(response.text) 

class Shopping:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Create_Shopping(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_SHOPPING, headers=self.headers, data=payload)
		return json.loads(response.text)

class Company:
	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Get_Data_Company(self):
		payload = json.dumps({
		  "company_id": self.request.session['company_id']
		})
		response = requests.request("POST", op.GET_DATA_COMPANY, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Update_Company(self):
		data = self.request.GET.copy()
		data['company_id'] = self.request.session['company_id']
		payload = json.dumps(data)
		response = requests.request("POST", op.UPDATE_COMPANY, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Update_Logo(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.UPDATE_LOGO, headers=self.headers, data=payload)
		result = json.loads(response.text)
		self.request.session['logo'] = result['message']
		return result

	def Create_Company(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_COMPANY, headers=self.headers, data=payload)
		result = json.loads(response.text)
		print("Resultado:",result)
		return result

class Employee:

	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request


	def Get_All_Employee(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.GET_ALL_EMPLOYEE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Create_Employee(self,data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_EMPLOYEE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Get_Employee(self,employee_id):
		payload = json.dumps({'employee_id': employee_id})
		response = requests.request("GET", op.GET_EMPLOYEE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Get_All_Roles(self):
		response = requests.request("GET", op.GET_ALL_ROLES, headers=self.headers, data={})
		return json.loads(response.text)

	def Delete_Employee(self, data):
		response = requests.request("DELETE", op.DELETE_EMPLOYEE, headers=self.headers, data=json.dumps(data))
		return json.loads(response.text)

	def Get_List_Employee(self):
		response = requests.request("POST", op.GET_LIST_EMPLOYEE, headers=self.headers, data=json.dumps({'company_id': self.request.session['company_id']}))
		return json.loads(response.text)

	def Payroll_Basic(self):
		response = requests.request("POST", op.PAYROLL_BASIC, headers=self.headers, data=json.dumps(self.request.GET))
		return json.loads(response.text)

class Wallet:

	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Get_All_accounts_Receivable(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.GET_ALL_ACCOUNTS_RECEIVABLE, headers=self.headers, data=payload)
		return json.loads(response.text)

	def Create_Pass_Invoice(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_PASS_INVOICE, headers=self.headers, data=payload)
		return json.loads(response.text)

class Novelty:

	def __init__(self, request):
		self.headers = {'Content-Type': 'application/json'}
		self.request = request

	def Create_Internal_Transaction(self, data):
		payload = json.dumps(data)
		response = requests.request("POST", op.CREATE_INTERNAL_TRANSACTION, headers=self.headers, data=payload)
		return json.loads(response.text)










