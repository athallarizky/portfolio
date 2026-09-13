# PHP Smart Semicolon

## Technical Overview

`php-auto-semicolon` is a lightweight editor extension for VS Code and Cursor that brings **Automatic Semicolon Insertion (ASI)** to PHP on file save. Standard formatters (Laravel Pint, PHP-CS-Fixer, `@prettier/plugin-php`) crash when encountering syntax errors, rendering them incapable of fixing missing semicolons. This extension acts as a pre-formatting surgical repair tool, scanning and patching unterminated statements before external formatters trigger.

## Core Architecture & Lexer Engine

```
On Save Event
      │
      ▼
[ Document Snapshot ] ──▶ [ Single-Pass Lexer ] ──▶ [ Insertion Planner ] ──▶ [ VS Code WorkspaceEdit ]
                                 │                             │
                         - Bracket depth stack         - Skip fluent chains
                         - String & comment masks      - Trailing comment split
                         - Heredoc/Nowdoc detector     - Closure vs argument check
```

1. **Zero-Dependency Single-Pass Lexer:** Written in pure TypeScript, the lexer processes ~3,000 lines of PHP code in under 2ms. It avoids heavy AST parsers, operating instead on a character-by-character scan with a state machine to track grammar boundaries.
2. **Fail-Closed Safety Contract:** If the lexer encounters ambiguous syntax, multi-line string boundaries, or unclosed structural blocks, it strictly aborts without modifying the buffer. A false negative simply requires one manual keystroke; a false positive breaks code execution.
3. **Context State Tracking:**
   - **Nesting Stack:** Maintains an active stack of open delimiters (`(`, `[`, `{`). Statements inside function arguments, array literals, or conditional headers never receive premature semicolons.
   - **Literal Masks:** Ignores text inside single quotes, double quotes with variable interpolation (`"hello {$name}"`), line comments (`//`, `#`), block comments (`/* ... */`), and complex heredoc/nowdoc blocks (`<<<EOD`).
   - **HTML/PHP Boundary Awareness:** Safely tracks transitions between inline HTML and PHP tags (`<?php ... ?>`).
4. **Fluent Chain Resolution:** Method chains (`User::query()->where(...)->first()`) evaluate across multiple lines. The lexer tracks leading/trailing `->` tokens and only flags the terminating expression for semicolon insertion.
5. **Closure Discrimination:** Distinguishes variable-assigned closures (`$callback = function () { ... };`) requiring a terminating semicolon from anonymous closures passed directly as parameters (`array_map(function () { ... }, $items)`).
6. **Comment Preservation:** Calculates precise column offsets so that semicolons are injected directly after the statement expression and before any trailing comments on that line (`$timeout = 5000; // milliseconds`).
