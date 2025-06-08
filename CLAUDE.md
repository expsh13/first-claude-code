# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install`: Install dependencies
- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Watch mode compilation (TypeScript)
- `npm run serve`: Start live server for development

## Project Structure

This is a TypeScript Tetris game with the following architecture:

- `src/index.ts`: Main game logic containing the TetrisGame class
- `index.html`: Game interface with canvas elements
- `style.css`: Game styling and layout
- `dist/`: Compiled JavaScript output

## Game Architecture

The TetrisGame class manages:
- Game board (10x20 grid)
- Tetromino pieces with 7 shapes (I, O, T, S, Z, J, L)
- Collision detection and piece placement
- Line clearing and scoring system
- Game loop with gravity and user input handling

Key methods:
- `createRandomPiece()`: Generates random tetromino pieces
- `isCollision()`: Checks for piece collisions
- `clearLines()`: Removes completed lines and updates score
- `gameLoop()`: Main animation and game state loop