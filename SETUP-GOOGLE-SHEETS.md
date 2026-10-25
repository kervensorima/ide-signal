# Connecter Google Sheets (2-3 minutes)

1. Ouvre https://sheets.google.com et cree une feuille **IDE SIGNAL Leads**.
2. Menu **Extensions → Apps Script**.
3. Colle le contenu de `google-apps-script/Code.gs`.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copie l'URL `https://script.google.com/macros/s/.../exec`
6. Local: cree `.env` avec `VITE_APPS_SCRIPT_URL=...`
7. Netlify: Site settings → Environment variables → `VITE_APPS_SCRIPT_URL` → redeploy

Test: soumets une idee. Une ligne doit apparaitre dans l'onglet **Leads**.
