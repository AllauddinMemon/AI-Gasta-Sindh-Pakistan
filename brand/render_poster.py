# Ledger Bloom — GASTA AI brand poster.
# Subtle reference (woven invisibly): a civic claims registry — five strata for the five
# welfare services, a migration of marks from open (gold) to resolved (indigo).
import math
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONTS = "/sessions/gifted-sharp-shannon/mnt/.claude/skills/canvas-design/canvas-fonts"
pdfmetrics.registerFont(TTFont("Mono",      f"{FONTS}/GeistMono-Regular.ttf"))
pdfmetrics.registerFont(TTFont("MonoB",     f"{FONTS}/GeistMono-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Grotesque", f"{FONTS}/BricolageGrotesque-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Jura",      f"{FONTS}/Jura-Light.ttf"))

# ---- palette ----
BONE   = Color(0.953, 0.949, 0.925)     # archival paper ground
INDIGO = Color(0.118, 0.227, 0.541)     # #1E3A8A deep blue
INK    = Color(0.090, 0.106, 0.169)     # near-black ink
GOLD   = Color(0.961, 0.620, 0.043)     # #F59E0B accent
FAINT  = Color(0.118, 0.227, 0.541, 0.18)
HAIR   = Color(0.090, 0.106, 0.169, 0.28)

W, H = 1190, 1684   # A-ish portrait, hi-res points
M = 96              # margin
c = canvas.Canvas("GASTA-AI-Poster.pdf", pagesize=(W, H))

# ground
c.setFillColor(BONE); c.rect(0, 0, W, H, fill=1, stroke=0)

# subtle paper grain: faint dotted matrix behind everything
c.setFillColor(Color(0.090,0.106,0.169,0.04))
gx = M
while gx <= W-M:
    gy = M
    while gy <= H-M:
        c.circle(gx, gy, 0.9, fill=1, stroke=0)
        gy += 17
    gx += 17

# ---- top frame: clinical header ----
c.setStrokeColor(HAIR); c.setLineWidth(1)
c.line(M, H-M, W-M, H-M)
c.setFont("Mono", 10.5); c.setFillColor(INK)
c.drawString(M, H-M+12, "GASTA · ASSOCIATION REGISTRY")
c.drawRightString(W-M, H-M+12, "FIG. 01 — FIELD OF CLAIMS")

# ---- the FIELD: five strata, each a row of marks migrating open->resolved ----
# Each stratum = one welfare service. Marks fill left (gold, open) to right (indigo, resolved).
strata = 5
cols = 26
fx0, fx1 = M+58, W-M
band_top = H - 360
band_h = 206
r = 6.6
romans = ["I","II","III","IV","V"]
for s in range(strata):
    cy = band_top - s*band_h - 40
    # per-row index numeral, aligned to the register
    c.setFont("Mono", 9); c.setFillColor(INDIGO)
    c.drawString(M, cy-4, romans[s])
    # hairline baseline for the register
    c.setStrokeColor(FAINT); c.setLineWidth(0.8)
    c.line(fx0, cy-28, fx1, cy-28)
    for col in range(cols):
        t = col/(cols-1)
        x = fx0 + t*(fx1-fx0)
        # migration: early = open (gold ring), late = resolved (filled indigo)
        # a soft probability so the boundary feels hand-tallied, not mechanical
        threshold = 0.30 + 0.40*s/(strata-1)  # each stratum resolves at a different rate
        resolved = t > threshold
        # vertical micro-jitter for a labored, hand-plotted feel
        jit = math.sin(col*1.7 + s*2.1)*1.4
        yy = cy + jit
        if resolved:
            c.setFillColor(INDIGO); c.setStrokeColor(INDIGO); c.setLineWidth(1)
            c.circle(x, yy, r, fill=1, stroke=0)
        else:
            c.setStrokeColor(INDIGO); c.setLineWidth(1.1)
            c.circle(x, yy, r, fill=0, stroke=1)
        # the single gold exception per stratum: the mark at the threshold (the moment of care)
        if abs(t-threshold) < (1.0/(cols-1))*0.6:
            c.setFillColor(GOLD); c.setStrokeColor(GOLD)
            c.circle(x, yy, r-2.2, fill=1, stroke=0)
    # tiny clinical count at row end
    c.setFont("Mono", 8.5); c.setFillColor(INK)
    c.drawRightString(fx1, cy-44, f"n={cols:02d}")

# ---- large singular gesture: the title, set as evidence, not decoration ----
c.setFillColor(INDIGO)
c.setFont("Grotesque", 132)
c.drawString(M, H-216, "GASTA")
c.setFont("Jura", 40)
c.setFillColor(INK)
c.drawString(M+6, H-262, "A R T I F I C I A L   I N T E L L I G E N C E")

# ---- bottom legend / sparse essential phrase ----
ly = M + 150
c.setStrokeColor(HAIR); c.setLineWidth(1)
c.line(M, ly, W-M, ly)

# legend keys (whisper-quiet)
def key(x, filled, label):
    yy = ly-34
    if filled=="ring":
        c.setStrokeColor(INDIGO); c.setLineWidth(1.1); c.circle(x, yy, 6, fill=0, stroke=1)
    elif filled=="gold":
        c.setFillColor(GOLD); c.circle(x, yy, 5, fill=1, stroke=0)
    else:
        c.setFillColor(INDIGO); c.circle(x, yy, 6, fill=1, stroke=0)
    c.setFont("Mono", 9); c.setFillColor(INK)
    c.drawString(x+14, yy-3, label)

key(M, "ring", "PENDING")
key(M+170, "gold", "IN REVIEW")
key(M+360, "fill", "RESOLVED")

c.setFont("Jura", 22); c.setFillColor(INDIGO)
c.drawString(M, M+64, "Every claim, accounted for.")
c.setFont("Mono", 9.5); c.setFillColor(INK)
c.drawString(M, M+34, "GOVERNMENT SECONDARY TEACHERS' ASSOCIATION")
c.drawRightString(W-M, M+34, "MEDICAL · HOUSING · SCHOLARSHIP · SUN QUOTA · EMERGENCY")
c.drawRightString(W-M, M+64, "SYSTEM — GUIDED BY AI")

c.showPage(); c.save()
print("PDF written: GASTA-AI-Poster.pdf")
