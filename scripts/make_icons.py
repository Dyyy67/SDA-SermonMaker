from PIL import Image, ImageDraw
import math

def rounded_bg(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=(27, 21, 34, 255))
    return img, d

def draw_mark(size):
    img, d = rounded_bg(size)
    cx, cy = size / 2, size / 2 * 1.02
    gold = (192, 138, 62, 255)
    gold_l = (214, 167, 90, 255)

    # open book silhouette
    w = size * 0.62
    h = size * 0.34
    top = cy - h * 0.15
    left = cx - w / 2
    right = cx + w / 2

    # left page
    d.polygon(
        [
            (cx, top),
            (left, top - h * 0.10),
            (left, top + h * 0.95),
            (cx, top + h * 1.05),
        ],
        fill=gold,
    )
    # right page
    d.polygon(
        [
            (cx, top),
            (right, top - h * 0.10),
            (right, top + h * 0.95),
            (cx, top + h * 1.05),
        ],
        fill=gold_l,
    )
    # spine
    d.line([(cx, top - size * 0.02), (cx, top + h * 1.05)], fill=(27, 21, 34, 255), width=max(2, int(size * 0.012)))

    # rising flame above the spine
    flame_cx = cx
    flame_base_y = top - h * 0.12
    flame_h = size * 0.30
    flame_w = size * 0.16
    d.polygon(
        [
            (flame_cx, flame_base_y - flame_h),
            (flame_cx + flame_w * 0.42, flame_base_y - flame_h * 0.45),
            (flame_cx + flame_w * 0.24, flame_base_y),
            (flame_cx - flame_w * 0.24, flame_base_y),
            (flame_cx - flame_w * 0.42, flame_base_y - flame_h * 0.45),
        ],
        fill=gold_l,
    )

    return img

for size, name in [(192, "icon-192.png"), (512, "icon-512.png")]:
    im = draw_mark(size)
    im.save(f"/home/claude/sermon-builder/public/icons/{name}")

print("done")
