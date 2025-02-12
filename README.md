# DefExtractor
A LaTeX-based math augmentations editor.

The introduction video is [here](https://youtu.be/uL4SuGWe5R0).

Detailed research on this tool can be accessed [here](https://tdr.lib.ntu.edu.tw/retrieve/38558148-4aa5-4d90-a8c2-e43e2c99695f/ntu-112-2.pdf).

Additionally, the early version of this tool, MaugVLink, was presented at PacificVis 2024. The full paper can be accessed here : 

https://ieeexplore.ieee.org/abstract/document/10541345

# Introduction
Following mathematical formulas is a critical task in scientific paper reading. Readers would trace the definition and the relation of identifiers in a formula. To enhance the readability, it relies on paper authors to create effective visualization and structured text explanations, which is especially challenging for long formulas.

We propose DefExtractor, an LLM-based tool that assists authors in extracting and visualizing identifier-definition pairs with AI interactively. Given a LaTeX input, DefExtractor identifies the semantics and automatically suggests colored identifiers and definitions based on the LLM response. Users can modify via text prompt or syntax, where AI adapts the edits iteratively.

A technical evaluation showed our pair extraction pipeline outperforms previous model in our target scenario, and a usability study with 12 participants showed that DefExtractor effectively reduced the workloads of authors and shortened editing time compared with a baseline tool.

## Quick Start

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Back end

The manual mode can operate independently on the front end. If you want to use the AI-assisted mode, please install the back end separately. The source code is provided here : 

https://github.com/raymanlee89/MaugEditor_backend