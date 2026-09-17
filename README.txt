# Study With Power - Final Secure Manual WhatsApp OTP + Questions JSON

1. Replace your project's src/App.jsx with the supplied App.jsx.
2. Firebase Authentication: enable Anonymous. Google and Phone can remain enabled.
3. Firebase Realtime Database -> Rules: replace the current rules with firebase-database-rules.json and Publish.
4. Admin email used by the app/rules: cciashish@gmail.com
5. Manual OTP flow:
   Student -> Anonymous session -> login request -> Admin generates OTP -> Admin sends OTP manually on WhatsApp -> Student enters OTP.
6. Questions JSON is available in the Admin Panel.
7. Do not upload .env or firebase-service-account.json to the frontend or public repository.

Important:
- The client does not write "expired" anymore; an expired OTP simply cannot be verified.
- Admin reads loginRequests at the parent path; the rules explicitly allow that only for the admin email.
- Student reads only their own request by matching uid.
