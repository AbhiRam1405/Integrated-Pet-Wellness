
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, timedelta

# SMTP Configuration (from application.properties)
SMTP_HOST    = "smtp.gmail.com"
SMTP_PORT    = 587
FROM_EMAIL   = "abhishek2005kamble@gmail.com"
APP_PASSWORD = "ujbw augn asyx rydz"

# Recipient & Pet Details
TO_EMAIL     = "abhishek2005kamble@gmail.com"
OWNER_NAME   = "Abhishek"
PET_NAME     = "Buddy"
VACCINE_NAME = "Rabies"
DUE_DATE     = (date.today() + timedelta(days=2)).strftime("%Y-%m-%d")

subject = f"Vaccination Reminder - {PET_NAME}"

body = f"""Dear {OWNER_NAME},

This is a 2-day reminder for your pet's upcoming vaccination:

  Pet Name : {PET_NAME}
  Vaccine  : {VACCINE_NAME}
  Due Date : {DUE_DATE}

Please ensure your pet receives their vaccination on time to maintain optimal health.
Book an appointment at your nearest vet clinic before the due date.

Stay on top of your pet's health - a timely vaccination keeps them happy and safe!

Regards,
Pet Wellness Management System
Integrated Pet Wellness & Service Platform
"""

msg = MIMEMultipart("alternative")
msg["Subject"] = subject
msg["From"]    = FROM_EMAIL
msg["To"]      = TO_EMAIL
msg.attach(MIMEText(body, "plain"))

try:
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(FROM_EMAIL, APP_PASSWORD)
        server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())
    print(f"Email sent successfully to {TO_EMAIL}")
except Exception as e:
    print(f"Failed to send email: {e}")
