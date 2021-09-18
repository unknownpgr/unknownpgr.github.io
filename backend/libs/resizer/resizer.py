from PIL import Image
import sys

try:
    fi = sys.argv[1]
    fo = sys.argv[2]
    if len(sys.argv) > 3:
        WIDTH = int(sys.argv[3])
    else:
        WIDTH = 320

    img = Image.open(fi)
    width, height = img.size
    r = height/width

    HEIGHT = int(WIDTH*r)

    img_resize_lanczos = img.resize((WIDTH, HEIGHT), Image.LANCZOS)
    img_resize_lanczos.save(fo)
    print("Success")
except:
    print("Fail")
