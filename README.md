# ConVista-CPI-Helper-Chrome-Extension
This Chrome Plugin extends the SAP Cloud Platform Integration with some useful features. This includes a button to activate traces and a message sidebar directly in the Integration-Flow-Designer.
Since the SAP is not well known for their usability. It was time to integrate some features that save a lot of time and increase usability.
## Special Thanks
Many thanks to ConVista Consulting AG in Cologne, Germany. They supported this idea from the beginning and contributed time and ressources for me to start this project. Also many thanks to open this project to the public under GNU GPLv3. I hope there will be many more people to contribute in the future.
## Installation
You need Google Chrome to install this plugin. I tested it with version 80. I assume that older versions will work too.
To install the plugin, you have 2 choices:

1. Use the Chrome Extension from the link (recommended).

2. If you want to install the plugin from sources, clone the repo and add the folder directly to Google Chrome
>- In Google Chrome, Navigate to Settings – > Extensions .
>- Enable Developer Mode
>- Click: Load Unpacked Extension and select the folder with the plugin data
## Usage
If you open an Integration Flow, the plugin will automatically add a "Messages" and a "Trace" button in the integration flow designer.
## Contributing
See /docs/CONTRIBUTING.md if you want to take part in this project. As I am a beginner myself, beginners are welcome.
## Todos
### New features:

- Add possibility to show errors, payloads, properties and headers from messages directly in the design screen

### Things to improve:

- Find a better way to get the X-CSRF-Token. Currently there is a background javascript for that.
- Find a better way to detect url changes
- Improve design

If you have any ideas, please write me a message.

## License

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)