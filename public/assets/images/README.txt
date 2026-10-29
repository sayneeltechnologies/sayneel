IMAGE PLACEHOLDERS
==================

Every file here is a real, working image — nothing on the site is broken or
missing. The .svg files are branded placeholders designed to be swapped for
your own photographs and screenshots.

KEEP THE FILENAME. If you change the extension (e.g. about-team.svg ->
about-team.jpg), update the one <img src> reference in the matching HTML file
and rewrite the alt text to describe the real image.

  about-team.svg .................. about.html — team photograph, 3:2
  careers-culture.svg ............. careers.html — workplace photograph, 3:2
  balsaathi-screen-*.svg (6 files)  balsaathi.html — real app screenshots, 4:3
  portfolio-*.svg (9 files) ....... index.html + work.html — 640x300
  og-default.jpg .................. social share card, must stay 1200x630
  og-balsaathi.jpg ................ social share card, must stay 1200x630
  sayneel-logo.png ................ used by Schema.org markup, square, >=512px

BEFORE PUBLISHING photographs of identifiable people — especially children,
patients or field beneficiaries — make sure you hold documented written
consent from them or their guardian.

Optimise before upload; aim for under 200 KB per photograph:
  convert input.jpg -resize 1600x -quality 82 -strip output.jpg
  cwebp -q 82 input.jpg -o output.webp

Full guidance: README.md, section 5.
