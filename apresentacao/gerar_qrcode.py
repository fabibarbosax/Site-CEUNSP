import math, sys
import segno
from PIL import Image, ImageDraw, ImageFilter

URL, MASCOT, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
RAD, PAD = float(sys.argv[4]), float(sys.argv[5])
FC_RED, LOGO, QUIET = sys.argv[6] == 'red', sys.argv[7] == '1', int(sys.argv[8])
FR = float(sys.argv[9])
NAVY, RED, WHITE = (14, 35, 80, 255), (225, 37, 27, 255), (251, 250, 247, 255)
S = 2400                      # tamanho final
SS = 2                        # supersampling
W = S * SS
cx, cy = W / 2, W * 0.53       # centro da estrela (levemente abaixo, por causa da ponta de cima)
R_OUT, R_IN = W * 0.50, W * 0.31

def star_mask(r_out, r_in, rounding):
    m = Image.new('L', (W, W), 0)
    pts = []
    for i in range(10):
        r = r_out if i % 2 == 0 else r_in
        a = -math.pi / 2 + i * math.pi / 5
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    ImageDraw.Draw(m).polygon(pts, fill=255)
    # arredonda as pontas: desfoca e corta no meio
    m = m.filter(ImageFilter.GaussianBlur(rounding))
    return m.point(lambda v: 255 if v > 128 else 0)

base = Image.new('RGBA', (W, W), (0, 0, 0, 0))
outline = star_mask(R_OUT, R_IN, 60 * SS)
inner = star_mask(R_OUT - 46 * SS, R_IN - 30 * SS, 55 * SS)
base.paste(NAVY, (0, 0), outline)
base.paste(RED, (0, 0), inner)

# ---- QR ----
qr = segno.make(URL, error='h')
mat = [list(r) for r in qr.matrix]
n = len(mat)
quiet = QUIET
mod = int(R_IN * 1.30 / (n + quiet * 2))   # módulo inteiro: sem frestas entre quadradinhos
side = mod * (n + quiet * 2)
x0, y0 = int(cx - side / 2), int(cy - side / 2)
d = ImageDraw.Draw(base)
d.rounded_rectangle([x0, y0, x0 + side, y0 + side], radius=mod * 2.2, fill=WHITE, outline=NAVY, width=int(10 * SS))

def is_finder(r, c):
    return (r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7)

for r in range(n):
    for c in range(n):
        if mat[r][c] and not is_finder(r, c):
            px, py = x0 + (c + quiet) * mod, y0 + (r + quiet) * mod
            pad = mod * PAD
            if RAD == 0 and PAD == 0:
                d.rectangle([px, py, px + mod - 1, py + mod - 1], fill=NAVY)
            else:
                d.rounded_rectangle([px + pad, py + pad, px + mod - pad, py + mod - pad], radius=mod * RAD, fill=NAVY)

def finder(r0, c0):
    px, py = x0 + (c0 + quiet) * mod, y0 + (r0 + quiet) * mod
    d.rounded_rectangle([px, py, px + 7 * mod, py + 7 * mod], radius=mod * FR * 2, fill=NAVY)
    d.rounded_rectangle([px + mod, py + mod, px + 6 * mod, py + 6 * mod], radius=mod * FR * 1.4, fill=WHITE)
    d.rounded_rectangle([px + 2 * mod, py + 2 * mod, px + 5 * mod, py + 5 * mod], radius=mod * FR * 0.9, fill=RED if FC_RED else NAVY)

for r0, c0 in [(0, 0), (0, n - 7), (n - 7, 0)]:
    finder(r0, c0)

# ---- Astra no centro ----
logo_r = side * 0.13
if LOGO:
  d.ellipse([cx - logo_r, cy - logo_r, cx + logo_r, cy + logo_r], fill=WHITE, outline=NAVY, width=int(8 * SS))
  m = Image.open(MASCOT).convert('RGBA')
  k = (logo_r * 1.62) / max(m.size)
  m = m.resize((int(m.width * k), int(m.height * k)), Image.LANCZOS)
  base.alpha_composite(m, (int(cx - m.width / 2), int(cy - m.height / 2)))

out = base.resize((S, S), Image.LANCZOS)
out.save(OUT + '.png', optimize=True)
bg = Image.new('RGBA', (S, S), NAVY); bg.alpha_composite(out); bg.convert('RGB').save(OUT + '-fundo-azul.png', optimize=True)
bg = Image.new('RGBA', (S, S), WHITE); bg.alpha_composite(out); bg.convert('RGB').save(OUT + '-fundo-branco.png', optimize=True)
print('modules', n, 'version', qr.version, 'error', qr.error)
