# Debugger for Console

Effortlessly generate console debugging information for various languages.

## BREAKING CHANGE
From version 0.11.0 onwards, replace the placeholder variable with {VALUE} instead of $.

## Features
1. Swiftly generate console debugging information across multiple languages.
2. Customize debugging statements for different languages.
3. Insert debugging statements before or after the current line.
4. Remove all debugging statements within the document.
5. Comment and uncomment all debugging statements in the document.
6. Insert debugging statements at multiple cursor locations.
7. Merge multiple cursors on the same line.
8. Update the latest workbench configuration.


## Installing

This extension is freely available in the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=banlify.debugger-for-console).

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
Merge multiple cursors on the same line: :
![](res/merged-multi-cursor-insert.gif)

Insert at multiple line cursors:
![](res/multi-cursor-insert.gif)

### command

> \> `debugger-for-console.create`: Insert a debug statement after the current line

> \> `debugger-for-console.before`: Insert a debug statement before the current line

> \> `debugger-for-console.remove`: Remove all debugger statements

> \> `debugger-for-console.comment`: Comment all debugger statements

> \> `debugger-for-console.uncomment`: Uncomment all debugger statements

> \> `debugger-for-console.update`: Update the latest workbench configuration. (This allows your modifications to take effect immediately without restarting your editor.)


## Configuration

You can personalize the statements you wish to insert via the Settings. (This plugin can also serve as a straightforward code snippet tool.)

TIPS: The keys `javascript`, `typescript`, `javascriptreact`, `typescriptreact`, `vue`, and `svelte` all correspond to JavaScript.

// Default Settings
{
  // Automatically save the current file after executing an operation
  "debugger-for-console.autoSave": false,

  // Specify the type of quotation marks to use when inserting statements
  // Note: Some languages that require the use of double quotes may not support this feature, e.g., Go
  "debugger-for-console.quote": "'",

  // Determine whether to insert an emoji
  "debugger-for-console.emoji": true,

  // Set the relative path depth of files
  "debugger-for-console.fileDepth": 2,

  // Determine whether to insert the line number
  "debugger-for-console.lineNumber": true,

  // Insert scope symbols in the debug statement
  "debugger-for-console.symbols": false,

  // Customize debugging statements for different languages
  "debugger-for-console.wrappers": {
    "php": "var_dump({VALUE})",
    "python": "print({VALUE})",
    "rust": "println!({VALUE})",
    "go": "println({VALUE})",
    "csharp": "Console.Log({VALUE})",
    "javascript": "console.log({VALUE})",
    "default": "console.log({VALUE})"
  }
}


### examples

```json
{
  "debugger-for-console.wrappers": {
    "javascript": "console.warn({VALUE})"
    // OR
    // "javascript": "debugger"
    // "javascript": "print({VALUE})"
  }
}
```

![custom-language-statement](res/custom-language-statement.gif)
