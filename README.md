# Nima's Daily Reminders
I've built myself a simple system to remind me of my core focus areas for the year.


## Features

- [Done] Shows https://halfmoon.ws/daily-focus between 4am and 10am
- [Done] Shows a different art piece between 10am to 4am
- [Planned] Zone 2: shows the latest photo sent to a Slack channel
- [Planned] Zone 3: have an AI tell me in a different way why I should follow my dailly rituals

## Usage Details
When the device is set-up, you can login with:

```bash
ssh nima@inky.local
```

## Hardware
I'm using a [Pimoroni Impression](https://pimoroni.com/impression), along with a [Raspberry Pi Zero WH](https://www.adafruit.com/product/3708) to achieve this. I've also 3D printed a case for it that's available on [Printables here](https://www.printables.com/model/51765-pimoroni-inky-impression-case).

### First-Time Set-up

#### Install Raspberry Pi OS
Using the Raspberry Pi Imager, install Raspberry Pi OS.

* Set hostname to `inky.local` when installing Raspberry Pi OS.
* Set username to `nima`, with my usual offline password
* Ensure ssh is enabled
* Set Wifi details ahead of time.

Make sure we're up to date:
```bash
sudo apt-get update -y && sudo apt-get upgrade -y && sudo reboot
```

#### Edit Raspi configuration

First – get into rspi-config:
```bash
sudo raspi-config
```

Then:

- Interface Options -> enable I2C 
- Interface Options -> enable SPI
- Update to latest version

#### Screen Setup
Install inky software:
```bash
sudo apt install firefox-esr
curl https://get.pimoroni.com/inky | bash
```

#### Cron Setup
Download this repository:
```bash
git clone git@github.com:nemo/inky-mirror.git
```

Use `crontab -e` to add the following to the crontab:
```
*/30 * * * * sh /home/nima/inky-mirror/run.sh >/dev/null 2>&1
```
