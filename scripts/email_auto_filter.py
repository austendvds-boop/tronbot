#!/usr/bin/env python3
"""
Email auto-filter: labels incoming Gmail messages based on simple rules.
Requires IMAP app password. Reads credentials from secrets/gmail.json.
"""
import imaplib
import email
import json
import re

# Gmail IMAP settings
IMAP_HOST = 'imap.gmail.com'
IMAP_PORT = 993


def load_filters():
    """Return list of (label, function(msg) -> bool)"""
    return [
        ('Appointments', lambda msg: '@acuityscheduling.com' in msg.get('From', '')),
        ('Invoices', lambda msg: bool(re.search(r'\b[Ii]nvoice\b', msg.get('Subject', '')))),
        ('Payments', lambda msg: bool(re.search(r'\b[Pp]ayment\b', msg.get('Subject', '')))),
        ('Newsletters', lambda msg: 'unsubscribe' in msg.get_payload(decode=True, errors='ignore').decode(errors='ignore').lower()),
    ]


def main():
    # Load credentials
    creds = json.load(open('secrets/gmail.json'))
    user = creds['email']
    pw = creds['appPassword']

    # Connect to IMAP
    M = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
    M.login(user, pw)
    M.select('INBOX')

    # Build filters
    filters = load_filters()

    # Search for unseen messages
    typ, data = M.search(None, 'UNSEEN')
    if typ != 'OK':
        print('Failed to search UNSEEN')
        return

    uids = data[0].split()
    for uid in uids:
        # Fetch headers and body preview
        typ, msg_data = M.fetch(uid, '(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT)] BODY.PEEK[TEXT]<10240> X-GM-LABELS)')
        if typ != 'OK':
            continue
        raw = b''
        for part in msg_data:
            if isinstance(part, tuple):
                raw += part[1]
        try:
            msg = email.message_from_bytes(raw)
        except Exception:
            continue

        labels_to_add = []
        for label, check in filters:
            try:
                if check(msg):
                    labels_to_add.append(label)
            except Exception:
                continue
        if not labels_to_add:
            continue

        # Apply labels via Gmail IMAP extension
        label_list_str = '","'.join(labels_to_add)
        cmd = f'UID STORE {uid.decode()} +X-GM-LABELS ("{label_list_str}")'
        M._simple_command(cmd)
        # Mark as seen
        M._simple_command(f'UID STORE {uid.decode()} +FLAGS (\Seen)')
        print(f'Labeled UID {uid.decode()}: {labels_to_add}')

    M.close()
    M.logout()


if __name__ == '__main__':
    main()
