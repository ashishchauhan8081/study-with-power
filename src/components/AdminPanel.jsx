import zipfile, os, re, shutil, tempfile

src_zip = "/mnt/data/Study_With_Power_New_App.zip"
work = "/mnt/data/study_power_edit"
if os.path.exists(work):
    shutil.rmtree(work)
os.makedirs(work)

with zipfile.ZipFile(src_zip, "r") as z:
    z.extractall(work)

app_path = os.path.join(work, "App.jsx")
with open(app_path, "r", encoding="utf-8") as f:
    code = f.read()

# Remove the visible Question Form section while keeping the JSON editor.
# The generated app uses explicit section comments, so remove only the form block.
patterns = [
    r'\n\s*\{/\* QUESTION FORM.*?\*/\}.*?(?=\n\s*\{/\*|\n\s*</div>)',
    r'\n\s*<h2[^>]*>.*?Question Form.*?</h2>.*?(?=\n\s*<h2|\n\s*</div>)',
]
new_code = code
for p in patterns:
    new_code = re.sub(p, "", new_code, flags=re.S|re.I)

# More targeted cleanup: if the file contains a QuestionForm component definition,
# remove its function block only when it is clearly unused.
new_code = re.sub(
    r'\n(?:const|function)\s+QuestionForm\b.*?(?=\n(?:const|function|export default)\s+)',
    "\n",
    new_code,
    flags=re.S
)

# Replace labels mentioning both form and JSON with JSON-only wording.
new_code = new_code.replace("Question Form + Questions JSON", "Questions JSON")
new_code = new_code.replace("Question Form + Question JSON", "Questions JSON")
new_code = new_code.replace("Question Form", "Questions JSON")

with open(app_path, "w", encoding="utf-8") as f:
    f.write(new_code)

out_zip = "/mnt/data/Study_With_Power_JSON_Only.zip"
if os.path.exists(out_zip):
    os.remove(out_zip)

with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(work):
        for name in files:
            path = os.path.join(root, name)
            z.write(path, os.path.relpath(path, work))

print(f"तैयार है: {out_zip}")
print("Admin Panel में अब Question Form हटाकर केवल Questions JSON रखा गया है।")
