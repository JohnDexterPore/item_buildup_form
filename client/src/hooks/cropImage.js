export default function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `profile_${Date.now()}.jpeg`, {
            type: "image/jpeg",
          });
          resolve(file); // ✅ return File object
        }
      }, "image/jpeg");
    };
  });
}
