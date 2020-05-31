getImg <- function(txt) {
  raw <- RCurl::base64Decode(txt, mode="raw")
  if (all(as.raw(c(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))==raw[1:8])) { # it's a png...
    img <- png::readPNG(raw)
    transparent <- img[,,4] == 0
    img <- as.raster(img[,,1:3])
    img[transparent] <- NA
  } else if (all(as.raw(c(0xff, 0xd8, 0xff, 0xd9))==raw[c(1:2, length(raw)-(1:0))])) { # it's a jpeg...
    img <- jpeg::readJPEG(raw)
  } else stop("No Image!")
  return(img)
}