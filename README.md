# DIXY

JavaScript Virtual Hardware Device Emulator

DIXY get's it's name from the four 8-bit virtual hardware registers.
`D` is the data pointer register.
`I` is the instruction pointer register.
`X` and `Y` are general purpose registers.

All programming for DIXY is currently done through the `dixy-lang` esoteric programming language.

This emulator serves as a self-contained IDE for dixy-lang development.

## Features

+ DIXY virtual hardware emulator
+ `dixy-lang` point-and-click programming interface
+ hexadecimal virtual memory data inspector
+ save programs to localhost
+ load programs from localhost

## Usage

### Serve the single page application in your browser

Simply clone this repository and use an http server to serve the files in your browser. I myself use `http-server` installed globally via `npm i -g http-server` and serve the project using `http-server -p 3000`.

## Roadmap

+ save / load text based .prg `dixy-lang` programs to / from disk
+ package the whole thing up with electron for a native desktop experience
+ create a mobile-friendly version for `dixy-lang` programming on the go

## License
MIT License - see LICENSE.md
