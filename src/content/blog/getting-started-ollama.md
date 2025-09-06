---
date: 2025-09-06
title: Getting Started with Ollama - Run AI Models Locally
description: Ollama is a very powerful tool that allows us to run AI locally on our machines without relying entirely on cloud services. Think of it as the engine for running large language models (LLMs) and other neural networks directly from your own hardware, providing a privacy-focused and potentially faster alternative.
tags: ['ollama']
category: AI
---

Ollama is a very powerful tool that allows us to run AI locally on our machines without relying entirely on cloud services. Think of it as the engine for running large language models (LLMs) and other neural networks directly from your own hardware, providing a privacy-focused and potentially faster alternative.

## A Quick Overview

Ollama provides a way to:

1.  **Download** popular open-source AI models (like Llama, Mistral, etc.) directly usable on your system.
2.  **Run** these models efficiently using just the command line (`ollama run`).
3.  Offer a straightforward **API**, typically accessed via `http://localhost:11434`, allowing you to build custom applications programmatically.

### Run a Model

In order to run a model you need to just run `ollama run <model-name>` this is going to download the model if it is not downloaded yet, and then run it. The result of this command is an interactive chat where you can start interacting with the model in a chat-like way.

:::note
If you want to add multi-line message in the chat, Use triple double quotes (""") to start a multi-line message, and close it with another set of triple quotes.
:::

### Saving and Loading Models/Sessions

When you are running a model and want to save the current chat session, use the command `/save <name-of-session/model>`. This creates a copy of the model and saves the chat messages, system prompt, and configuration. Later, you can reload everything using `/load <name-of-session/model>`.

## `ollama-js`

The Ollama JavaScript library provides the easiest way to integrate your JavaScript project with Ollama.

```sh
npm install ollama
```

This library allows us to interact with Ollama through the REST API.

#### Usage

```javascript
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
const response = await ollama.chat({
  model: MODEL,
  messages: [
    { role: 'system', content: CHEF_PROMPT },
    { role: 'user', content: 'What can you suggest for dinner? ' },
  ],
});

console.log(response.message.content);
// Example output: "How about trying a delicious pasta dish with a homemade tomato sauce?"
```

Or you can use the generate method where you have more control over the configuration of the model, so you can change, for example, the `temperature` of the mode

```javascript
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
const response = await ollama.generate({
  model: MODEL,
  system: CHEF_PROMPT,
  prompt: 'What can you suggest for Lunch?',
  options: {
    temperature: 0.7,
  },
});

console.log(response.response);
// Example output: "How about a fresh salad with grilled chicken, avocado, and a light vinaigrette? It's healthy, easy to prepare, and perfect for lunch!"
```

## Understanding `Modelfile`

A `Modelfile` is the blueprint to create and share models with Ollama.

### What is a Modelfile?

A `Modelfile` is a text file that defines the settings for your Ollama model. It tells Ollama the base model to use, how to adjust parameters like temperature, and even sets a custom system message to guide the model’s responses.

### Basic Modelfile Structure

A basic Modelfile looks like this:

```dockerfile
FROM llama3.2
PARAMETER temperature 1
```

### Key Instructions and Parameters

Here’s a look at some of the most important instructions you’ll find in a `Modelfile`:

- **`temperature`**: Controls the randomness of the model’s responses. Higher values (like 1.0) lead to more creative, but potentially less coherent, results. Lower values (like 0.2)
  make the model more focused and predictable.
- **`num_ctx`**: This sets the “context window”. It's the amount of text the model can “remember” when generating the next token. A larger context window allows the model to understand and respond to longer conversations.
- **`system`**: This sets the model’s “persona”. For example, you could set it to "You are a helpful assistant" or "You are a sarcastic robot."
- **`stop`**: Defines sequences that will stop the model from generating further text.

### Example Modelfile - Mario Assistant

Let’s create a Modelfile for a Mario assistant:

```dockerfile
# This Modelfile creates a Mario assistant
FROM llama3.2
# sets the temperature to 1 [higher is more creative, lower is more coherent]
PARAMETER temperature 1
# sets the context window size to 4096, this controls how many tokens the LLM can use as context to generate the next token
PARAMETER num_ctx 4096
# sets a custom system message to specify the behavior of the chat assistant
SYSTEM You are Mario from Super Mario Bros, acting as an assistant.
```

#### How to Use It

##### Save the Modelfile

Save the above code as a file named `Mario.modelfile` (or any name you like, but use the .modelfile extension).

##### Create the Model

Run the following command in your terminal:

```bash
ollama create mario-assistant -f ./Mario.modelfile
```

##### Run the Model

Now you can start using your Mario assistant:

```bash
ollama run mario-assistant
```

Start chatting!

```text
>>> who are you?
It's-a me, Mario!
I'm-a your assistant! I'm here to help you with anything you need – finding those power-ups, navigating tricky levels, maybe even spotting a sneaky Bowser!
I'm-a super excited to be working with you!  So, what can I do for you today?
Let's-a go! 🍄⭐️
```
