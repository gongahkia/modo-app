[![](https://img.shields.io/badge/modo_1.0.0-deprecated-red)](https://github.com/gongahkia/modo-app/releases/tag/1.0.0)
![](https://img.shields.io/badge/modo_2.0.0-build-orange)
[![Netlify Status](https://api.netlify.com/api/v1/badges/bfe2c10c-d1de-4f3b-b623-82f3872bc1ed/deploy-status)](https://app.netlify.com/sites/modo-live/deploys)

> [!IMPORTANT]
>  
> **Test Account 1 Details**   
> Email: *garby2910@gmail.com*  
> Password: *2f7k"Y,b@#4kCB?*  
>  
> **Test Account 2 Details**   
> Email: *petercegoh@gmail.com*  
> Password: *jjjjjjj*  

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
* Firebase Realtime Database
* ImgBB

## Architecture

... Refer to vince's documentation in the README.md and style this repo's README accordingly https://github.com/vincetyy/CS203-Kickoff

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
  }
}
```

### Overview

```mermaid
...
```

## License

... Refer to license Vince and Zeming put on their projects and model those

## Reference

The name `Modo` is in reference to [Modal Soul](https://en.wikipedia.org/wiki/Modal_Soul), the second album produced by legendary Japanese hip-hop artist 瀬葉 淳 (Jun Seba), better known by his stage name [Nujabes](https://en.wikipedia.org/wiki/Nujabes). 

![](https://images2.alphacoders.com/446/446324.jpg)
