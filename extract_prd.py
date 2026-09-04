from pypdf import PdfReader

r = PdfReader(r"c:\Users\TRISTAN\Downloads\tristan-portfolio-prd.pdf")
out = []
for i, p in enumerate(r.pages):
    out.append(f"--- PAGE {i+1} ---")
    out.append(p.extract_text())

with open(r"c:\Users\TRISTAN\personal portofolio tristan\prd-extracted.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("done")
