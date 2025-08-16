import os
import uvicorn
from fastapi import FastAPI, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, SquareModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from PIL import Image, ImageColor
import io


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://qr-buddy.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/generate_qr")
async def generate_qr(
    text: str = Form(...),
    fgColor: str = Form("black"),
    bgColor: str = Form("white"),
    style: str = Form("square"),
    logo: UploadFile = File(None)
):

    try:
        fg_color = ImageColor.getrgb(fgColor)
    except ValueError:
        fg_color = (0, 0, 0)
    
    try:
        bg_color = ImageColor.getrgb(bgColor)
    except ValueError:
        bg_color = (255, 255, 255)

    if style == "rounded":
        drawer = RoundedModuleDrawer()
    else:
        drawer = SquareModuleDrawer()

    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H)
    qr.add_data(text)
    qr.make(fit=True)

    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=drawer,
        color_mask=SolidFillColorMask(back_color=bg_color, front_color=fg_color),
    )

    if logo:
        logo_bytes = await logo.read()
        logo_img = Image.open(io.BytesIO(logo_bytes)).convert("RGBA")

        box_size = min(img.size) // 4
        logo_img = logo_img.resize((box_size, box_size))

        pos = (
            (img.size[0] - logo_img.size[0]) // 2,
            (img.size[1] - logo_img.size[1]) // 2,
        )
        img.paste(logo_img, pos, mask=logo_img)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)