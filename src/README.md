# `Modo` web app

## Stack

| Name | Purpose |
| :--- | :--- |
| [`modo`](./modo/) | Next.js Frontend, to be hosted on Vercel *(React, Tailwind CSS and Next.js)* |
| [`back`](./back/) | FastAPI Backend, to be hosted on AWS |
| [`supa`](./supa/) | Database, to be hosted on Supabase |

## Local deployment

For testing purposes.

### Running the frontend

```console
$ cd modo
$ npm install @radix-ui/react-popover @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-scroll-area @radix-ui/react-switch lucide-react react-easy-crop axios
$ npx shadcn@latest add button card input label switch tabs checkbox popover avatar scroll-area dialog
$ npm run dev
```

### Running the backend

1. Place the project password, supabase URL and supabase key into a local .env file.

```env
PROJECT_PASSWORD=XXX
SUPABASE_URL=XXX
SUPABASE_KEY=XXX
```

2. Run the following.

```console
$ cd back
$ python3 -m venv backenv
$ source backenv/bin/activate
$ pip install -r requirements.txt
$ make 
```