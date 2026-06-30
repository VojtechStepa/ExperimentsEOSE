# Experiments

This repository contains multiple experiments, which are related to [EOSE](https://github.com/VojtechStepa/ExtendedOpenSlides). Each experiment has its own subdirectory and the experiments are independent at each other.

You can execute the experiment by navigating to its root and running

~~~bash
npm run dev
~~~

## Autosave experiment

Aim of this experiment was to decide, if it will possible to implement
auto-save feature, which will store content of a presentation on client site.
Because the presentation can contain images and other possibly large media, we
decide to utilize IndexDB. We assume that these days we will be able to store
[data in order of GB](https://rxdb.info/articles/indexeddb-max-storage-limit.html_
, which should be enough for most of the use cases.

The auto-save feature behaves differently for text and non-text (e.g. pictures
or other files). If user want in its presentation a picture (or some other
file) from local storage, he will firstly need to upload it, during which we
save it into IndexDB. Text is save into the database using action followed by
inaction approach.

We don't attempt to solve deleting of obsoleted content.

## Flexible window experiment

We want to provide user a way, how he can utilize the editor windows. For that we draw inspiration from tmux, concretely these points:

- user can split window horizontally
- user can split window vertically
- user can increase size of the window (at the expense of another window, which will shrink)

Firstly we tried to utilize [react-mosaic](https://github.com/nomcopter/react-mosaic/) library. However they migrating from version 6 to version 7. In time of the experiment, the documentation of version 6 was hard to find and version 7 was only in beta version.
And deservedly as the API provided on examples not yet fully work. This lack of documentation, or mismatch of it with real state prevent out to achieve our goal. Furthermore it seems unwise to depend on such software.

So we move to
[react-resizable-panes](https://react-resizable-panels.vercel.app/examples/the-basics)
library, which does not provide a way how to split pane into two. In order to implement it, we:

- represents the panes state as a binary tree
    - node has id and is one of the state
        - split horizontally
        - split vertically
        - leaf (represents a pane, which is shown)
    - supports operation to split leaf, remove leaf
- base on the tree render the corresponding pane layout
    - each pane has buttons for deleting, horizontal and vertical split

## Import

At start we want allow to user to build its presentation from multiple markdown
files. The idea was that there will be one main file to which will be all other
files included. We decide to utilize picture syntax (so it means include the
file) and generalized it:

- user can define function, which will be responsible for rendering the given
  file (base on extension, e.g. .csv),
- provided to the parser, which than will use it to render files with given extension,
- by default only pictures are rendered.

As this was only experiment, we don't bother to handle all cases, which may production
software need to, for example:

- can user redefined rendering of the pictures
    - we think that why not
- can user call AddMediaType multiple times for same extension
    - this seems dubious usage and may be good idea to prohibit (on run-time
      base) to do that

## Use of AI

During the experiment we use AI tools:

- [claude code](./docs/AI/autosave.md) for [autosave](./Autosave) experiment
- [flexible window](./FlexibleWindowManagament) experiment
- [claude code](./docs/AI/import.md) for [import](./Import) experiment
