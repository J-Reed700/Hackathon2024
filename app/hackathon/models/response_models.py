from pydantic import BaseModel
from decimal import Decimal
from datetime import date, datetime

class Staff(BaseModel):
    staff_sid: int
    capacity: float
    rate: float
    first_name: str
    last_name: str
    job_title: str

    def __init__(self, **data):
        super().__init__(**data)
        # Add any custom initialization logic here if needed
        self.rate = round(self.rate, 2)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            staff_sid=int(data['staff_sid']),
            capacity=float(data['capacity']),
            rate=float(data['rate']),
            first_name=data['first_name'],
            last_name=data['last_name'],
            job_title=data['job_title']
        )

class Time(BaseModel):
    sid: int
    staff_sid: int
    invoice_sid: int
    dt: datetime
    dow: str
    client_sid: int
    project_sid: int
    hrs_in: float
    hrs_bill: float
    charge_in: float
    charge_bill: float

    def __init__(self, **data):
        super().__init__(**data)
        # Add any custom initialization logic here if needed
        self.charge_in = round(self.charge_in, 2)
        self.charge_bill = round(self.charge_bill, 2)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            sid=int(data['sid']),
            staff_sid=int(data['staff_sid']),
            invoice_sid=int(data['invoice_sid']),
            dt=datetime.fromisoformat(data['dt']) if isinstance(data['dt'], str) else data['dt'],
            dow=data['dow'],
            client_sid=int(data['client_sid']),
            project_sid=int(data['project_sid']),
            hrs_in=float(data['hrs_in']),
            hrs_bill=float(data['hrs_bill']),
            charge_in=float(data['charge_in']),
            charge_bill=float(data['charge_bill'])
        )

class Invoice(BaseModel):
    invoice_sid: int
    client_sid: int
    dt_sent: date
    amt: Decimal
    project_sid: int
    dt_due: date
    amt_pd: Decimal
    invoice_status: str
    review_status: str

    def __init__(self, **data):
        super().__init__(**data)
        # Add any custom initialization logic here if needed
        self.amt = round(self.amt, 2)
        self.amt_pd = round(self.amt_pd, 2)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            invoice_sid=int(data['invoice_sid']),
            client_sid=int(data['client_sid']),
            dt_sent=date.fromisoformat(data['dt_sent']) if isinstance(data['dt_sent'], str) else data['dt_sent'],
            amt=Decimal(data['amt']),
            project_sid=int(data['project_sid']),
            dt_due=date.fromisoformat(data['dt_due']) if isinstance(data['dt_due'], str) else data['dt_due'],
            amt_pd=Decimal(data['amt_pd']),
            invoice_status=data['invoice_status'],
            review_status=data['review_status']
        )

class Project(BaseModel):
    sid: int
    client_sid: int
    project_name: str
    start_dt: date
    status: str

    def __init__(self, **data):
        super().__init__(**data)
        # Add any custom initialization logic here if needed

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            sid=int(data['sid']),
            client_sid=int(data['client_sid']),
            project_name=data['project_name'],
            start_dt=date.fromisoformat(data['start_dt']) if isinstance(data['start_dt'], str) else data['start_dt'],
            status=data['status']
        )

class Client(BaseModel):
    sid: int
    client_name: str

    def __init__(self, **data):
        super().__init__(**data)
        # Add any custom initialization logic here if needed

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            sid=int(data['sid']),
            client_name=data['client_name']
        )

class OverdueInvoice(BaseModel):
    InvoiceSID: int
    RemainingBalance: Decimal
    Dt_Due: date
    ProjectName: str
    ClientName: str

    def __init__(self, **data):
        super().__init__(**data)
        self.RemainingBalance = round(self.RemainingBalance, 2)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            InvoiceSID=data['InvoiceSID'],
            RemainingBalance=Decimal(data['RemainingBalance']),
            Dt_Due=date.fromisoformat(data['Dt_Due']) if isinstance(data['Dt_Due'], str) else data['Dt_Due'],
            ProjectName=data['ProjectName'],
            ClientName=data['ClientName']
        )

class StafferTimeOnOverdueInvoice(BaseModel):
    InvoiceSID: int
    TotalHoursInput: float
    TotalHoursBilled: float
    TotalChargesBilled: Decimal
    TotalChargesInput: Decimal
    FirstName: str
    LastName: str
    JobTitle: str
    Capacity: str

    def __init__(self, **data):
        super().__init__(**data)
        self.TotalChargesBilled = round(self.TotalChargesBilled, 2)
        self.TotalChargesInput = round(self.TotalChargesInput, 2)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            InvoiceSID=data['InvoiceSID'],
            TotalHoursInput=float(data['TotalHoursInput']),
            TotalHoursBilled=float(data['TotalHoursBilled']),
            TotalChargesBilled=Decimal(data['TotalChargesBilled']),
            TotalChargesInput=Decimal(data['TotalChargesInput']),
            FirstName=data['FirstName'],
            LastName=data['LastName'],
            JobTitle=data['JobTitle'],
            Capacity=data['Capacity']
        )