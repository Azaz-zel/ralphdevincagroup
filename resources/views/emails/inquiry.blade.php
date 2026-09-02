<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>New inquiry — {{ $inquiry->name }}</title>
</head>

<body style="margin:0; padding:24px; background-color:#F7F5F0; color:#1B1A17; font-family:ui-sans-serif, system-ui, sans-serif; line-height:1.6;">

    <div style="max-width:600px; margin:0 auto; background-color:#FFFFFF; border:1px solid #E3DFD6; padding:32px;">

        <p style="margin:0 0 24px; font-family:ui-monospace, monospace; font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:#6B675F;">
            New inquiry
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:15px;">
            <tr>
                <td style="padding:8px 0; color:#6B675F; width:120px; vertical-align:top;">Name</td>
                <td style="padding:8px 0;">{{ $inquiry->name }}</td>
            </tr>
            <tr>
                <td style="padding:8px 0; color:#6B675F; vertical-align:top;">Email</td>
                <td style="padding:8px 0;">
                    <a href="mailto:{{ $inquiry->email }}" style="color:#1B1A17;">{{ $inquiry->email }}</a>
                </td>
            </tr>
            <tr>
                <td style="padding:8px 0; color:#6B675F; vertical-align:top;">Division</td>
                <td style="padding:8px 0;">{{ $inquiry->divisionLabel() }}</td>
            </tr>
            <tr>
                <td style="padding:8px 0; color:#6B675F; vertical-align:top;">Arrived</td>
                <td style="padding:8px 0;">{{ $inquiry->created_at->format('j F Y, H:i') }}</td>
            </tr>
        </table>

        <hr style="border:0; border-top:1px solid #E3DFD6; margin:24px 0;">

        <p style="margin:0 0 8px; font-family:ui-monospace, monospace; font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:#6B675F;">
            Message
        </p>

        <p style="margin:0; white-space:pre-line;">{{ $inquiry->message }}</p>

        <hr style="border:0; border-top:1px solid #E3DFD6; margin:24px 0;">

        <p style="margin:0;">
            <a href="{{ route('inbox.show', $inquiry) }}" style="display:inline-block; background-color:#1B1A17; color:#F7F5F0; padding:12px 20px; text-decoration:none; font-size:14px;">
                Open in the inbox
            </a>
        </p>

    </div>

</body>

</html>
