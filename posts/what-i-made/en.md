---
title: Things I've Made
tags:
  - dev
date: 2023-09-03T06:15:42.023Z
---

> This post was translated from Korean into English by AI.

In this post, I want to briefly catalog the things I have made. I value the ability to solve problems by building what I need myself, but I have often found it difficult to organize everything when trying to introduce my work to others.

### Diary

My diary is the first program I built while learning development as the need arose, the first one I found genuinely useful, and the one I learned the most from while making it. It is literally my personal diary, so unfortunately I cannot make it public.

### [Real Estate Brokerage Program](https://real-estate.unknownpgr.com/)

This is a service I created to help my parents with their work as licensed real estate agents. It is currently for personal use, but I plan to develop it into a business after completing my military service.

### [The Form](https://the-form.io/)

The Form is a survey service that currently has around 10,000 monthly active users. I built it while participating in the Software Maestro program.

### [Route53 DDNS](https://github.com/unknownpgr/route53-ddns)

I implemented dynamic DNS using AWS Route 53's DNS service. At regular intervals, it compares the current IP address with the most recently updated one and, if they differ, updates the A record in Route 53. I run it on Kubernetes as a container.

### [EC2 Controller](https://github.com/unknownpgr/ec2-webui)

I use an EC2 Windows desktop instance so I can program while serving in the military. Leaving the instance running 24 hours a day costs too much, while logging into the console every time to turn it on or off is inconvenient, so I built a web UI. It lets me turn EC2 on and off or configure it to start and stop automatically at specific times of day.

### [HTTP Tunneling](https://github.com/unknownpgr/http-tunnelling)

I created a server that performs simple tunneling to provide access to an HTTP server on a private network. Running a script on the destination server generates a URL, which can then be used to access the server inside the private network.

### [Blog](https://unknownpgr.com)

This blog is another thing I built myself. It uses React+TS+Vite / Node.js+Koa.

### [SSH Brute-force Analyzer](https://github.com/unknownpgr/ssh-brute-force-analyzer)

My server is constantly targeted by countless SSH brute-force attacks. To analyze them, I created a program that opens a fake server designed to look like SSH and receives the attacks. It records the attacker's IP address, the account they tried to log in with, and the password they used. This makes it possible to analyze attackers' behavioral patterns.

### [Literature Review Checker](https://github.com/unknownpgr/literature-review-checker)

Some time ago, when I was reading dozens or even hundreds of papers in a lab for a literature review, I created a simple program that made it possible to quickly filter out papers unrelated to the topic.

### [Bill-Splitting Calculator](https://github.com/unknownpgr/dutch-calc)

I once had a hard time splitting expenses on a trip, so I created a bill-splitting calculator.

- It can handle both cases where the prices of individual items are given (each person bought one item, but one person paid for everything) and cases where only the total price is given (one person bought an item that several people shared, such as food).
- It calculates how much each member needs to pay every other member.

### [Movie Server](https://github.com/unknownpgr/movie-server)

I no longer use it, but I used to have access to a GiGA Genie while serving in the military. GiGA Genie can be used to browse websites on a TV, so I created a website where I could upload videos and watch them through it.

- Videos can be rewound or fast-forwarded using the number buttons on the remote control.
- For videos with subtitles, there is also a feature for adjusting subtitle synchronization.
- In particular, in case a superior suddenly walked in, I also implemented a feature that quickly hides the entire screen.
- The site includes shortcut buttons for quickly navigating to YouTube and other sites.

### [System Volume Controller](https://github.com/unknownpgr/system-volume)

Some computers in the military's cyber knowledge and information rooms have their volume controls disabled. I created a program that sends keyboard volume-key events, allowing the system volume to be adjusted.

### [vcf2csv](https://github.com/unknownpgr/vcf2csv)

Before entering boot camp for my military service, I created a program that converts VCF files to CSV files so I could make a paper phone book.

## Aside: Open-source Software I Use

Building everything from scratch when high-quality open-source software already exists is reinventing the wheel. I use a variety of open-source software depending on my needs.

- I use `Guacamole` to access my EC2 instance.
- I occasionally download torrents, so I use `qBittorrent Web UI`.
- I manage my files with [File Browser](https://filebrowser.org/).
- I use `Harbor` to manage important Docker images.
