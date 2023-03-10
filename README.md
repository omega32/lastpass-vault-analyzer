# LastPass Vault Analyzer 🔍

Is a little multi-platform tool to visualize the partially encrypted XML vault that can be downloaded once logged to your LastPass account. Focused mainly on displaying —and allowing you to search— your exposed URLs. It also shows if your vault was using CBC (Cipher Block Chaining) or not.

## Downloading your "encrypted" vault

1) Log in to lastpass.com (the official site).
2) Open the developer console in the browser and execute the following command (⚠️ you should avoid executing commands you copy from the Internet, unless you really trust the source, or understand what you are doing):
```javascript
fetch("https://lastpass.com/getaccts.php", {method: "POST"})
 .then(response => response.text())
 .then(text => console.log(text.replace(/>/g, ">\n")));
```

3) Copy the full result and save it to a file. The first line should start with "<\?xml" and the last one should end in "<\/response>". If there are extra characters at start or end of the file (copied from the console), manually remove them.

## Security / Safety 📢

⚠️❗ You should never! under no circumstances! input your **master password** here, or anywhere other than the official LastPass website or apps. Doing so, will give away all the information needed to fully decrypt this file and the leaked vault that is now in the hands of the bad guys.

⚠️❗ The fact that some information is not present in this data dump (ex: pbkdf2 iteration count) does not mean that said data is not in the leaked vaults. This is just an XML generated by the REST API of LastPass from the <b>full</b> vault they have stored on their servers.

⚠️❗📢📱 if you use **LastPass Authenticator** and back it up to LastPass, your risk and exposure are considerably increased. If your vault is breached, they will have both, your passwords, as well as your 2-factor seed keys. Those keys are all it's needed to generate TOTP codes. You should then consider changing the 2-factor on your important accounts (remove it and add it again; it will use a new key).

## Screenshots

<img src="./docs/images/01b.png?raw=true" width="650" />

<br/>

<img src="./docs/images/02.png?raw=true" width="650" />

## License

[MIT](LICENSE).

## Building

To project is built using web technologies on top of Wails. Wails uses the native web renderers of the different OSes (doesn't embed Chromium or any other rendering engine) and uses Go for the backend.

### Requirements

- Go (Golang)
- Wails
- Node & npm

### Command

To build a distributable binary for your platform, just execute the following command in the root folder of the project:
```shell
wails build
```

## RESOURCES

- [Security Now 904: Leaving LastPass - How LastPass failed, Steve's next password manager, how to protect yourself](https://www.youtube.com/watch?v=GE7iUgfw8vI) 🎥
- [Security Now 904 show notes](https://www.grc.com/sn/SN-904-Notes.pdf) 📄
- [Ask The Tech Guys: Moving Your Passwords from LastPass](https://www.youtube.com/watch?v=c50T7X4x-7g) 🎥
- [Security Now 905: 1 - LastPass Aftermath, LastPass vault de-obfuscator, LastPass iteration count folly](https://www.youtube.com/watch?v=fTtUhluQiIk) 🎥
- [Security Now 905 show notes](https://www.grc.com/sn/SN-905-Notes.pdf) 📄
