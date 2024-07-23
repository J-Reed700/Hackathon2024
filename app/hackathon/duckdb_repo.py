import json
from opentelemetry import trace
import duckdb
from .models.response_models import Staff, Invoice, Client, Project, Time, OverdueInvoice, StafferTimeOnOverdueInvoice

tracer = trace.get_tracer(__name__)

class DuckDBRepo: 

    def __init__(self):
         self.con = duckdb.connect('md:?motherduck_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoianJlZWQuYmlndGltZS5uZXQiLCJlbWFpbCI6ImpyZWVkQGJpZ3RpbWUubmV0IiwidXNlcklkIjoiMDVlMDlkNjQtN2Q1Ny00Nzg0LTk1OGQtM2Q4Njc4NmE0MTk3IiwiaWF0IjoxNzIxMDczNjc2LCJleHAiOjE3NTI2MzEyNzZ9.RZHasl5ixtJMNLsKl3c9QLv6X1_KZCzFV4zdOjREIeg') 
         pass

    # ================================
    # General Query Methods
    # ================================

    
    def query_invoice(self, as_df: bool):
        with tracer.start_as_current_span("Agent.invoicing") as span:
            if as_df:
                df = self.con.execute("SELECT * FROM tblInvoice").df()
                return df.to_string(index=False)
            else:
                result = self.con.execute("SELECT * FROM tblInvoice").fetchall()
                return [Invoice.from_row(row) for row in result]

    def query_staff(self, as_df: bool):
        with tracer.start_as_current_span("Agent.staff") as span:
            if as_df:
                df = self.con.execute("SELECT * FROM tblStaff").df()
                return df.to_string(index=False)
            else:
                result = self.con.execute("SELECT * FROM tblStaff").fetchall()
                return [Staff.from_row(row) for row in result]

    def query_time(self, as_df: bool):
        with tracer.start_as_current_span("Agent.time") as span:
            if as_df:
                df = self.con.execute("SELECT * FROM tblTime").df()
                return df.to_string(index=False)
            else:
                result = self.con.execute("SELECT * FROM tblTime").fetchall()
                return [Time.from_row(row) for row in result]

    def query_project(self, as_df: bool):
        with tracer.start_as_current_span("Agent.project") as span:
            if as_df:
                df = self.con.execute("SELECT * FROM tblProject").df()
                return df.to_string(index=False)
            else:
                result = self.con.execute("SELECT * FROM tblProject").fetchall()
                return [Project.from_row(row) for row in result]

    def query_client(self, as_df: bool):
        with tracer.start_as_current_span("Agent.client") as span:
            if as_df:
                df = self.con.execute("SELECT * FROM tblClient").df()
                return df.to_string(index=False)
            else:
                result = self.con.execute("SELECT * FROM tblClient").fetchall()
                return [Client.from_row(row) for row in result]
    # ================================
    # Insight methods
    # ================================ 

    def overdue_invoices(self, as_df: bool):
        with tracer.start_as_current_span("Agent.overdue_invoices") as span:
            df = self.con.execute(f"""SELECT i.InvoiceSID,
                                        	i.Amt - ISNULL(i.AmtPd, 0) AS RemainingBalance,
                                        	i.Dt_Due,
                                        	p.ProjectName,
                                        	c.ClientName
                                        FROM tblInvoice AS i
                                        JOIN tblProject AS p ON i.ProjectSID = p.SID
                                        JOIN tblClient AS c ON p.ClientSID = c.SID
                                        WHERE i.Dt_Due < GETDATE()
                                        	AND i.InvoiceStatus NOT IN ('Paid', 'Cancelled')
                                        	AND (i.Amt > ISNULL(i.AmtPd, 0))
                                        ORDER BY ProjectName;"""
                                ).df()
            if(as_df):
                return df.to_string(index=False) 
            return [OverdueInvoice.from_dict(row) for row in df.to_dict('records')]
            
    def staffer_time_on_overdue_invoices(self, as_df: bool):
        with tracer.start_as_current_span("Agent.staffer_time_overdue_invoices") as span:
            df = self.con.execute(f"""SELECT t.InvoiceSID,
                                        	SUM(t.HrsIN) TotalHoursInput,
                                        	SUM(t.HrsBill) TotalHoursBilled,
                                        	CONVERT(smallmoney, SUM(t.ChargeBill)) TotalChargesBilled,
                                        	CONVERT(smallmoney, SUM(t.ChargeIN)) TotalChargesInput,
                                        	s.FirstName,
                                        	s.LastName,
                                        	s.JobTitle,
                                        	s.Capacity
                                        FROM tblTime AS t
                                        JOIN tblStaff AS s ON t.StaffSID = s.StaffSID
                                        WHERE t.InvoiceSID IN (
                                        		SELECT i.InvoiceSID
                                        		FROM #ObInvoice AS i
                                        		WHERE i.Dt_Due < GETDATE()
                                        			AND i.InvoiceStatus NOT IN ('Paid/Closed')
                                        			AND (i.Amt > ISNULL(i.AmtPd, 0))
                                        		)
                                        GROUP BY t.InvoiceSID,
                                        	s.FirstName,
                                        	s.LastName,
                                        	s.JobTitle,
                                        	s.Capacity
                                        ORDER BY FirstName,
                                        	LastName""").df()
            if(as_df):
                return df.to_string(index=False) 
            return [StafferTimeOnOverdueInvoice.from_dict(row) for row in df.to_dict('records')]
        
    def staffer_time(self, as_df: bool):
        with tracer.start_as_current_span("Agent.staffer_time") as span:
            df = self.con.execute(f"""SELECT t.InvoiceSID,
                                        	SUM(t.HrsIN) TotalHoursInput,
                                        	SUM(t.HrsBill) TotalHoursBilled,
                                        	CONVERT(smallmoney, SUM(t.ChargeBill)) TotalChargesBilled,
                                        	CONVERT(smallmoney, SUM(t.ChargeIN)) TotalChargesInput,
                                        	s.FirstName,
                                        	s.LastName,
                                        	s.JobTitle,
                                        	s.Capacity
                                        FROM tblTime AS t
                                        JOIN tblStaff AS s ON t.StaffSID = s.StaffSID
                                        GROUP BY t.InvoiceSID,
                                        	s.FirstName,
                                        	s.LastName,
                                        	s.JobTitle,
                                        	s.Capacity
                                        ORDER BY FirstName,
                                        	LastName""").df()
            if(as_df):
                return df.to_string(index=False) 
            return [StafferTimeOnOverdueInvoice.from_dict(row) for row in df.to_dict('records')]
            
            