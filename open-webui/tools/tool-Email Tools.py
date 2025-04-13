"""
title: EmailSender Pipeline
author: Christopher Vaz
date: 2024-07-01
version: 1.0
license: MIT
description: A pipeline for sending arbitrary emails using SMTP.
requirements: smtplib, email, os, json
"""

import smtplib
from email.mime.text import MIMEText
from typing import List, Dict, Any
import os
import json
from pydantic import BaseModel, Field


class Tools:
    class Valves(BaseModel):
        FROM_EMAIL: str = Field(
            default="someone@example.com",
            description="The email a LLM can use",
        )
        PASSWORD: str = Field(
            default="password",
            description="The password for the provided email address",
        )

    def __init__(self):
        self.valves = self.Valves()

    def get_user_name_and_email_and_id(self, __user__: dict = {}) -> str:
        """
        Get the user name, Email and ID from the user object.
        """

        # Do not include :param for __user__ in the docstring as it should not be shown in the tool's specification
        # The session user object will be passed as a parameter when the function is called

        print(__user__)
        result = ""

        if "name" in __user__:
            result += f"User: {__user__['name']}"
        if "id" in __user__:
            result += f" (ID: {__user__['id']})"
        if "email" in __user__:
            result += f" (Email: {__user__['email']})"

        if result == "":
            result = "User: Unknown"

        return result

    def send_email(self, subject: str, body: str, recipients: List[str]) -> str:
        """
        Send an email with the given parameters. Sign it with the user's name and indicate that it is an AI generated email. NOTE: You do not need any credentials to send emails on the users behalf.
        DO NOT SEND WITHOUT USER'S CONSENT. CONFIRM CONSENT AFTER SHOWING USER WHAT YOU PLAN TO SEND, AND IN THE RESPONSE AFTER ACQUIRING CONSENT, SEND THE EMAIL.
        :param subject: The subject of the email.
        :param body: The body of the email.
        :param recipients: The list of recipient email addresses.
        :return: The result of the email sending operation.
        """
        sender: str = self.valves.FROM_EMAIL
        password: str = self.valves.PASSWORD
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = ", ".join(recipients)

        try:
            with smtplib.SMTP("smtp.office365.com", 587) as smtp_server:
                smtp_server.starttls()  # Use STARTTLS
                smtp_server.login(sender, password)
                smtp_server.sendmail(sender, recipients, msg.as_string())
            return f"Message sent:\n   TO: {str(recipients)}\n   SUBJECT: {subject}\n   BODY: {body}"
        except Exception as e:
            return str({"status": "error", "message": f"{str(e)}"})
