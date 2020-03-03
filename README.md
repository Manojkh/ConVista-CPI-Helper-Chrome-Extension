# ConVista-CPI-Helper-Chrome-Extension
This Chrome Plugin extends the SAP Cloud Platform Integration with some useful features. It includes a button to activate traces and a message sidebar directly in the Integration-Flow-Designer.
As SAP is not well known for it's usability it was time to integrate some features ourselves.
## Special Thanks
Many thanks to ConVista Consulting AG in Cologne, Germany. They supported this idea from the beginning and contributed time and ressources for me to start this project. Also many thanks to open this project to the public under GNU GPLv3. I hope there will be many more people to contribute in the future.
## Installation
You need Google Chrome to install this plugin. I tested it with version 80. I assume that older versions will work too.
The plugin is not yet in the Chrome Store. So you have to add the plugin from the sources.
If you want to install the plugin from sources, clone the repo and add the folder directly to Google Chrome
>- Download or clone the repo from github. Unpack if necessary.
>- In Google Chrome, Navigate to Settings – > Extensions .
>- Enable Developer Mode
>- Click: Load Unpacked Extension and select the folder with the plugin data
## Usage
If you open an Integration Flow, the plugin will automatically add a "Messages" and a "Trace" button in the Integration-Flow-Designer.
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