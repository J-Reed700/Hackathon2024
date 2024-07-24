import json
from opentelemetry import trace
import duckdb
from .models.response_models import Staff, Invoice, Client, Project, Time, OverdueInvoice, StafferTimeOnOverdueInvoice
from flask import current_app
from tabulate import tabulate

tracer = trace.get_tracer(__name__)

class DuckDBRepo: 

    def __init__(self):
         self.con = duckdb.connect('md:?motherduck_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoianJlZWQuYmlndGltZS5uZXQiLCJlbWFpbCI6ImpyZWVkQGJpZ3RpbWUubmV0IiwidXNlcklkIjoiMDVlMDlkNjQtN2Q1Ny00Nzg0LTk1OGQtM2Q4Njc4NmE0MTk3IiwiaWF0IjoxNzIxMDczNjc2LCJleHAiOjE3NTI2MzEyNzZ9.RZHasl5ixtJMNLsKl3c9QLv6X1_KZCzFV4zdOjREIeg') 
         pass

    # ================================
    # General Query Methods
    # ================================

    
    def query_invoice(self, project_sid, as_df: bool):
        with tracer.start_as_current_span("Agent.invoicing") as span:
            if as_df:
                df = self.con.execute(f"""SELECT * FROM tblInvoice
                                      where ProjectSID = {project_sid}""").df()
                return df.to_string(index=False)
            else:
                result = self.con.execute(f"""SELECT * FROM tblInvoice
                                      where ProjectSID = {project_sid}""").fetchall()
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
        try:
            with tracer.start_as_current_span("Agent.overdue_invoices") as span:
                current_app.logger.info("Executing query")
                df = self.con.sql(f"""WITH project_summary AS (
                                        SELECT 
                                            p.SID,
                                            p.ProjectName,
                                            c.ClientName,
                                            SUM(i.Amt - IFNULL(i.AmtPd, 0)) AS TotalRemainingBalance,
                                            COUNT(*) AS InvoiceCount
                                        FROM tblInvoice AS i
                                        JOIN tblProject AS p ON i.ProjectSID = p.SID
                                        JOIN tblClient AS c ON p.ClientSID = c.SID
                                        WHERE strptime(i.Dt_Due, '%m/%d/%Y %H:%M') < current_date
                                            AND i.InvoiceStatus NOT IN ('Paid', 'Cancelled')
                                            AND (i.Amt > IFNULL(i.AmtPd, 0))
                                        GROUP BY p.SID, p.ProjectName, c.ClientName
                                    )
                                    SELECT 
                                        ProjectName,
                                        ClientName,
                                        TotalRemainingBalance,
                                        InvoiceCount,
                                    FROM project_summary
                                    ORDER BY TotalRemainingBalance DESC
                                    LIMIT 1"""
                                    )
                current_app.logger.info("overdue_invoices")
                if as_df:
                    fetched = df.fetchall()
                    current_app.logger.info("fetched")
                    # Get column names
                    column_names = df.columns
                    # Create table with column names
                    table_string = tabulate(fetched, headers=column_names, tablefmt="grid")
                    return table_string
                current_app.logger.info("Query executed")
                return [OverdueInvoice.from_dict(row) for row in df.df().to_dict('records')]
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            raise     

    def most_profitable(self, as_df: bool):
        try:
            with tracer.start_as_current_span("Agent.overdue_invoices") as span:
                current_app.logger.info("Executing query")
                df = self.con.sql(f"""SELECT 
                                        c.ClientName,
                                        p.ProjectName,
                                        SUM(i.Amt) AS TotalInvoiceAmount
                                    FROM 
                                        tblInvoice AS i
                                    JOIN 
                                        tblProject AS p ON i.ProjectSID = p.SID
                                    JOIN 
                                        tblClient AS c ON p.ClientSID = c.SID
                                    WHERE 
                                        i.InvoiceStatus IN ('Paid')
                                    AND i.Amt = i.AmtPd
                                    GROUP BY 
                                        c.ClientName, p.ProjectName
                                    ORDER BY 
                                        TotalInvoiceAmount DESC
                                    LIMIT 1"""
                                    )
                current_app.logger.info("overdue_invoices")
                if as_df:
                    fetched = df.fetchall()
                    current_app.logger.info("fetched")
                    # Get column names
                    column_names = df.columns
                    # Create table with column names
                    table_string = tabulate(fetched, headers=column_names, tablefmt="grid")
                    return table_string
                current_app.logger.info("Query executed")
                return [OverdueInvoice.from_dict(row) for row in df.df().to_dict('records')]
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            raise   

    def staffer_time_on_overdue_invoices(self, as_df: bool):
        with tracer.start_as_current_span("Agent.staffer_time_overdue_invoices") as span:
            df = self.con.sql(f"""SELECT t.InvoiceSID,
                                        	SUM(t.HrsIN) TotalHoursInput,
                                        	SUM(t.HrsBill) TotalHoursBilled,
                                        	CAST(SUM(t.ChargeBill) AS DECIMAL(10,2)) TotalChargesBilled,
                                        	CAST(SUM(t.ChargeIN) AS DECIMAL(10,2)) TotalChargesInput,
                                        	s.FirstName,
                                        	s.LastName,
                                        	s.JobTitle,
                                        	s.Capacity
                                        FROM tblTime AS t
                                        JOIN tblStaff AS s ON t.StaffSID = s.StaffSID
                                        WHERE t.InvoiceSID IN (
                                        		SELECT i.InvoiceSID
                                        		FROM tblInvoice AS i
                                                WHERE strptime(i.Dt_Due, '%m/%d/%Y %H:%M') < current_date
                                        			AND i.InvoiceStatus NOT IN ('Paid/Closed')
                                        			AND (i.Amt > IFNULL(i.AmtPd, 0))
                                        		)
                                        GROUP BY t.InvoiceSID,
                                        	s.FirstName,
                                        	s.LastName,
                                        	s.JobTitle,
                                        	s.Capacity
                                        ORDER BY FirstName,
                                        	LastName""")
            if(as_df):
                fetched = df.fetchall()
                current_app.logger.info("fetched")
                table_string = tabulate(fetched, headers=["result"], tablefmt="grid")
                return table_string
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
            
            