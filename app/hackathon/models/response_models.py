from pydantic import BaseModel
from decimal import Decimal
from datetime import date, datetime
from typing import Optional

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
    InvoiceSID: int
    ClientSID: int
    Dt_sent: Optional[datetime]
    Amt: Decimal
    ProjectSID: int
    Dt_Due: datetime
    AmtPd: Decimal
    InvoiceStatus: str
    ReviewStatus: int

    def __init__(self, **data):
        super().__init__(**data)
        self.Amt = round(self.Amt, 2)
        self.AmtPd = round(self.AmtPd, 2)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            InvoiceSID=int(data['InvoiceSID']),
            ClientSID=int(data['ClientSID']),
            Dt_sent=datetime.strptime(data['Dt_sent'], '%m/%d/%Y %H:%M') if data['Dt_sent'] else None,
            Amt=Decimal(str(data['Amt'])),
            ProjectSID=int(data['ProjectSID']),
            Dt_Due=datetime.strptime(data['Dt_Due'], '%m/%d/%Y %H:%M'),
            AmtPd=Decimal(str(data['AmtPd'])),
            InvoiceStatus=data['InvoiceStatus'],
            ReviewStatus=int(data['ReviewStatus'])
        )

    @classmethod
    def from_row(cls, row):
        return cls(
            InvoiceSID=int(row[0]),
            ClientSID=int(row[1]),
            Dt_sent=datetime.strptime(row[2], '%m/%d/%Y %H:%M') if row[2] else None,
            Amt=Decimal(str(row[3])),
            ProjectSID=int(row[4]),
            Dt_Due=datetime.strptime(row[5], '%m/%d/%Y %H:%M') if isinstance(row[5], str) else row[5],
            AmtPd=Decimal(str(row[6])),
            InvoiceStatus=row[7],
            ReviewStatus=int(row[8])
        )
    def to_dict(self):
        return {
            'InvoiceSID': self.InvoiceSID,
            'ClientSID': self.ClientSID,
            'Dt_sent': self.Dt_sent.isoformat() if self.Dt_sent else None,
            'Amt': float(self.Amt),
            'ProjectSID': self.ProjectSID,
            'Dt_Due': self.Dt_Due.isoformat(),
            'AmtPd': float(self.AmtPd),
            'InvoiceStatus': self.InvoiceStatus,
            'ReviewStatus': self.ReviewStatus
        }
    
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