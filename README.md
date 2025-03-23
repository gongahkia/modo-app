[![](https://img.shields.io/badge/modo_1.0.0-deprecated-red)](https://github.com/gongahkia/modo-app/releases/tag/1.0.0)
![](https://img.shields.io/badge/modo_2.0.0-build-passing)
[![Netlify Status](https://api.netlify.com/api/v1/badges/bfe2c10c-d1de-4f3b-b623-82f3872bc1ed/deploy-status)](https://app.netlify.com/sites/modo-live/deploys)

# `Modo` 🖌️ - The social media app for Artists

<p align="center">
  <img src="./asset/logo/modo-no-background.png" width=50% height=50%>
</p>

Modo 2.0.0 is ***now live*** at [modo-live.netlify.app](https://modo-live.netlify.app/).

## Rationale

...

## Stack

* [Frontend](./src/modo-app/src/components/) *(Vue.js, Tailwind CSS, Netlify)*
* [Backend](./src/modo-app/src/) *(JavaScript)*
* [DB](./src/modo-app/src/firebase.js) *(Firebase Realtime Database)*
* File server *(ImgBB)*

## Screenshots

### Login/Registration

<div style="display: flex; justify-content: space-between;">
  <img src="./asset/reference/modo-v2.0.0/1.png" width="32%">
  <img src="./asset/reference/modo-v2.0.0/2.png" width="32%">
  <img src="./asset/reference/modo-v2.0.0/3.png" width="32%">
</div>

### Dashboard

<div style="display: flex; justify-content: space-between;">
  <img src="./asset/reference/modo-v2.0.0/4.png" width="48%">
  <img src="./asset/reference/modo-v2.0.0/5.png" width="48%">
</div>

<div style="display: flex; justify-content: space-between;">
  <img src="./asset/reference/modo-v2.0.0/6.png" width="48%">
  <img src="./asset/reference/modo-v2.0.0/9.png" width="48%">
</div>

### Settings

<div style="display: flex; justify-content: space-between;">
  <img src="./asset/reference/modo-v2.0.0/7.png" width="48%">
  <img src="./asset/reference/modo-v2.0.0/8.png" width="48%">
</div>

### QR accessibility

<div style="display: flex; justify-content: space-between;">
  <img src="./asset/reference/modo-v2.0.0/10.png" width="32%">
  <img src="./asset/reference/modo-v2.0.0/11.png" width="32%">
  <img src="./asset/reference/modo-v2.0.0/12.png" width="32%">
</div>

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
      "profilePic": "string",
      "uniqueCode": "string", 
      "createdAt": "string",
      "following": {
        "followedUserId": "boolean",
      },
      "followers": {
        "followerUserId": "boolean",
      },
      "settings": {
        "notificationsEnabled": "boolean",
      },
    }
  },
  "posts": {
    "postId": {
      "authorId": "string",
      "imageUrl": "string",
      "caption": "string", 
      "timestamp": "string",
      "emojis": {
        "emojiType1": ["string"], 
        "emojiType2": ["string"],
      },
      "comments": {
        "commentId": {
          "authorId": "string",
          "text": "string",
          "timestamp": "string",
        }
      },
    }
  }
}
```

### Overview

```mermaid
...
```

### Details

#### `AddArtPage.vue`

```mermaid
```

#### `AuthPage.vue`

```mermaid
```

#### `DashboardPage.vue`

```mermaid
```

#### `NavBar.vue`

```mermaid
```

#### `PostCard.vue`

```mermaid
```

#### `ProfileCard.vue`

```mermaid
```

#### `SettingsPage.vue`

```mermaid
```

#### `UserProfilePage.vue`

```mermaid
```

#### `DynamicBackground.vue`

```mermaid
```

## License

... Refer to license Vince and Zeming put on their projects and model those

## Made by 

... Probably need to edit this more.

<table>
	<tbody>
        <tr>
            <td align="center">
                <a href="https://www.linkedin.com/in/gabriel-zmong/">
                    <img src="https://avatars.githubusercontent.com/u/117062305?v=4" width="100;" alt="gongahkia"/>
                    <br />
                    <sub><b>Gabriel Ong</b></sub>
                </a>
            </td>
        </tr>
	</tbody>
</table>

## Credits

My thanks especially to the beta-testers who helped stress test Modo. 

<table>
	<tbody>
        <tr>
            <td align="center">
                <a href="https://github.com/a-stint">
                    <img src="https://avatars.githubusercontent.com/u/149822619?v=4" width="100;" alt=""/>
                    <br />
                    <sub><b>Astin Tay</b></sub>
                </a>
            </td> 
            <td align="center">
                <a href="https://github.com/kybuno">
                    <img src="https://avatars.githubusercontent.com/u/96574567?v=4" width="100;" alt=""/>
                    <br />
                    <sub><b>Nichole Bun</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/kevanwee">
                    <img src="https://avatars.githubusercontent.com/u/16420323?v=4" width="100;" alt=""/>
                    <br />
                    <sub><b>Kevan Wee</b></sub>
                </a>
            </td>
        </tr>
	</tbody>
</table>

## Support

...

## Reference

The name `Modo` is in reference to [Modal Soul](https://en.wikipedia.org/wiki/Modal_Soul), the second album produced by legendary Japanese hip-hop artist 瀬葉 淳 (Jun Seba), better known by his stage name [Nujabes](https://en.wikipedia.org/wiki/Nujabes). 

![](https://images2.alphacoders.com/446/446324.jpg)