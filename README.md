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
+ load text based .prg `dixy-lang` programs from disk
+ save text based .prg `dixy-lang` programs to disk

## Usage

### Serve the single page application in your browser

Simply clone this repository and use an http server to serve the files in your browser. I myself use `http-server` installed globally via `npm i -g http-server` and serve the project using `http-server -p 3000`.

### Writing a dixy-lang .prg file

You now are able to write `dixy-lang` programsin your favorite text editor and load them into the emulator to run them.

The first line of a `.prg` file optionally may contain a memory size declaration between `0x80` and `0x1000` inclusive.
If you start your `.prg` file with a `$` followed by the four digit hexadecimal number of bytes of memory you want, the
emulator will set the data size to the number of requested bytes.

> *Comments*
> Any text that follows a semi-colon until the end of the line will be ignored by the emulator.

```
$0080 ; specify we want 128 bytes of memory (minimum for dixy-lang programs)
; hello.prg
; (c) 2018, Richard Marks MIT License
; dixy-lang hello world program
; outputs the string "Hello World!" to standard output
; assumes ram is initialized to zero
; assumes registers are initialized to zero
; exits with ram and registers restored to zero

111111111157095f7091150a157095f
ff70009eeee09ffff50000791097911
116091090909111179f9eee6f9eeeff
ff2000202202fffffff200020000202
ff2ff2fff2ff2eeeeeeeeee560a0a0a
0a0a0a0a0a0affffffffff
```

> Use the `Load File` button in the emulator to load a `.prg` file.

## Roadmap

+ package the whole thing up with electron for a native desktop experience
+ create a mobile-friendly version for `dixy-lang` programming on the go

## License
MIT License - see LICENSE.md
