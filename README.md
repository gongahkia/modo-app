![](https://img.shields.io/badge/modo_1.0.0-alpha-orange)

# `Modo` 🖌️

<p align="center">
<img src="./asset/logo/modo-no-background.png" width=50% height=50%>
</p>

Modo is a social media app for artists.

Currently served as a web app at [https://modo-live.vercel.app/](https://modo-live.vercel.app/).

## Rationale

> TODO add more here

## Screenshots

> TODO add more here

## Support

> TODO add here

## Architecture

```mermaid
sequenceDiagram
    participant User
    participant ModoApp
    participant Clerk
    participant FastAPI
    participant Supabase

    User->>ModoApp: Interacts with app
    ModoApp->>Clerk: Authenticate user
    Clerk-->>ModoApp: Return authentication token
    ModoApp->>FastAPI: Make authenticated API request
    FastAPI->>Supabase: Query or modify data
    Supabase-->>FastAPI: Return data
    FastAPI-->>ModoApp: Return API response
    ModoApp-->>User: Display result
```

## Disclaimer

> TODO add legal disclaimer here

## License

> TODO add license here similar to the one Zeming posted in his repo

## Beta Testers

My thanks to the following people for their patience and feedback.

> TODO add here 

## Reference

The name `Modo` is in reference to [Modal Soul](https://en.wikipedia.org/wiki/Modal_Soul), the second album produced by legendary Japanese hip-hop artist 瀬葉 淳 (Jun Seba), better known by his stage name [Nujabes](https://en.wikipedia.org/wiki/Nujabes). 

![](https://images2.alphacoders.com/446/446324.jpg)
