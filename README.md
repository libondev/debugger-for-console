# Debugger for Console

## CHANGE
> [Libon](https://github.com/libondev) is now the owner of this extension.

Quickly create console debugging information for multiple languages.

## Features
1. Quickly create console debugging information for multiple languages.
2. Support for custom debugging statements for different languages.
3. Support for inserting debugging statements before and after the current line.
4. Support for removing all debugging statements in the document.
5. Support for commenting and uncommenting all debugging statements in the document.
6. Support for inserting debugging statements in multiple cursors.
7. Supports merging multiple cursors in the same row.
8. Support for updating the latest workbench configuration.


## Installing

This extension is available for free in the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=banlify.debugger-for-console).

## Usage

### keybindings
#### Create the statement before the line
<kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>↑(ArrowUp)</kbd>

![](res/create-statement-before.gif)

#### Create the statement after the line
<kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>↓(ArrowDown)</kbd>

![](res/create-statement-after.gif)

#### Remove all statements on document
<kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>←(Backspace)</kbd>

![](res/remove-all-statements.gif)

#### Comment all statements on document
<kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>/</kbd>

![](res/comment-all-statements.gif)

#### Uncomment all statements on document
<kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>u</kbd>

![](res/uncomment-all-statements.gif)

#### Multi cursor
merge multi cursor in the same row:
![](res/merged-multi-cursor-insert.gif)

multi line cursors:
![](res/multi-cursor-insert.gif)

### command

> \> `debugger-for-console.create`: Insert a debug statement after it

> \> `debugger-for-console.before`: Insert a debug statement before it

> \> `debugger-for-console.remove`: Remove all debugger statements

> \> `debugger-for-console.comment`: Comment all debugger statements

> \> `debugger-for-console.uncomment`: Uncomment all debugger statements

> \> `debugger-for-console.update`: Update latest workbench configuration. (This way, your modifications can take effect immediately without restarting your editor.)


## Configuration

You can customize the statements you want to insert in the Settings.(You can also use this plugin as a simple code snippet)

TIPS: The key of `javascript` | `typescript` | `javascriptreact` | `typescriptreact` | `vue` | `svelte`  is JavaScript.

```json
// preset
{
  // Save the current file after performing the operation
  "debugger-for-console.autoSave": false,

  // What kind of quotation marks to use when inserting statements
  // Some languages that enforce the use of double quotes may not be valid, e.g. go
  "debugger-for-console.quote": "'",

  // Whether to insert emoji
  "debugger-for-console.emoji": true,

  // Relative path depth of files
  "debugger-for-console.fileDepth": 2,

  // Whether to insert the line number
  "debugger-for-console.lineNumber": true,

  // Insert the scope symbols in the debug statement.
  "debugger-for-console.symbols": false,

  // Customize debugging statements for different languages
  "debugger-for-console.wrappers": {
    "php": "var_dump($)",
    "python": "print($)",
    "rust": "println!($)",
    "go": "println($)",
    "csharp": "Console.Log($)",
    "javascript": "console.log($)",
    "default": "console.log($)"
  }
}
```

### examples

```json
{
  "debugger-for-console.wrappers": {
    "javascript": "console.warn($)",
    // OR
    "javascript": "debugger"
  }
}
```

![custom-language-statement](res/custom-language-statement.gif)
