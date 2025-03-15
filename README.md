[![](https://img.shields.io/badge/modo_1.0.0-deprecated-red)](https://github.com/gongahkia/modo-app/releases/tag/1.0.0)
![](https://img.shields.io/badge/modo_2.0.0-build-orange)

# `Modo` 🖌️

<p align="center">
<img src="./asset/logo/modo-no-background.png" width=50% height=50%>
</p>

Modo is a social media app for artists.

Modo is ***now live*** at [modo-live.netlify.app](https://modo-live.netlify.app/).

## Rationale

...

## Screenshots

...

## Support

...

## Stack

* Vue.js
* Firebase
* ...

## Architecture

### DB

Firebase Realtime Database currently follows the below schema.

```json
{
  "users": {
    "userId": {
      "name": "string",
      "email": "string",
      "profilePic": "url",
      "uniqueCode": "string", 
      "following": {
        "followedUserId": true
      },
      "blacklist": {
        "blacklistedUserId": {
          "name": "string",
          "email": "string"
        }
      },
      "settings": {
        "appearance": {
          "theme": "light" 
        },
        "notificationsEnabled": true
      },
      "createdAt": "ISO8601"
    }
  },
  "posts": {
    "postId": {
      "authorId": "userId",
      "imageUrl": "url",
      "caption": "string", 
      "timestamp": "ISO8601",
      "emojis": {
        "emojiType1": ["userId"], 
        "emojiType2": ["userId"]
      },
      "comments": {
        "commentId": {
          "authorId": "userId",
          "text": "string",
          "timestamp": "ISO8601"
        }
      }
    }
  },
  "artLimits": { // tracks how many posts a user has created in a week to enforce the 3-post-per-week limit
    "userId": {
      "weekStartTimestamp": { // timestamp of the start of the week
        "count": 3 // number of posts created this week
      }
    }
  },
  "qrCodesToUsersMap": { // maps unique QR codes to user IDs for adding friends
    "uniqueCodeString1234567890abcdefg12345": { // generated QR code string (hashed or UUID)
      "userId": true
    }
  }
}
```

### Overview

```mermaid
```

## Disclaimer

> TODO add legal disclaimer here

## License

> Add license here similar to the one Zeming posted in his repo ...

## Reference

The name `Modo` is in reference to [Modal Soul](https://en.wikipedia.org/wiki/Modal_Soul), the second album produced by legendary Japanese hip-hop artist 瀬葉 淳 (Jun Seba), better known by his stage name [Nujabes](https://en.wikipedia.org/wiki/Nujabes). 

![](https://images2.alphacoders.com/446/446324.jpg)
