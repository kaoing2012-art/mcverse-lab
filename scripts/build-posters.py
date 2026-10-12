"""海报后处理：裁掉平台水印 → 加标题条（人格名 + 英文名 + AI 生成标注）→ 统一尺寸"""
from PIL import Image, ImageDraw, ImageFont
import os, glob

SRC = r"C:/Users/EDY/WorkBuddy/麦当劳/mcverse-lab/public/posters/"
OUT = SRC
FB = r"C:/Windows/Fonts/msyhbd.ttc"
FR = r"C:/Windows/Fonts/msyh.ttc"

PERSONAS = [
    ("p1", "天生主角型", "THE BORN LEAD", "05-07-00"),
    ("p2", "热血冒险型", "THE BLAZE RUNNER", "05-07-29"),
    ("p3", "温柔治愈型", "THE COMFORT REEL", "05-07-48"),
    ("p4", "冷静智谋型", "THE COLD STRATEGIST", "05-08-10"),
    ("p5", "快乐社交型", "THE PARTY ENSEMBLE", "05-08-29"),
    ("p6", "自由浪漫型", "THE FREE SPIRIT", "05-08-47"),
]

files = sorted(glob.glob(SRC + "*.png"))
print("找到生图:", len(files), "张")

for key, cn, en, stamp in PERSONAS:
    match = [f for f in files if stamp in f]
    if not match:
        print("⚠️ 未匹配到", key, stamp)
        continue
    im = Image.open(match[0]).convert("RGB")
    w, h = im.size
    im = im.crop((0, 0, w, int(h * 0.94)))          # 裁掉底部水印区
    w, h = im.size

    band = int(h * 0.115)                            # 标题条高度
    canvas = Image.new("RGB", (w, h + band), (12, 11, 16))
    canvas.paste(im, (0, 0))
    d = ImageDraw.Draw(canvas)

    d.text((int(w * 0.055), h + int(band * 0.18)), cn, font=ImageFont.truetype(FB, int(w * 0.062)), fill=(224, 178, 92))
    d.text((int(w * 0.055), h + int(band * 0.60)), en, font=ImageFont.truetype(FR, int(w * 0.030)), fill=(155, 148, 138))
    tag = "AI 生成 · 麦门电影宇宙"
    f = ImageFont.truetype(FR, int(w * 0.026))
    tw = d.textlength(tag, font=f)
    d.text((w - tw - int(w * 0.055), h + int(band * 0.62)), tag, font=f, fill=(110, 105, 98))
    d.line([(int(w * 0.055), h + int(band * 0.12)), (int(w * 0.055) + int(w * 0.12), h + int(band * 0.12))], fill=(200, 16, 46), width=max(2, int(w * 0.006)))

    target_w = 800
    canvas = canvas.resize((target_w, round(canvas.height * target_w / canvas.width)), Image.LANCZOS)
    canvas = canvas.convert("P", palette=Image.ADAPTIVE, colors=256)
    out = OUT + key + ".png"
    canvas.save(out, "PNG", optimize=True)
    print(f"{key}.png  {canvas.size}  {round(os.path.getsize(out)/1024)}KB")

# 清理原始生成文件
for f in files:
    os.remove(f)
print("已清理原始生图文件")
total = sum(os.path.getsize(OUT + k + ".png") for k, *_ in PERSONAS)
print("海报总体积:", round(total / 1024), "KB")
