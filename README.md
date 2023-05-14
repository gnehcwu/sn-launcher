# SN Launcher extension

Search and navigate Servicenow menus, search documentation, next experience components with a simple command palette interface.

[![SN Launcher youtube](https://img.youtube.com/vi/1lVAy5y8YnY/0.jpg)](https://www.youtube.com/watch?v=1lVAy5y8YnY)

## Features

- 🔍 Search and navigate Servicenow menus with a simple command palette interface
- 📑 Search Servicenow documentation
- 🥪 Search Servicenow next experience components
- 🔤 Always ready for input
- 🗺️ Mouse free navigation
- 🌙 Dark mode
- 👀 Extended search
  | Token | Match type | Description |
  | --------- | -------------------------- | ------------------------------------ |
  | jscript | fuzzy-match | Items that fuzzy match jscript |
  | =scheme | exact-match | Items that are scheme |
  | 'python | include-match | Items that include python |
  | !ruby | inverse-exact-match | Items that do not include ruby |
  | ^java | prefix-exact-match | Items that start with java |
  | !^earlang | inverse-prefix-exact-match | Items that do not start with earlang |
  | .js$ | suffix-exact-match | Items that end with .js |
  | !.go$ | inverse-suffix-exact-match | Items that do not end with .go |

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2023-present, Cheng Wu
