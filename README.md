![](ressource/dessin-400ppp.png)
# web-midi-router
Manage MIDI device routes with a Web based application.

## Introduction
I recently bought a Chromebook, for lightweight and battery life (I hope it will last 10 hours as promised 😉), and I would like to control my MIDI devices (synthesizer) with it.

I thoutght I will be able to manage MIDI route with the Linux container thanks to ALSA and the `aconnet` command but, although it is possible to forward USB devices from ChromeOS to the Linux container, the Linux kernel[^0] available inside the LXC does not have the "`CONFIG_SND_USB`" support and I didn't find simple method to add it but wait for the google team to add it[^1].

So! Inspired by the tomarus' [midiseq](https://github.com/tomarus/midiseq)[^2] project, I decided to try to build a Progressive Web Application[^3] to be able to list MIDI devices and create route to forward MIDI messages thanks to the Web MIDI API[^4].

## Features
- v0.0.2
  - Enhanced Device display (depends on your browser/OS)
  - Route one "Input Device" to multiple "Output Device"
- v0.0.1
  - List available MIDI devices
  - Create routes to forward any MIDI messages from an "Input Device" to an "Output Device"
  - Basic Dark theme
  - (doc) List of tested Operating Systems and Web Browser
  - (doc) List of tested MIDI Devices

## Coming Features
- Filter type of event from an "Input Device" : Note On/Note Off; Pitch bend; Control Change (CC); Program Change (PC); Timing Clock; etc...
- "Panic!" button to Off all notes on "Output Device"
- [X] Add a Dark mode switch
- Remove a route
- Save and load a "patch" (list of active routes)
- Select chanel while creating a route


## Possible Enhancement
- Add a graphical view like ([qjackctl](https://qjackctl.sourceforge.io/)[^5] for [JACK](https://jackaudio.org/)[^6] and [helvum](https://gitlab.freedesktop.org/pipewire/helvum)[^7] for [pipewire](https://pipewire.org/)[^8])
- Be able to create route graphically
- Be able to select the source and destination MIDI channel while create a route graphically
- Enhance concurrent sending. For example if you have more than one "Input Device" routed to the same "Output Device". Maybe it is already supported by Web MIDI API but I haven't tested this.


## Recent Fix
- [X] Fix the device list after a refresh

## Coming Fix
- 

## Tested Operating System and Browser
|Operating System|Browser|Web MIDI API|Offline|Installable|
|----------------|-------|------------|-------|-----------|
|Android|---|No|No|No|
|ChromeOS|Chrome|Yes|Yes|Yes|
|iOS|---||||
|Linux (Fedora 40)|Chromium|Yes|Yes|Yes|
|Linux (Fedora 40)|Firefox|Yes||No|
|macOS|---|No|No|No|
|Windows|Edge|Yes|Yes|Yes|
|Windows|Chrome||||
|Windows|Firefox|Yes||No|

## Tested MIDI Device
|Manufacturer|Name|
|-|-|
|Arturia|MiniFuse 2|
|Arturia|Minilab3|
|Arturia|MicroFreak|
|Dirtywave|M8|
|KORG|NTS-1|
|Roland|Aira Compact J-6|
|Roland|Aira Compact S-1|
|Roland|Aira Compact T-8|

## Links
- [Summary of MIDI 1.0 Messages](https://midi.org/summary-of-midi-1-0-messages)

[^0]: [https://chromeos.dev/en/linux/linux-on-chromeos-faq#can-i-run-my-own-vmkernel]
[^1]: [https://chromeos.dev/en/linux/linux-on-chromeos-faq#can-i-access-hardware-eg-usbbluetoothserial]
[^2]: [https://github.com/tomarus/midiseq]
[^3]: [https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps]
[^4]: [https://www.w3.org/TR/webmidi/]
[^5]: [https://qjackctl.sourceforge.io/]
[^6]: [https://jackaudio.org/]
[^7]: [https://gitlab.freedesktop.org/pipewire/helvum]
[^8]: [https://pipewire.org/]

