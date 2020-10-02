# WallColle

Wallpaper collection management system.

WIP. Not ready for production.

## Introduction

This repo is designed to be the hub of managing community-contributed wallpapers.

It is tailored for [AOSC OS](https://aosc.io), but other communities may find this work helpful.

## Contribution Model

### Principles

- Wallpapers are contributed by community members.
- Each Wallpaper has 1 and only 1 Contributor.
- Each Contributor has an arbitrary number of Wallpapers.
- Each Pack contains multiple Wallpapers.
- For each release (e.g. OS Version), a set of Wallpapers may be bundled into it. Such a release is identified as a Pack.

## Wallpaper Quality Requirements

- Ratios: `1:1` or `16:10`.
- The format should be PNG, JPEG, or SVG.
- Minimal width: 2560px for `1:1`; 3200px for `16:10`.
- The colorspace should be sRGB.
- The color depth should be 8 bits.

## Contribute Wallpapers

### Copyright

- You should own the to-be-submitted image, or you can prove that any person can redistribute the image under a specific license.

### 1. Fork This Repo

Fork this repo to your own account and make changes there.

The following steps are supposed to be executed in your own repository.

### 2. Create Your Directory & Manifest

Suppose that your GitHub username is `myname`.

At `/contributors/myname/me.json`, you should write a JSON configuration which looks like this:

```json
{
    "uname": "myname",
    "name": "My Name",
    "uri": "mailto:myname@exmaple.com",
    "wallpapers": [
        {
            "i": 0,
            "f": "png",
            "t": "Image_Title",
            "l": "cc-by-nd-4.0",
            "tags": [ "Abstract" ,"Nature", "Forest" ]
        }
    ]
}
```

Field           | Description
--------------- | -----------
`uname`         | Your GitHub username.
`name`          | Your human-friendly name.
`uri`           | Your email address () or website.
`wallpapers`    | An array of your wallpapers.

For each entry in `wallpapers` field:

Field   | Description
------- | -----------
`i`     | The index of this image.
`f`     | The format of this image. Must be 3 lowercase characters. Can be `png`, `jpg`, or `svg`.
`t`     | The title of this image. Will be used for human-friendly display purposes. Can include letters, numbers, and hyphens. Must be unique across contributors. Use title capitalization.
`l`     | License identifier. You can find the list of acceptable licenses in another section later.
`tags`  | Optional field. An array of tags. Each tag can only contain lowercase letters. You can find the list of acceptable tags in another section later.

### 3. Put Your Image

Since this is your initial contribution, your directory should be empty.

Suppose that your contribution is a PNG file. You may put it in your directory and its path should be `/contributors/myname/0.png`.

The index should be autoincremental from 0. All formats share the same counter.

## Packs

### Basics

Each pack is represented by a file in `/packs`

## Contribute Code

There is no limit!

## Copyright

Copyright (c) 2020 Neruthes <i@neruthes.xyz> and 0 other contributors.

The Programs in this repository are released under GNU GPLv2.

## Contributors

## Appendix 1: Acceptable Tags

- Abstract
  - Geometry
  - Laser
- Civil
  - Countryside
  - Cyberpunk
  - Cyberpunk
  - Metropolis
- Fantasy
- Illustration
- Legacy
- Nature
  - Desert
  - Forest
  - Jungle
  - Mountain
  - Oasis
  - Plant
  - Water
