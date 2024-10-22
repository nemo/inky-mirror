# Nima's Daily Reminders
I've built myself a simple system to remind me of my core focus areas for the year.

## Usage Details
When the device is set-up, you can login with:

```bash
ssh nima@inky.local
```

## Hardware
I'm using a [Pimoroni Impression](https://pimoroni.com/impression), along with a [Raspberry Pi Zero WH ](https://www.adafruit.com/product/3708) to achieve this.

### First-Time Set-up

#### Install Raspberry Pi OS
Using the Raspberry Pi Imager, install Raspberry Pi OS.

* Set hostname to `inky.local` when installing Raspberry Pi OS.
* Set username to `nima`, with my usual offline password
* Ensure ssh is enabled
* Set Wifi details ahead of time.

Make sure we're up to date:
```bash
sudo apt-get update -y && sudo apt- upgrade -y && sudo reboot
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
Use `crontab -e` to add the following to the crontab:
```
*/30 * * * * sh /home/nima/run.sh >/dev/null 2>&1
```